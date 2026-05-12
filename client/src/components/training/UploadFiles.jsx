import React from 'react';
import { Trash2, Upload } from 'lucide-react';

const PillBadge = ({ children, className }) => (
  <span className={`rounded-full px-2 py-0.5 text-[9px] ${className}`} style={{ fontFamily: "'DM Mono', monospace" }}>
    {children}
  </span>
);

const FileRow = ({ leftBg, leftLabel, leftColor, name, meta, statusPill, statusClass, processing }) => (
  <div className="flex items-center gap-4 border-b border-white/[0.05] py-4 last:border-0">
    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${leftBg}`}>
      <span className={`text-[8px] ${leftColor}`} style={{ fontFamily: "'DM Mono', monospace" }}>
        {leftLabel}
      </span>
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[12px] text-white" style={{ fontFamily: "'DM Mono', monospace" }}>
        {name}
      </p>
      <p className="mt-0.5 text-[9px] text-white/25" style={{ fontFamily: "'DM Mono', monospace" }}>
        {meta}
      </p>
    </div>
    <div className="flex shrink-0 items-center gap-2">
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[8px] ${statusClass}`} style={{ fontFamily: "'DM Mono', monospace" }}>
        {processing ? (
          <>
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
            </span>
            ⟳ Processing
          </>
        ) : (
          <>✓ Trained</>
        )}
      </span>
      <Trash2 className="h-4 w-4 text-white/15" strokeWidth={1.5} aria-hidden />
    </div>
  </div>
);

const UploadFiles = () => (
  <div className="space-y-8">
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.015] px-6 py-16 text-center md:px-10 md:py-16">
      <Upload className="mx-auto h-8 w-8 text-white/25" strokeWidth={1.25} />
      <p className="mt-4 text-[20px] italic font-light text-white/50" style={{ fontFamily: "'Playfair Display', serif" }}>
        Drag & drop your files here
      </p>
      <p className="mt-2 text-[10px] text-white/20" style={{ fontFamily: "'DM Mono', monospace" }}>
        Supports .pdf · .txt · .csv · .docx
      </p>
      <div className="my-5 flex items-center gap-4">
        <div className="h-px flex-1 bg-white/[0.06]" />
        <span className="text-[9px] text-white/15" style={{ fontFamily: "'DM Mono', monospace" }}>
          or
        </span>
        <div className="h-px flex-1 bg-white/[0.06]" />
      </div>
      <span
        className="inline-flex h-10 cursor-default items-center rounded-[10px] border border-[rgba(0,212,255,0.2)] bg-[rgba(0,212,255,0.07)] px-6 text-[11px] text-[rgba(0,212,255,0.88)]"
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        Browse Files
      </span>
    </div>

    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[9px] text-white/25" style={{ fontFamily: "'DM Mono', monospace" }}>
          Uploaded Files
        </p>
        <PillBadge className="bg-[rgba(0,212,255,0.08)] text-[rgba(0,212,255,0.88)]">3 files</PillBadge>
      </div>
      <div className="rounded-xl border border-white/[0.06] bg-[#0D0D0D] px-4">
        <FileRow
          leftBg="bg-red-500/10"
          leftLabel="PDF"
          leftColor="text-red-400"
          name="my_story.pdf"
          meta="2.4 MB · PDF"
          statusClass="bg-emerald-500/10 text-emerald-600"
        />
        <FileRow
          leftBg="bg-[rgba(0,212,255,0.08)]"
          leftLabel="TXT"
          leftColor="text-[rgba(0,212,255,0.88)]"
          name="tweets_export.csv"
          meta="890 KB · CSV"
          statusClass="bg-amber-500/10 text-amber-500"
          processing
        />
        <FileRow
          leftBg="bg-[rgba(0,212,255,0.08)]"
          leftLabel="TXT"
          leftColor="text-[rgba(0,212,255,0.88)]"
          name="notes.txt"
          meta="124 KB · TXT"
          statusClass="bg-emerald-500/10 text-emerald-600"
        />
      </div>
    </div>
  </div>
);

export default UploadFiles;
