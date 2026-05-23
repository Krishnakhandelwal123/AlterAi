import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { safeSendEmail, sendSubscriptionReminderEmail } from '../services/emailService.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_REMINDER_DAYS = [7, 3, 1];

let intervalId = null;
let warnedMissingPeriodEnd = false;

const getReminderDays = () => {
  const raw = process.env.SUBSCRIPTION_REMINDER_DAYS || '';
  const parsed = raw
    .split(',')
    .map((day) => Number(day.trim()))
    .filter((day) => Number.isInteger(day) && day > 0);
  return parsed.length > 0 ? parsed : DEFAULT_REMINDER_DAYS;
};

const getWindow = (daysFromNow) => {
  const start = new Date(Date.now() + daysFromNow * DAY_MS);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start.getTime() + DAY_MS);
  return { start: start.toISOString(), end: end.toISOString() };
};

const shouldSkipDuplicate = async ({ subscriptionId, eventType }) => {
  const { error } = await supabaseAdmin.from('email_events').insert({
    subscription_id: subscriptionId,
    event_type: eventType
  });

  if (!error) return false;
  if (error.code === '23505') return true;

  // If the migration has not been applied yet, do not risk daily duplicate reminders.
  // eslint-disable-next-line no-console
  console.warn('[email] subscription reminder skipped; email_events table is not ready:', error.message);
  return true;
};

export const runSubscriptionReminderScan = async () => {
  if (process.env.EMAIL_REMINDERS_ENABLED === 'false') return;

  for (const daysRemaining of getReminderDays()) {
    const { start, end } = getWindow(daysRemaining);
    const { data: subscriptions, error } = await supabaseAdmin
      .from('subscriptions')
      .select('id, user_id, plan, current_period_end')
      .eq('status', 'active')
      .gte('current_period_end', start)
      .lt('current_period_end', end);

    if (error) {
      if (error?.code === '42703' || error?.message?.includes('current_period_end')) {
        if (!warnedMissingPeriodEnd) {
          warnedMissingPeriodEnd = true;
          // eslint-disable-next-line no-console
          console.warn('[email] subscription reminders are paused; run server/sql/billing_razorpay.sql so subscriptions.current_period_end exists.');
        }
        return;
      }
      // eslint-disable-next-line no-console
      console.error('[email] subscription reminder scan failed:', error.message);
      continue;
    }

    for (const subscription of subscriptions || []) {
      const eventType = `subscription_reminder_${daysRemaining}d`;
      const skip = await shouldSkipDuplicate({ subscriptionId: subscription.id, eventType });
      if (skip) continue;

      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('email, name')
        .eq('id', subscription.user_id)
        .maybeSingle();

      if (userError || !user?.email) {
        // eslint-disable-next-line no-console
        console.warn('[email] subscription reminder user lookup failed:', userError?.message || subscription.user_id);
        continue;
      }

      await safeSendEmail(
        sendSubscriptionReminderEmail({
          to: user.email,
          name: user.name,
          plan: subscription.plan,
          currentPeriodEnd: subscription.current_period_end,
          daysRemaining
        }),
        `subscription reminder ${daysRemaining}d`
      );
    }
  }
};

export const startSubscriptionReminderJob = () => {
  if (process.env.NODE_ENV === 'test') return null;
  if (intervalId) return intervalId;

  const intervalHours = Number(process.env.SUBSCRIPTION_REMINDER_INTERVAL_HOURS || 24);
  const intervalMs = Math.max(1, intervalHours) * 60 * 60 * 1000;

  setTimeout(() => {
    void runSubscriptionReminderScan();
  }, 30 * 1000);

  intervalId = setInterval(() => {
    void runSubscriptionReminderScan();
  }, intervalMs);

  return intervalId;
};
