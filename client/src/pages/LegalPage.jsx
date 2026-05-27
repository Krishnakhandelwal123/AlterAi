import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';

const SUPPORT_EMAIL = 'alterai.tech@gmail.com';
const LAST_UPDATED = 'May 26, 2026';

const pages = {
  terms: {
    title: 'Terms of Service',
    eyebrow: 'Legal',
    intro: 'These terms govern your access to Alter AI, including clone creation, training data, public chat pages, voice features, and paid plans.',
    sections: [
      {
        heading: 'Use of Alter AI',
        body: [
          'You may use Alter AI to create AI clones, upload or connect training sources, publish chat links, embed widgets, and manage plan-based usage.',
          'You are responsible for the content you upload, the clones you publish, and how you share generated responses with visitors.'
        ]
      },
      {
        heading: 'Account Responsibilities',
        body: [
          'You must keep your account access secure and provide accurate account and billing information.',
          'Do not use Alter AI to impersonate others without permission, violate laws, abuse the service, or upload content you do not have rights to use.'
        ]
      },
      {
        heading: 'AI Output',
        body: [
          'AI-generated responses may be incomplete, incorrect, or unsuitable for professional advice. Review important responses before relying on them.',
          'Alter AI may enforce safety, rate, plan, or usage limits to protect the platform and other users.'
        ]
      },
      {
        heading: 'Paid Plans',
        body: [
          'Paid plans unlock additional clone, training, visitor message, and feature limits according to the plan shown at checkout.',
          'Payments are processed through Razorpay. Subscription access starts after payment verification and may be limited, suspended, or ended if payment fails or the plan expires.'
        ]
      },
      {
        heading: 'Termination',
        body: [
          'We may suspend or terminate access if an account violates these terms, creates risk for users, or attempts to misuse the system.',
          'You may stop using Alter AI at any time. Some records may be retained where needed for security, billing, legal, or operational reasons.'
        ]
      }
    ]
  },
  privacy: {
    title: 'Privacy Policy',
    eyebrow: 'Privacy',
    intro: 'This policy explains what Alter AI collects and how it is used to provide authentication, training, chat, billing, email, analytics, and support.',
    sections: [
      {
        heading: 'Information We Collect',
        body: [
          'We collect account details such as email, name, avatar, profile settings, and authentication identifiers from Supabase Auth.',
          'We process clone details, training data, uploaded files, social import data where connected, conversations, visitor identifiers, usage counts, voice samples, billing records, and support messages.'
        ]
      },
      {
        heading: 'How We Use Data',
        body: [
          'We use your data to operate clones, retrieve relevant training context, generate chat responses, provide analytics, enforce plan limits, process payments, send emails, and improve reliability.',
          'Public clones may be accessible to anyone with the shared link after you publish them.'
        ]
      },
      {
        heading: 'Service Providers',
        body: [
          'Alter AI uses third-party services including Supabase, Google Gemini, Razorpay, Gmail SMTP, and optionally ElevenLabs for voice features.',
          'These providers process data as needed to deliver database, auth, AI generation, billing, email, and voice services.'
        ]
      },
      {
        heading: 'Data Controls',
        body: [
          'You can update profile settings, delete clones, remove training data, and disable public sharing from the dashboard.',
          'For account deletion or privacy requests, contact support from the email below.'
        ]
      },
      {
        heading: 'Security',
        body: [
          'We use authentication, row-level access controls, server-side secrets, rate limits, and encrypted token storage where applicable.',
          'No internet service is perfectly secure, so avoid uploading highly sensitive personal, financial, medical, or confidential material unless you are comfortable with the risk.'
        ]
      }
    ]
  },
  refund: {
    title: 'Refund & Cancellation Policy',
    eyebrow: 'Billing',
    intro: 'This policy covers paid Alter AI subscriptions purchased through Razorpay.',
    sections: [
      {
        heading: 'Subscriptions',
        body: [
          'Pro and Creator plans are monthly subscription-style access plans. Features and limits are available after payment is verified.',
          'If your plan period ends or payment fails, your account may return to the Free plan limits.'
        ]
      },
      {
        heading: 'Cancellations',
        body: [
          'You can request cancellation support by emailing us. If self-service cancellation is available through your payment provider or dashboard, use that option first.',
          'Cancellation stops future access renewal but does not automatically delete your account, clones, or training data.'
        ]
      },
      {
        heading: 'Refunds',
        body: [
          'Because AI, training, and infrastructure usage can begin immediately after activation, payments are generally non-refundable once the plan is active.',
          'If you were charged by mistake, paid twice, or could not access the service after payment verification, contact support within 7 days with your account email, plan, amount, and Razorpay payment ID.'
        ]
      },
      {
        heading: 'Failed or Duplicate Payments',
        body: [
          'Failed payments may be handled by Razorpay and your bank. Duplicate successful payments will be reviewed and corrected where verified.',
          'Refunds, when approved, are returned through the original payment method and may take time depending on Razorpay and your bank.'
        ]
      }
    ]
  },
  contact: {
    title: 'Contact & Support',
    eyebrow: 'Support',
    intro: 'Need help with your account, billing, clone setup, email, voice, training data, or deployment questions? Contact Alter AI support.',
    sections: [
      {
        heading: 'Support Email',
        body: [
          `Email us at ${SUPPORT_EMAIL}. Please include your account email, clone name or slug, and screenshots or payment IDs when relevant.`
        ]
      },
      {
        heading: 'Billing Help',
        body: [
          'For payment issues, include your Razorpay payment ID, plan name, amount, date, and the email used during checkout.',
          'For refund or cancellation requests, include the reason for the request and whether the plan is still active.'
        ]
      },
      {
        heading: 'Technical Help',
        body: [
          'For clone, chat, training, embed, or voice issues, describe the steps that caused the problem and include any visible error message.',
          'We prioritize account access, billing, production errors, and paid-plan support.'
        ]
      }
    ]
  }
};

const LegalPage = () => {
  const { page = 'terms' } = useParams();
  const content = pages[page];

  if (!content) return <Navigate to="/legal/terms" replace />;

  return (
    <main className="min-h-screen bg-[#080808] px-6 py-10 text-[#F0EEF8] md:px-10 md:py-14">
      <div className="mx-auto max-w-[860px]">
        <Link to="/" className="inline-flex text-[16px] italic tracking-[0.34em] text-white no-underline" style={{ fontFamily: "'Playfair Display', serif" }}>
          ALTER
        </Link>

        <p className="mt-12 text-[10px] uppercase tracking-[0.4em] text-[rgba(0,212,255,0.88)]" style={{ fontFamily: "'DM Mono', monospace" }}>
          {content.eyebrow}
        </p>
        <h1 className="mt-3 text-[38px] italic font-light leading-tight text-white md:text-[54px]" style={{ fontFamily: "'Playfair Display', serif" }}>
          {content.title}
        </h1>
        <p className="mt-5 max-w-[720px] text-[14px] leading-8 text-white/52" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          {content.intro}
        </p>
        <p className="mt-3 text-[10px] text-white/28" style={{ fontFamily: "'DM Mono', monospace" }}>
          Last updated: {LAST_UPDATED}
        </p>

        <nav className="mt-10 flex flex-wrap gap-2">
          {Object.entries(pages).map(([key, item]) => (
            <Link
              key={key}
              to={`/legal/${key}`}
              className={`rounded-full border px-4 py-2 text-[10px] uppercase tracking-wide no-underline transition ${
                key === page
                  ? 'border-[rgba(0,212,255,0.34)] bg-[rgba(0,212,255,0.1)] text-[rgba(0,212,255,0.9)]'
                  : 'border-white/[0.08] bg-white/[0.03] text-white/42 hover:text-white/70'
              }`}
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              {item.title.replace(' Policy', '')}
            </Link>
          ))}
        </nav>

        <section className="mt-10 space-y-5">
          {content.sections.map((section) => (
            <article key={section.heading} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6">
              <h2 className="text-[22px] italic font-light text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                {section.heading}
              </h2>
              <div className="mt-4 space-y-3">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-[13px] leading-7 text-white/52" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </section>

        <div className="mt-10 rounded-2xl border border-[rgba(0,212,255,0.16)] bg-[rgba(0,212,255,0.05)] p-6">
          <h2 className="text-[18px] italic font-light text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Questions?
          </h2>
          <p className="mt-3 text-[13px] leading-7 text-white/50" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            Email <a className="text-[rgba(0,212,255,0.9)] no-underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> for support, account, billing, privacy, or refund requests.
          </p>
        </div>
      </div>
    </main>
  );
};

export default LegalPage;
