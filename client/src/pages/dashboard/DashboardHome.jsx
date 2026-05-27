import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { FileText, Sparkles, Share2, MessageCircle, Mic2, LineChart, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useClones } from '../../hooks/useClones.js';
import CreateCloneModal from '../../components/clones/CreateCloneModal.jsx';
import robotGif from '../../assets/robot.gif';

const StepCard = ({ step, title, desc, icon: Icon }) => (
  <article className="dashboard-card relative flex flex-col rounded-2xl border border-white/[0.06] bg-[#0D0D0D] p-7">
    <p className="text-[10px] uppercase tracking-[0.2em] text-[rgba(0,212,255,0.88)]" style={{ fontFamily: "'DM Mono', monospace" }}>
      STEP {step}
    </p>
    <div className="mt-4 flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(0,212,255,0.15)] bg-[rgba(0,212,255,0.08)] text-[rgba(0,212,255,0.88)]">
      <Icon className="h-4 w-4" strokeWidth={1.5} />
    </div>
    <h3 className="mt-4 text-[20px] italic font-light leading-snug text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
      {title}
    </h3>
    <p className="mt-3 text-[13px] leading-[1.7] text-white/50" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {desc}
    </p>
    <div className="mt-6 h-px w-10 bg-[rgba(0,212,255,0.55)]" />
  </article>
);

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <article className="dashboard-card flex gap-4 rounded-2xl border border-white/[0.06] bg-[#0D0D0D] p-6">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgba(0,212,255,0.15)] bg-[rgba(0,212,255,0.08)] text-[rgba(0,212,255,0.88)]">
      <Icon className="h-5 w-5" strokeWidth={1.5} />
    </div>
    <div>
      <h4 className="text-[15px] font-medium text-white" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        {title}
      </h4>
      <p className="mt-2 text-[13px] leading-[1.7] text-white/45" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        {desc}
      </p>
    </div>
  </article>
);

const DashboardHome = () => {
  const { user } = useAuth();
  const { createClone, counts, totals } = useClones();
  const navigate = useNavigate();
  const firstName = (user?.name || user?.email?.split('@')[0] || 'friend').split(' ')[0];
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, color = '#059669') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreate = async (formData) => {
    try {
      const result = await createClone(formData);
      if (result?.success) {
        setShowModal(false);
        showToast(`Clone "${result.clone?.name || formData.name}" created! 🎉`);
        setTimeout(() => navigate('/dashboard/clones'), 1200);
      }
      return result;
    } catch (err) {
      console.error('Clone creation error:', err);
      return { success: false, error: err?.message || 'Something went wrong. Please try again.' };
    }
  };

  return (
    <div className="mx-auto max-w-[1100px] space-y-12 md:space-y-16">
      {/* Hero */}
      <section
        className="dashboard-hero relative overflow-hidden rounded-[20px] border border-[rgba(0,212,255,0.15)] px-6 py-10 md:px-12 md:py-12"
        data-scroll-section
      >
        <div className="grid gap-10 lg:grid-cols-[1fr_minmax(200px,340px)] lg:items-center">
          <div>
            <p className="text-[9px] uppercase tracking-[0.5em] text-[rgba(0,212,255,0.88)]" style={{ fontFamily: "'DM Mono', monospace" }}>
              Welcome to Alter AI
            </p>
            <h2 className="mt-4 text-[clamp(1.75rem,4vw,2.25rem)] italic font-light leading-[1.15] text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              Hello, {firstName}. Ready to{' '}
              <span className="text-[rgba(0,212,255,0.88)] not-italic">clone yourself</span>?
            </h2>
            <p className="mt-4 max-w-[520px] text-[14px] leading-[1.8] text-white/55" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              Alter AI lets you create an AI version of yourself that talks to your fans, students, and followers — 24/7, in your voice, with your knowledge. Setup takes about ten minutes. It is free to start.
            </p>
            <p className="mt-5 text-[10px] tracking-wide text-white/30" style={{ fontFamily: "'DM Mono', monospace" }}>
              10 min setup · 24/7 online · Free forever
            </p>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="dashboard-cta-pulse mt-7 inline-flex h-[52px] items-center justify-center gap-2 rounded-xl border border-[rgba(0,212,255,0.5)] bg-[rgba(0,212,255,0.12)] px-8 text-[13px] tracking-[0.04em] text-[rgba(0,212,255,0.88)] transition hover:bg-[rgba(0,212,255,0.18)] hover:shadow-[0_0_40px_rgba(0,212,255,0.12)] cursor-pointer"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              <Sparkles className="h-4 w-4" strokeWidth={1.5} />
              Create Your Clone
            </button>
          </div>

          {/* Optional classes on wrapper: dashboard-hero-robot-wrap--flat = no blend; --multiply = white matte on dark UI */}
          <div
            className="dashboard-hero-robot-wrap relative isolate mx-auto flex w-full max-w-[320px] items-center justify-center rounded-2xl border border-[rgba(0,212,255,0.12)] bg-[#040714] p-4 lg:mx-0"
            aria-hidden
          >
            <img
              src={robotGif}
              alt=""
              className="dashboard-hero-robot-img h-auto max-h-[min(280px,40vh)] w-full object-contain"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section data-scroll-section>
        <p className="text-[9px] uppercase tracking-[0.5em] text-[rgba(0,212,255,0.88)]" style={{ fontFamily: "'DM Mono', monospace" }}>
          How it works
        </p>
        <h3 className="mt-2 text-[24px] italic font-light text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
          Three steps to your AI clone.
        </h3>
        <div className="relative mt-8 grid gap-6 md:grid-cols-3">
          <StepCard
            step="01"
            title="Feed your knowledge"
            desc="Paste your writing, upload documents, or import your tweets. The more you share, the smarter your clone becomes."
            icon={FileText}
          />
          <StepCard
            step="02"
            title="AI trains on you"
            desc="Alter builds a deep personality model from your content — your tone, your style, your expertise. Ready in minutes."
            icon={Sparkles}
          />
          <StepCard
            step="03"
            title="Share your clone"
            desc="Get a public link anyone can visit. Your clone answers questions 24/7 while you focus on what matters."
            icon={Share2}
          />
        </div>
      </section>

      {/* Stats strip */}
      <section
        className="border-y border-white/[0.05] bg-white/[0.02] py-8 md:py-10"
        data-scroll-section
      >
        <div className="mx-auto grid max-w-[900px] grid-cols-2 gap-8 md:grid-cols-4 md:gap-0">
          {[
            { n: counts.all.toLocaleString(), l: 'Total clones' },
            { n: totals.conversations.toLocaleString(), l: 'Conversations' },
            { n: totals.messages.toLocaleString(), l: 'Messages' },
            { n: totals.sources.toLocaleString(), l: 'Training sources' }
          ].map((s, i) => (
            <div key={s.l} className={`text-center ${i > 0 ? 'md:border-l md:border-white/[0.06]' : ''}`}>
              <p className="text-[32px] italic font-light leading-none text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                {s.n}
              </p>
              <p className="mt-2 text-[9px] uppercase tracking-[0.12em] text-white/30" style={{ fontFamily: "'DM Mono', monospace" }}>
                {s.l}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section data-scroll-section>
        <p className="text-[9px] uppercase tracking-[0.5em] text-[rgba(0,212,255,0.88)]" style={{ fontFamily: "'DM Mono', monospace" }}>
          What your clone can do
        </p>
        <h3 className="mt-2 text-[24px] italic font-light text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
          Everything you can do. Minus the sleep.
        </h3>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <FeatureCard
            icon={MessageCircle}
            title="Answer any question"
            desc="Your clone responds to questions about your work, ideas, and expertise — just like you would."
          />
          <FeatureCard
            icon={Mic2}
            title="Speak in your voice"
            desc="With voice cloning enabled, your AI sounds like you. A short voice sample is all it takes to get started."
          />
          <FeatureCard
            icon={LineChart}
            title="Learn and improve"
            desc="Every conversation makes your clone sharper. It learns your patterns and gets more accurate over time."
          />
          <FeatureCard
            icon={LinkIcon}
            title="Work everywhere"
            desc="Embed your clone on your site, share a link, or let fans discover you on the Alter AI network."
          />
        </div>
      </section>

      {/* Final CTA */}
      <section
        className="dashboard-cta-strip rounded-[20px] border border-[rgba(0,212,255,0.12)] px-6 py-10 md:flex md:items-center md:justify-between md:px-12 md:py-12"
        data-scroll-section
      >
        <div>
          <h3 className="text-[28px] italic font-light text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Your clone is waiting to be built.
          </h3>
          <p className="mt-2 text-[11px] text-white/35" style={{ fontFamily: "'DM Mono', monospace" }}>
            It takes 10 minutes.
          </p>
        </div>
        <div className="mt-8 flex flex-col items-start gap-2 md:mt-0 md:items-end">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex h-[52px] items-center justify-center rounded-xl border border-[rgba(0,212,255,0.45)] bg-[rgba(0,212,255,0.14)] px-8 text-[13px] tracking-wide text-[rgba(0,212,255,0.9)] transition hover:bg-[rgba(0,212,255,0.22)] cursor-pointer"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            ✦ Create Your Clone →
          </button>
          <p className="text-[9px] text-white/25" style={{ fontFamily: "'DM Mono', monospace" }}>
            Free forever · No card needed
          </p>
        </div>
      </section>

      {/* Create Clone Modal */}
      {showModal && (
        <CreateCloneModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}

      {/* Toast notification */}
      {toast && createPortal(
        <div
          style={{
            position: 'fixed',
            bottom: 32,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 99999,
            background: '#111111',
            border: `1px solid ${toast.color}33`,
            borderRadius: 10,
            padding: '10px 20px',
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            color: toast.color,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            animation: 'dash-toast-up 300ms ease',
            whiteSpace: 'nowrap'
          }}
        >
          {toast.msg}
        </div>,
        document.body
      )}

      <style>{`
        @keyframes dash-toast-up {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default DashboardHome;
