import React, { useState } from 'react';
import { billingApi } from '../../api/billingApi.js';
import { useAuth } from '../../hooks/useAuth.js';
import { BILLING_SUBSCRIPTION_UPDATED, useBillingSubscription } from '../../hooks/useBillingSubscription.js';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 'INR 0',
    desc: 'A focused sandbox for testing one clone.',
    featured: false,
    cta: 'Current plan',
    disabled: true,
    border: 'border-white/[0.08]'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'INR 1,599',
    period: '/mo',
    desc: 'For creators sharing a few public clones.',
    featured: true,
    cta: 'Upgrade to Pro',
    disabled: false,
    border: 'border-[rgba(0,212,255,0.35)] shadow-[0_0_24px_rgba(0,212,255,0.08)]'
  },
  {
    id: 'creator',
    name: 'Creator',
    price: 'INR 3,999',
    period: '/mo',
    desc: 'For higher traffic and richer training.',
    featured: false,
    cta: 'Upgrade to Creator',
    disabled: false,
    border: 'border-[rgba(124,58,237,0.35)]'
  }
];

const comparison = [
  ['Active clones', '1', '5', '50'],
  ['Creator messages / month', '200', '7,500', '20,000'],
  ['Messages / visitor / day', '10', '50', '100'],
  ['Text entries', '3', '20', '100'],
  ['Files', '1', '5', '20'],
  ['Q&A pairs', '10', '50', '200'],
  ['Links & RSS', '2', '10', '50'],
  ['Knowledge chunks', '100', '500', '2,000'],
  ['Knowledge uploads', 'Basic', 'Advanced', 'Advanced'],
  ['Hosted clone page', 'Yes', 'Yes', 'Yes'],
  ['Shareable link', 'Yes', 'Yes', 'Yes'],
  ['Analytics', 'Basic', 'Advanced', 'Advanced'],
  ['Voice cloning', 'No', 'No', 'Yes'],
  ['Priority training', 'No', 'Yes', 'Yes'],
  ['Support', 'Community', 'Priority', 'Priority']
];

const loadRazorpayCheckout = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true), { once: true });
      existing.addEventListener('error', () => reject(new Error('Could not load Razorpay Checkout')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Could not load Razorpay Checkout'));
    document.body.appendChild(script);
  });

const Billing = () => {
  const { user } = useAuth();
  const { currentPlan, error: subscriptionError, refreshSubscription } = useBillingSubscription();
  const [busyPlan, setBusyPlan] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const handleUpgrade = async (planId) => {
    setBusyPlan(planId);
    setNotice('');
    setError('');

    try {
      await loadRazorpayCheckout();
      const data = await billingApi.createOrder(planId);

      const checkout = new window.Razorpay({
        key: data.keyId,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'Alter AI',
        description: `${data.plan.name} plan`,
        order_id: data.order.id,
        prefill: {
          name: user?.name || '',
          email: user?.email || ''
        },
        theme: {
          color: planId === 'creator' ? '#7C3AED' : '#00D4FF'
        },
        handler: async (response) => {
          try {
            await billingApi.verifyPayment(response);
            await refreshSubscription({ silent: true });
            window.dispatchEvent(new CustomEvent(BILLING_SUBSCRIPTION_UPDATED));
            setNotice(`Payment verified. ${data.plan.name} plan is active.`);
          } catch (verifyError) {
            setError(verifyError.message || 'Payment verification failed');
          } finally {
            setBusyPlan('');
          }
        },
        modal: {
          ondismiss: () => {
            setBusyPlan('');
          }
        }
      });

      checkout.on('payment.failed', (response) => {
        setBusyPlan('');
        setError(response?.error?.description || 'Payment failed. Please try again.');
      });

      checkout.open();
    } catch (err) {
      setBusyPlan('');
      setError(err.message || 'Could not start payment');
    }
  };

  return (
    <div className="mx-auto max-w-[1000px] space-y-10" data-scroll-section>
      <div className="rounded-[20px] border border-[rgba(0,212,255,0.15)] bg-[rgba(0,212,255,0.05)] px-6 py-6 md:px-10">
        <p className="text-[11px] text-[rgba(0,212,255,0.88)]" style={{ fontFamily: "'DM Mono', monospace" }}>
          You are on the <strong className="font-normal capitalize text-white">{currentPlan}</strong> plan
        </p>
        <div className="mt-3 h-1 max-w-xs overflow-hidden rounded-full bg-white/[0.06]">
          <div className={`h-full rounded-full bg-[rgba(0,212,255,0.88)] ${currentPlan === 'free' ? 'w-[5%]' : currentPlan === 'pro' ? 'w-[55%]' : 'w-full'}`} />
        </div>
        <a href="#plans" className="mt-3 inline-block text-[10px] text-[#C084FC] hover:underline" style={{ fontFamily: "'DM Mono', monospace" }}>
          Compare plans -&gt;
        </a>
        {notice ? (
          <p className="mt-4 text-[11px] text-emerald-300/80" style={{ fontFamily: "'DM Mono', monospace" }}>
            {notice}
          </p>
        ) : null}
        {error || subscriptionError ? (
          <p className="mt-4 text-[11px] text-red-300/80" style={{ fontFamily: "'DM Mono', monospace" }}>
            {error || subscriptionError}
          </p>
        ) : null}
      </div>

      <section id="plans">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-[0.5em] text-[rgba(0,212,255,0.88)]" style={{ fontFamily: "'DM Mono', monospace" }}>
              Plan comparison
            </p>
            <h2 className="mt-2 text-[28px] italic font-light text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              Choose the plan that fits your clone.
            </h2>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((p) => {
            const isCurrent = currentPlan === p.id;
            const disabled = p.disabled || isCurrent || busyPlan;

            return (
              <div
                key={p.name}
                className={`relative flex min-h-[390px] flex-col rounded-2xl border bg-[#0D0D0D] p-7 ${p.border}`}
              >
                {p.featured ? (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full border border-[rgba(0,212,255,0.35)] bg-[#080808] px-3 py-0.5 text-[8px] uppercase tracking-widest text-[rgba(0,212,255,0.88)]" style={{ fontFamily: "'DM Mono', monospace" }}>
                    Most popular
                  </span>
                ) : null}
                <h3 className="text-[18px] italic font-light text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {p.name}
                </h3>
                <p className="mt-4 text-[30px] font-medium leading-none text-white" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {p.price}
                  {p.period ? <span className="ml-1 text-[13px] font-normal text-white/40">{p.period}</span> : null}
                </p>
                <p className="mt-3 min-h-[42px] text-[12px] leading-[1.65] text-white/45" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {p.desc}
                </p>
                <ul className="mt-6 flex-1 space-y-2.5 border-t border-white/[0.06] pt-6 text-[12px] text-white/42" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  <li className="flex gap-2"><span className="text-[rgba(0,212,255,0.88)]">+</span> Hosted clone page</li>
                  <li className="flex gap-2"><span className="text-[rgba(0,212,255,0.88)]">+</span> Monthly creator message cap</li>
                  <li className="flex gap-2"><span className="text-[rgba(0,212,255,0.88)]">+</span> Per-visitor daily protection</li>
                  <li className="flex gap-2"><span className="text-[rgba(0,212,255,0.88)]">+</span> Shareable link</li>
                </ul>
                <button
                  type="button"
                  disabled={Boolean(disabled)}
                  onClick={() => handleUpgrade(p.id)}
                  className={`mt-7 h-12 w-full rounded-[10px] text-[11px] transition ${
                    disabled
                      ? 'cursor-not-allowed border border-white/10 bg-white/[0.04] text-white/25'
                      : p.name === 'Creator'
                        ? 'border border-[rgba(124,58,237,0.4)] bg-[#7C3AED] text-white hover:brightness-110'
                        : 'border border-[rgba(0,212,255,0.45)] bg-[rgba(0,212,255,0.12)] text-[rgba(0,212,255,0.88)] hover:bg-[rgba(0,212,255,0.18)]'
                  }`}
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  {busyPlan === p.id ? 'Opening checkout...' : isCurrent ? 'Current plan' : p.cta}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0D0D0D]">
        <div className="border-b border-white/[0.07] px-5 py-5 md:px-6">
          <p className="text-[9px] uppercase tracking-[0.18em] text-[rgba(0,212,255,0.78)]" style={{ fontFamily: "'DM Mono', monospace" }}>
            Compare plans
          </p>
          <h3 className="mt-2 text-[18px] italic font-light text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Everything included, side by side.
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] table-fixed border-collapse text-left">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="w-[34%] border-r border-white/[0.06] px-5 py-5 text-[9px] font-normal uppercase tracking-[0.14em] text-white/28 md:px-6" style={{ fontFamily: "'DM Mono', monospace" }}>
                  Feature
                </th>
                <th className="border-r border-white/[0.06] px-5 py-5 text-center font-normal">
                  <span className="block text-[18px] italic text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Free</span>
                  <span className="mt-1 block text-[10px] text-white/30" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>INR 0</span>
                </th>
                <th className="border-r border-white/[0.06] bg-[rgba(0,212,255,0.035)] px-5 py-5 text-center font-normal">
                  <span className="block text-[18px] italic text-[rgba(0,212,255,0.9)]" style={{ fontFamily: "'Playfair Display', serif" }}>Pro</span>
                  <span className="mt-1 block text-[10px] text-white/35" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>INR 1,599/mo</span>
                </th>
                <th className="px-5 py-5 text-center font-normal">
                  <span className="block text-[18px] italic text-[#C084FC]" style={{ fontFamily: "'Playfair Display', serif" }}>Creator</span>
                  <span className="mt-1 block text-[10px] text-white/35" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>INR 3,999/mo</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {comparison.map(([feature, free, pro, creator]) => (
                <tr key={feature} className="border-b border-white/[0.055] last:border-b-0">
                  <td className="border-r border-white/[0.06] px-5 py-4 text-[13px] text-white/68 md:px-6" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    {feature}
                  </td>
                  <td className="border-r border-white/[0.06] px-5 py-4 text-center text-[12px] text-white/42" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    {free}
                  </td>
                  <td className="border-r border-white/[0.06] bg-[rgba(0,212,255,0.025)] px-5 py-4 text-center text-[12px] text-white/62" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    {pro}
                  </td>
                  <td className="px-5 py-4 text-center text-[12px] text-white/62" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    {creator}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="rounded-2xl border border-white/[0.06] bg-[#0D0D0D] p-6">
        <h4 className="text-[14px] text-white/80" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          Billing history
        </h4>
        <p className="mt-4 text-[12px] text-white/30" style={{ fontFamily: "'DM Mono', monospace" }}>
          Razorpay receipts will appear in your Razorpay payment email. In-app invoice history can be added after webhook setup.
        </p>
      </div>
    </div>
  );
};

export default Billing;
