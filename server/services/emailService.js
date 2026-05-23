import nodemailer from 'nodemailer';

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'alterai.tech@gmail.com';
const FROM_EMAIL = process.env.EMAIL_FROM || process.env.SMTP_USER || 'alterai.tech@gmail.com';
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'AlterAI';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

let transporter = null;

const isEmailEnabled = () =>
  Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

const getTransporter = () => {
  if (!isEmailEnabled()) return null;
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || 'true') !== 'false',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  return transporter;
};

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const formatCurrency = (amount, currency = 'INR') => {
  const numericAmount = Number(amount || 0) / 100;
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency
    }).format(numericAmount);
  } catch (_) {
    return `${currency} ${numericAmount.toFixed(2)}`;
  }
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeZone: 'Asia/Kolkata'
  }).format(new Date(date));
};

const baseTemplate = ({ title, preview, body }) => {
  const safeTitle = escapeHtml(title);
  return `<!doctype html>
<html>
  <body style="margin:0;background:#070708;color:#f7f3ff;font-family:Inter,Arial,sans-serif;">
    <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${escapeHtml(preview || title)}</span>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#070708;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#101012;border:1px solid rgba(255,255,255,0.1);border-radius:18px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 10px;">
                <div style="font-family:Georgia,serif;font-style:italic;font-size:26px;color:#ffffff;letter-spacing:0.08em;">ALTERAI</div>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 28px 30px;">
                <h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;color:#ffffff;">${safeTitle}</h1>
                ${body}
                <p style="margin:28px 0 0;color:rgba(255,255,255,0.48);font-size:13px;line-height:1.6;">
                  Need help? Reply to this email or contact
                  <a href="mailto:${escapeHtml(SUPPORT_EMAIL)}" style="color:#00d4ff;text-decoration:none;">${escapeHtml(SUPPORT_EMAIL)}</a>.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

const sendEmail = async ({ to, subject, preview, html, text }) => {
  if (!to) return { skipped: true, reason: 'missing_recipient' };
  const mailer = getTransporter();

  if (!mailer) {
    // eslint-disable-next-line no-console
    console.warn(`[email] skipped "${subject}" to ${to}; SMTP_USER/SMTP_PASS not configured`);
    return { skipped: true, reason: 'smtp_not_configured' };
  }

  return mailer.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    replyTo: SUPPORT_EMAIL,
    to,
    subject,
    html: baseTemplate({ title: subject, preview, body: html }),
    text
  });
};

export const sendWelcomeEmail = ({ to, name }) => {
  const displayName = name?.trim() || 'there';
  return sendEmail({
    to,
    subject: 'Welcome to AlterAI',
    preview: 'Thanks for registering. Your AI clone workspace is ready.',
    html: `
      <p style="margin:0 0 14px;color:rgba(255,255,255,0.78);font-size:15px;line-height:1.7;">Hi ${escapeHtml(displayName)},</p>
      <p style="margin:0 0 14px;color:rgba(255,255,255,0.72);font-size:15px;line-height:1.7;">
        Thanks for registering with AlterAI. You can now create your AI clone, train it with your content, and share it with visitors.
      </p>
      <p style="margin:0 0 22px;color:rgba(255,255,255,0.72);font-size:15px;line-height:1.7;">
        Start by adding your first clone, uploading training data, and testing the chat experience before sharing your public link.
      </p>
      <a href="${escapeHtml(CLIENT_URL)}/dashboard" style="display:inline-block;background:#00d4ff;color:#001014;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:999px;">Explore AlterAI</a>
    `,
    text: `Hi ${displayName},\n\nThanks for registering with AlterAI. Create your AI clone, train it, and share it with visitors.\n\nExplore: ${CLIENT_URL}/dashboard\n\nSupport: ${SUPPORT_EMAIL}`
  });
};

export const sendSubscriptionSuccessEmail = ({ to, name, plan, amount, currency, paymentId, currentPeriodStart, currentPeriodEnd }) => {
  const planName = String(plan || '').toUpperCase();
  const displayName = name?.trim() || 'there';
  const billedAmount = formatCurrency(amount, currency);

  return sendEmail({
    to,
    subject: `Your AlterAI ${planName} subscription is active`,
    preview: `Payment received. Your ${planName} subscription is now active.`,
    html: `
      <p style="margin:0 0 14px;color:rgba(255,255,255,0.78);font-size:15px;line-height:1.7;">Hi ${escapeHtml(displayName)},</p>
      <p style="margin:0 0 18px;color:rgba(255,255,255,0.72);font-size:15px;line-height:1.7;">
        Your ${escapeHtml(planName)} subscription is active. Thank you for subscribing to AlterAI.
      </p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:rgba(255,255,255,0.04);border-radius:12px;overflow:hidden;">
        <tr><td style="padding:12px 14px;color:rgba(255,255,255,0.48);font-size:13px;">Plan</td><td style="padding:12px 14px;color:#fff;font-size:13px;text-align:right;">${escapeHtml(planName)}</td></tr>
        <tr><td style="padding:12px 14px;color:rgba(255,255,255,0.48);font-size:13px;">Amount paid</td><td style="padding:12px 14px;color:#fff;font-size:13px;text-align:right;">${escapeHtml(billedAmount)}</td></tr>
        <tr><td style="padding:12px 14px;color:rgba(255,255,255,0.48);font-size:13px;">Payment ID</td><td style="padding:12px 14px;color:#fff;font-size:13px;text-align:right;">${escapeHtml(paymentId || 'N/A')}</td></tr>
        <tr><td style="padding:12px 14px;color:rgba(255,255,255,0.48);font-size:13px;">Billing period</td><td style="padding:12px 14px;color:#fff;font-size:13px;text-align:right;">${escapeHtml(formatDate(currentPeriodStart))} - ${escapeHtml(formatDate(currentPeriodEnd))}</td></tr>
      </table>
      <p style="margin:18px 0 22px;color:rgba(255,255,255,0.72);font-size:15px;line-height:1.7;">
        Your upgraded limits are available in your dashboard.
      </p>
      <a href="${escapeHtml(CLIENT_URL)}/dashboard/billing" style="display:inline-block;background:#00d4ff;color:#001014;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:999px;">View billing</a>
    `,
    text: `Hi ${displayName},\n\nYour AlterAI ${planName} subscription is active.\nAmount paid: ${billedAmount}\nPayment ID: ${paymentId || 'N/A'}\nBilling period: ${formatDate(currentPeriodStart)} - ${formatDate(currentPeriodEnd)}\n\nView billing: ${CLIENT_URL}/dashboard/billing\nSupport: ${SUPPORT_EMAIL}`
  });
};

export const sendSubscriptionReminderEmail = ({ to, name, plan, currentPeriodEnd, daysRemaining }) => {
  const planName = String(plan || '').toUpperCase();
  const displayName = name?.trim() || 'there';

  return sendEmail({
    to,
    subject: `Your AlterAI ${planName} subscription ends soon`,
    preview: `Your subscription ends in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}.`,
    html: `
      <p style="margin:0 0 14px;color:rgba(255,255,255,0.78);font-size:15px;line-height:1.7;">Hi ${escapeHtml(displayName)},</p>
      <p style="margin:0 0 18px;color:rgba(255,255,255,0.72);font-size:15px;line-height:1.7;">
        Your ${escapeHtml(planName)} subscription is about to end in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}, on ${escapeHtml(formatDate(currentPeriodEnd))}.
      </p>
      <p style="margin:0 0 22px;color:rgba(255,255,255,0.72);font-size:15px;line-height:1.7;">
        Renew before it ends to keep your upgraded clone, training, and visitor message limits active.
      </p>
      <a href="${escapeHtml(CLIENT_URL)}/dashboard/billing" style="display:inline-block;background:#00d4ff;color:#001014;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:999px;">Renew subscription</a>
    `,
    text: `Hi ${displayName},\n\nYour AlterAI ${planName} subscription ends in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}, on ${formatDate(currentPeriodEnd)}.\n\nRenew: ${CLIENT_URL}/dashboard/billing\nSupport: ${SUPPORT_EMAIL}`
  });
};

export const safeSendEmail = async (sendPromise, label = 'email') => {
  try {
    return await sendPromise;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`[email] ${label} failed:`, error.message);
    return { error };
  }
};
