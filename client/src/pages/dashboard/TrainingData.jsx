import React, { useState } from 'react';
import TrainingSummaryBar from '../../components/training/TrainingSummaryBar';
import UploadFiles from '../../components/training/UploadFiles';
import PasteText from '../../components/training/PasteText';
import QAPairs from '../../components/training/QAPairs';
import SocialMedia from '../../components/training/SocialMedia';
import LinksRSS from '../../components/training/LinksRSS';
import Documents from '../../components/training/Documents';

const TABS = [
  { id: 'upload', label: 'Upload Files' },
  { id: 'paste', label: 'Paste Text' },
  { id: 'qa', label: 'Q&A Pairs' },
  { id: 'social', label: 'Social Media' },
  { id: 'links', label: 'Links & RSS' },
  { id: 'documents', label: 'Documents' }
];

const TrainingData = () => {
  const [active, setActive] = useState('social');

  const panel =
    active === 'upload' ? (
      <UploadFiles />
    ) : active === 'paste' ? (
      <PasteText />
    ) : active === 'qa' ? (
      <QAPairs />
    ) : active === 'social' ? (
      <SocialMedia />
    ) : active === 'links' ? (
      <LinksRSS />
    ) : (
      <Documents />
    );

  return (
    <div className="mx-auto max-w-5xl pb-4" data-scroll-section>
      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0D0D0D]">
        <div className="flex flex-col gap-6 border-b border-white/[0.06] px-5 py-6 md:flex-row md:items-start md:justify-between md:px-8 md:py-8">
          <div>
            <h1 className="text-[28px] italic font-light text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              Training Data
            </h1>
            <p className="mt-1 text-[10px] text-white/30" style={{ fontFamily: "'DM Mono', monospace" }}>
              Sources & uploads
            </p>
          </div>
          <TrainingSummaryBar barWidthClass="w-[160px]" />
        </div>

        <div className="border-b border-white/[0.06] px-4 md:px-6">
          <nav className="-mb-px flex flex-wrap gap-x-1 gap-y-0">
            {TABS.map((tab) => {
              const isActive = active === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActive(tab.id)}
                  className={`border-b-2 px-3 py-3 text-[10px] transition-colors ${
                    isActive
                      ? 'border-[rgba(0,212,255,0.88)] text-[rgba(0,212,255,0.88)]'
                      : 'border-transparent text-white/40 hover:text-white/[0.65]'
                  }`}
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="px-5 py-8 md:px-8 md:py-10">{panel}</div>

        <div className="grid gap-6 border-t border-white/[0.06] bg-[#0D0D0D] px-5 py-4 md:grid-cols-3 md:items-center md:gap-4 md:px-6 md:py-4 rounded-b-2xl">
          <p className="text-center text-[10px] text-white/30 md:text-left" style={{ fontFamily: "'DM Mono', monospace" }}>
            3 files · 2 texts · 3 Q&As · 2 platforms · 2 links · 2 docs
          </p>
          <TrainingSummaryBar barWidthClass="w-[200px]" variant="footer" align="center" />
          <div className="flex justify-center md:justify-end">
            <span
              className="training-clone-cta-pulse inline-flex h-10 cursor-default items-center rounded-[10px] border border-[rgba(0,212,255,0.4)] bg-[rgba(0,212,255,0.1)] px-5 text-[11px] text-[rgba(0,212,255,0.88)]"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              ✦ Train My Clone →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingData;
