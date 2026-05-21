export const BILLING_PLANS = {
  pro: {
    id: 'pro',
    name: 'Pro',
    amount: 159900,
    currency: 'INR',
    interval: 'monthly'
  },
  creator: {
    id: 'creator',
    name: 'Creator',
    amount: 399900,
    currency: 'INR',
    interval: 'monthly'
  }
};

export const getBillingPlan = (planId) => BILLING_PLANS[String(planId || '').toLowerCase()] || null;

export const getPublicBillingPlans = () =>
  Object.values(BILLING_PLANS).map(({ id, name, amount, currency, interval }) => ({
    id,
    name,
    amount,
    currency,
    interval
  }));
