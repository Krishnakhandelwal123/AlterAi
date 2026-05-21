import crypto from 'crypto';
import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { getBillingPlan, getPublicBillingPlans } from '../config/billingPlans.js';
import { getPlanLimits } from '../config/planLimits.js';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { getUserPlan } from '../utils/planChecker.js';

const router = Router();

const RAZORPAY_API_BASE = 'https://api.razorpay.com/v1';
const ACTIVE_STATUSES = new Set(['active']);

const getRazorpayConfig = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    const error = new Error('Razorpay is not configured');
    error.statusCode = 503;
    throw error;
  }

  return { keyId, keySecret };
};

const razorpayRequest = async (path, options = {}) => {
  const { keyId, keySecret } = getRazorpayConfig();
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

  const res = await fetch(`${RAZORPAY_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    const description = payload?.error?.description || 'Razorpay request failed';
    const error = new Error(
      res.status === 401
        ? 'Razorpay authentication failed. Check that RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are from the same active Razorpay mode.'
        : description
    );
    error.statusCode = res.status;
    throw error;
  }

  return payload;
};

const verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
  const { keySecret } = getRazorpayConfig();
  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(String(signature || ''));

  return (
    expectedBuffer.length === receivedBuffer.length
    && crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  );
};

const verifyWebhookSignature = (rawBody, signature) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    const error = new Error('Razorpay webhook secret is not configured');
    error.statusCode = 503;
    throw error;
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(String(signature || ''));

  return (
    expectedBuffer.length === receivedBuffer.length
    && crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  );
};

const mapSubscription = (row, fallbackPlan = 'free') => {
  const isExpired = row?.current_period_end && new Date(row.current_period_end).getTime() < Date.now();
  const active = row && ACTIVE_STATUSES.has(row.status) && !isExpired;
  const plan = active ? row.plan : fallbackPlan;
  return {
    plan,
    status: active ? row.status : 'inactive',
    currentPeriodEnd: row?.current_period_end || null
  };
};

const missingColumn = (error, column) =>
  error?.code === 'PGRST204' || error?.message?.includes(column);

const activateSubscription = async ({ orderRow, payment, signature = null }) => {
  const now = new Date();
  const currentPeriodEnd = new Date(now);
  currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

  const { error: updateOrderError } = await supabaseAdmin
    .from('payment_orders')
    .update({
      status: 'paid',
      razorpay_payment_id: payment.id,
      ...(signature ? { razorpay_signature: signature } : {}),
      razorpay_payment: payment,
      paid_at: now.toISOString(),
      updated_at: now.toISOString()
    })
    .eq('id', orderRow.id);

  if (updateOrderError) throw updateOrderError;

  const subscriptionPayload = {
    user_id: orderRow.user_id,
    plan: orderRow.plan,
    status: 'active',
    provider: 'razorpay',
    provider_order_id: orderRow.razorpay_order_id,
    provider_payment_id: payment.id,
    current_period_start: now.toISOString(),
    current_period_end: currentPeriodEnd.toISOString(),
    updated_at: now.toISOString()
  };

  let subscriptionResult = await supabaseAdmin
    .from('subscriptions')
    .upsert(subscriptionPayload, { onConflict: 'user_id' })
    .select('*')
    .single();

  if (subscriptionResult.error?.code === '42P10') {
    const updateResult = await supabaseAdmin
      .from('subscriptions')
      .update(subscriptionPayload)
      .eq('user_id', orderRow.user_id)
      .select('*')
      .maybeSingle();

    if (updateResult.error) throw updateResult.error;

    subscriptionResult = updateResult.data
      ? updateResult
      : await supabaseAdmin
        .from('subscriptions')
        .insert(subscriptionPayload)
        .select('*')
        .single();
  }

  if (missingColumn(subscriptionResult.error, 'current_period_end')) {
    const {
      provider,
      provider_order_id: providerOrderId,
      provider_payment_id: providerPaymentId,
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEndValue,
      updated_at: updatedAt,
      ...legacyPayload
    } = subscriptionPayload;
    void provider;
    void providerOrderId;
    void providerPaymentId;
    void currentPeriodStart;
    void currentPeriodEndValue;
    void updatedAt;

    subscriptionResult = await supabaseAdmin
      .from('subscriptions')
      .upsert(legacyPayload, { onConflict: 'user_id' })
      .select('*')
      .single();

    if (subscriptionResult.error?.code === '42P10') {
      const updateResult = await supabaseAdmin
        .from('subscriptions')
        .update(legacyPayload)
        .eq('user_id', orderRow.user_id)
        .select('*')
        .maybeSingle();

      if (updateResult.error) throw updateResult.error;

      subscriptionResult = updateResult.data
        ? updateResult
        : await supabaseAdmin
          .from('subscriptions')
          .insert(legacyPayload)
          .select('*')
          .single();
    }
  }

  if (subscriptionResult.error) throw subscriptionResult.error;
  return subscriptionResult.data;
};

export const billingWebhook = async (req, res, next) => {
  try {
    const signature = req.get('x-razorpay-signature');
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from('');

    if (!verifyWebhookSignature(rawBody, signature)) {
      return res.status(400).json({ success: false, error: 'Invalid webhook signature' });
    }

    const eventId = req.get('x-razorpay-event-id') || null;
    const event = JSON.parse(rawBody.toString('utf8'));

    if (eventId) {
      const { error: eventInsertError } = await supabaseAdmin.from('payment_events').insert({
        event_id: eventId,
        event_type: event.event,
        payload: event
      });

      if (eventInsertError?.code === '23505') {
        return res.json({ success: true, duplicate: true });
      }
      if (eventInsertError) throw eventInsertError;
    }

    if (event.event !== 'payment.captured') {
      return res.json({ success: true, ignored: true });
    }

    const payment = event.payload?.payment?.entity;
    if (!payment?.order_id || !payment?.id) {
      return res.json({ success: true, ignored: true });
    }

    const { data: orderRow, error: orderError } = await supabaseAdmin
      .from('payment_orders')
      .select('*')
      .eq('razorpay_order_id', payment.order_id)
      .maybeSingle();

    if (orderError) throw orderError;
    if (!orderRow || orderRow.status === 'paid') {
      return res.json({ success: true });
    }

    if (
      payment.amount !== orderRow.amount
      || payment.currency !== orderRow.currency
      || payment.status !== 'captured'
    ) {
      return res.status(400).json({ success: false, error: 'Webhook payment does not match order' });
    }

    await activateSubscription({ orderRow, payment });
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
};

router.use(authenticate);

router.get('/plans', async (_req, res, next) => {
  try {
    return res.json({
      success: true,
      plans: getPublicBillingPlans()
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/subscription', async (req, res, next) => {
  try {
    let result = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (missingColumn(result.error, 'current_period_end')) {
      result = await supabaseAdmin
        .from('subscriptions')
        .select('id, user_id, plan, status, created_at')
        .eq('user_id', req.user.id)
        .maybeSingle();
    }

    if (result.error) throw result.error;

    const plan = result.data?.status === 'active' ? result.data.plan : await getUserPlan(req.user.id);
    return res.json({
      success: true,
      subscription: mapSubscription(result.data, plan),
      limits: getPlanLimits(plan)
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/orders', async (req, res, next) => {
  try {
    const plan = getBillingPlan(req.body?.plan);
    if (!plan) {
      return res.status(400).json({ success: false, error: 'Invalid billing plan' });
    }

    const receipt = `alt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const order = await razorpayRequest('/orders', {
      method: 'POST',
      body: JSON.stringify({
        amount: plan.amount,
        currency: plan.currency,
        receipt,
        notes: {
          user_id: req.user.id,
          plan: plan.id
        }
      })
    });

    const { error: insertError } = await supabaseAdmin.from('payment_orders').insert({
      user_id: req.user.id,
      plan: plan.id,
      amount: plan.amount,
      currency: plan.currency,
      status: 'created',
      receipt,
      razorpay_order_id: order.id,
      razorpay_order: order
    });

    if (insertError) throw insertError;

    const { keyId } = getRazorpayConfig();
    return res.status(201).json({
      success: true,
      keyId,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      },
      plan
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/verify', async (req, res, next) => {
  try {
    const {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature
    } = req.body || {};

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ success: false, error: 'Missing Razorpay payment details' });
    }

    if (!verifyRazorpaySignature({ orderId, paymentId, signature })) {
      return res.status(400).json({ success: false, error: 'Payment signature verification failed' });
    }

    const { data: orderRow, error: orderError } = await supabaseAdmin
      .from('payment_orders')
      .select('*')
      .eq('razorpay_order_id', orderId)
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (orderError) throw orderError;
    if (!orderRow) {
      return res.status(404).json({ success: false, error: 'Payment order not found' });
    }

    if (orderRow.status === 'paid') {
      const plan = orderRow.plan;
      return res.json({
        success: true,
        subscription: {
          plan,
          status: 'active'
        },
        limits: getPlanLimits(plan)
      });
    }

    const payment = await razorpayRequest(`/payments/${encodeURIComponent(paymentId)}`);
    if (
      payment.order_id !== orderId
      || payment.amount !== orderRow.amount
      || payment.currency !== orderRow.currency
      || payment.status !== 'captured'
    ) {
      return res.status(400).json({
        success: false,
        error: 'Payment is not captured or does not match this order'
      });
    }

    const subscription = await activateSubscription({ orderRow, payment, signature });

    return res.json({
      success: true,
      subscription: mapSubscription(subscription),
      limits: getPlanLimits(orderRow.plan)
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
