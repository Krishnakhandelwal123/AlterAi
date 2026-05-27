import React from 'react';
import { AlertTriangle, ArrowLeft, CreditCard, Home, RefreshCcw, ServerCrash, ShieldOff } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const SUPPORT_EMAIL = 'alterai.tech@gmail.com';

const pages = {
  'not-found': {
    code: '404',
    eyebrow: 'Page not found',
    title: 'This page is not available.',
    body: 'The link may be wrong, moved, or no longer available.',
    icon: AlertTriangle,
    primaryLabel: 'Go home',
    primaryTo: '/',
    secondaryLabel: 'Contact support',
    secondaryTo: `mailto:${SUPPORT_EMAIL}`
  },
  'payment-failed': {
    code: 'Payment failed',
    eyebrow: 'Checkout interrupted',
    title: 'Your payment did not go through.',
    body: 'No active subscription was added. You can retry from billing or contact support if money was deducted.',
    icon: CreditCard,
    primaryLabel: 'Retry billing',
    primaryTo: '/dashboard/billing',
    secondaryLabel: 'Contact support',
    secondaryTo: `mailto:${SUPPORT_EMAIL}`
  },
  'server-unavailable': {
    code: '503',
    eyebrow: 'Server unavailable',
    title: 'AlterAI is having trouble responding.',
    body: 'The server or API connection is temporarily unavailable. Please refresh after a moment.',
    icon: ServerCrash,
    primaryLabel: 'Try again',
    primaryAction: 'reload',
    secondaryLabel: 'Go home',
    secondaryTo: '/'
  },
  'clone-not-live': {
    code: 'Not live',
    eyebrow: 'Clone not published',
    title: 'This clone is not live yet.',
    body: 'The creator has not published this clone, so visitors cannot chat with it right now.',
    icon: ShieldOff,
    primaryLabel: 'Create your clone',
    primaryTo: '/auth',
    secondaryLabel: 'Go home',
    secondaryTo: '/'
  }
};

const ErrorPage = ({ type = 'not-found', compact = false, message = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const page = pages[type] || pages['not-found'];
  const Icon = page.icon;
  const detail = message || location.state?.reason || location.state?.message || '';

  const handlePrimary = () => {
    if (page.primaryAction === 'reload') {
      window.location.reload();
      return;
    }
    if (page.primaryTo) navigate(page.primaryTo);
  };

  const showBack = window.history.length > 1;

  return (
    <main className={`error-page${compact ? ' is-compact' : ''}`}>
      <section className="error-panel">
        <div className="error-icon">
          <Icon className="h-6 w-6" strokeWidth={1.5} />
        </div>
        <p className="error-eyebrow">{page.eyebrow}</p>
        <h1>{page.title}</h1>
        <p className="error-body">{page.body}</p>
        {detail ? <p className="error-detail">{detail}</p> : null}
        <div className="error-actions">
          <button type="button" onClick={handlePrimary}>
            {page.primaryAction === 'reload' ? <RefreshCcw className="h-4 w-4" /> : <Home className="h-4 w-4" />}
            {page.primaryLabel}
          </button>
          {page.secondaryTo?.startsWith('mailto:') ? (
            <a href={page.secondaryTo}>{page.secondaryLabel}</a>
          ) : (
            <Link to={page.secondaryTo || '/'}>{page.secondaryLabel}</Link>
          )}
        </div>
        {showBack ? (
          <button type="button" className="error-back" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        ) : null}
        <span className="error-code">{page.code}</span>
      </section>

      <style>{`
        .error-page {
          min-height: 100dvh;
          display: grid;
          place-items: center;
          padding: 28px;
          background:
            radial-gradient(circle at 24% 18%, rgba(0,212,255,0.12), transparent 28%),
            radial-gradient(circle at 78% 74%, rgba(124,58,237,0.12), transparent 30%),
            #070708;
          color: #fff;
        }
        .error-page.is-compact {
          min-height: min(720px, calc(100dvh - 96px));
          background: transparent;
          padding: 24px 0;
        }
        .error-panel {
          position: relative;
          width: min(100%, 620px);
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 24px;
          background: rgba(13,13,14,0.86);
          box-shadow: 0 28px 90px rgba(0,0,0,0.46);
          padding: 44px;
        }
        .error-icon {
          width: 54px;
          height: 54px;
          display: grid;
          place-items: center;
          border-radius: 18px;
          border: 1px solid rgba(0,212,255,0.24);
          background: rgba(0,212,255,0.08);
          color: rgba(0,212,255,0.9);
        }
        .error-eyebrow {
          margin: 28px 0 0;
          color: rgba(0,212,255,0.84);
          font: 10px 'DM Mono', monospace;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }
        .error-panel h1 {
          margin: 12px 0 0;
          max-width: 520px;
          color: #fff;
          font: italic 44px/1.04 'Playfair Display', serif;
          letter-spacing: 0;
        }
        .error-body,
        .error-detail {
          max-width: 480px;
          color: rgba(255,255,255,0.54);
          font: 14px/1.75 Inter, system-ui, sans-serif;
        }
        .error-body {
          margin: 18px 0 0;
        }
        .error-detail {
          margin: 14px 0 0;
          padding: 12px 14px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.68);
        }
        .error-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 30px;
        }
        .error-actions button,
        .error-actions a,
        .error-back {
          height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 12px;
          padding: 0 16px;
          text-decoration: none;
          cursor: pointer;
          font: 11px 'DM Mono', monospace;
        }
        .error-actions button {
          border: 1px solid rgba(0,212,255,0.38);
          background: rgba(0,212,255,0.12);
          color: rgba(0,212,255,0.96);
        }
        .error-actions a,
        .error-back {
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.045);
          color: rgba(255,255,255,0.68);
        }
        .error-back {
          margin-top: 18px;
        }
        .error-code {
          position: absolute;
          right: 30px;
          bottom: 20px;
          color: rgba(255,255,255,0.045);
          font: 700 64px/1 Inter, system-ui, sans-serif;
          pointer-events: none;
          text-transform: uppercase;
        }
        @media (max-width: 640px) {
          .error-page {
            padding: 16px;
          }
          .error-panel {
            border-radius: 18px;
            padding: 28px;
          }
          .error-panel h1 {
            font-size: 34px;
          }
          .error-code {
            font-size: 44px;
          }
        }
      `}</style>
    </main>
  );
};

export default ErrorPage;
