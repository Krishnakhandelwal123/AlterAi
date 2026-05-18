import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Trash2, Sparkles, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import TrainingSummaryBar from '../../components/training/TrainingSummaryBar';
import SocialMedia from '../../components/training/SocialMedia';

const TABS = [
  { id: 'upload', label: 'Upload Files' },
  { id: 'paste', label: 'Paste Text' },
  { id: 'qa', label: 'Q&A Pairs' },
  { id: 'social', label: 'Social Media' },
  { id: 'links', label: 'Links & RSS' }
];

const TrainingData = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const { session } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [active, setActive] = useState('upload');
  const [personalityId, setPersonalityId] = useState('');
  const [plan, setPlan] = useState('free');
  const [limits, setLimits] = useState(null);
  const [usage, setUsage] = useState(null);
  const [trainingItems, setTrainingItems] = useState([]);
  const [socialConnections, setSocialConnections] = useState([]);
  const [strengthPercent, setStrengthPercent] = useState(0);
  const [busy, setBusy] = useState(false);
  const [tabStatus, setTabStatus] = useState({});
  const [bootError, setBootError] = useState('');

  // Clone selector state
  const [allClones, setAllClones] = useState([]);
  const [cloneSelectorOpen, setCloneSelectorOpen] = useState(false);
  const [selectedClone, setSelectedClone] = useState(null);

  const [textContent, setTextContent] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [mediumUsername, setMediumUsername] = useState('');
  const [uploadFile, setUploadFile] = useState(null);


  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${session?.access_token || ''}`
    }),
    [session?.access_token]
  );

  const fetchStats = async (id) => {
    const res = await fetch(`${API_URL}/api/training/stats/${id}`, { headers: authHeaders });
    const payload = await res.json();
    if (!res.ok || !payload.success) {
      throw new Error(payload.error || 'Failed to fetch training stats');
    }
    setPlan(payload.data.plan);
    setLimits(payload.data.limits);
    setUsage(payload.data.usage);
    setTrainingItems(payload.data.trainingItems || []);
    setSocialConnections(payload.data.socialConnections || []);
    setStrengthPercent(payload.data.strengthPercent || 0);
  };

  const fetchAllClones = async () => {
    try {
      const res = await fetch(`${API_URL}/api/clone/list?status=all`, { headers: { ...authHeaders, 'Content-Type': 'application/json' } });
      const payload = await res.json();
      if (res.ok && payload.success) {
        setAllClones(payload.clones || []);
        return payload.clones || [];
      }
    } catch (e) {
      console.error('Failed to fetch clones list:', e);
    }
    return [];
  };

  const setActiveStatus = (message) => {
    setTabStatus((prev) => ({ ...prev, [active]: message || '' }));
  };

  const runAction = async (fn, successMessage) => {
    try {
      setBusy(true);
      setActiveStatus('');
      await fn();
      if (personalityId) {
        // Add a small delay to allow the server to finish DB operations if needed
        await new Promise(resolve => setTimeout(resolve, 500));
        await fetchStats(personalityId);
      }
      setActiveStatus(successMessage);
    } catch (error) {
      console.error('Action error:', error);
      setActiveStatus(error.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  // Bootstrap: resolve which clone to use for training
  useEffect(() => {
    if (personalityId) return;

    const boot = async () => {
      if (!session?.access_token) return;
      try {
        setBusy(true);
        setBootError('');

        // Fetch user's clones list
        const clones = await fetchAllClones();

        // Check if a specific cloneId was passed via URL
        const urlCloneId = searchParams.get('cloneId');

        if (urlCloneId) {
          // Validate the clone belongs to this user
          const match = clones.find(c => c.id === urlCloneId);
          if (match) {
            setPersonalityId(match.id);
            setSelectedClone(match);
            await fetchStats(match.id);
            return;
          }
        }

        // No specific clone requested — use first clone if available
        if (clones.length > 0) {
          const first = clones[0];
          setPersonalityId(first.id);
          setSelectedClone(first);
          setSearchParams({ cloneId: first.id }, { replace: true });
          await fetchStats(first.id);
          return;
        }

        // No clones at all — show empty state
        setBootError('NO_CLONES');
      } catch (error) {
        setBootError(error.message || 'Failed to initialize training');
      } finally {
        setBusy(false);
      }
    };
    void boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.access_token]);

  const handleCloneSwitch = async (clone) => {
    setCloneSelectorOpen(false);
    if (clone.id === personalityId) return;
    setPersonalityId(clone.id);
    setSelectedClone(clone);
    setSearchParams({ cloneId: clone.id }, { replace: true });
    setTrainingItems([]);
    setStrengthPercent(0);
    try {
      setBusy(true);
      await fetchStats(clone.id);
    } catch (e) {
      setTabStatus((prev) => ({ ...prev, upload: e.message || 'Failed to load stats' }));
    } finally {
      setBusy(false);
    }
  };

  const createText = async () => {
    if (!textContent.trim()) throw new Error('Paste text first');
    const res = await fetch(`${API_URL}/api/training/text`, {
      method: 'POST',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ personalityId, content: textContent })
    });
    const payload = await res.json();
    if (!res.ok || !payload.success) throw new Error(payload.error || 'Text training failed');
    setTextContent('');
  };

  const createQa = async () => {
    const res = await fetch(`${API_URL}/api/training/qa`, {
      method: 'POST',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ personalityId, question, answer })
    });
    const payload = await res.json();
    if (!res.ok || !payload.success) throw new Error(payload.error || 'Q&A training failed');
    setQuestion('');
    setAnswer('');
  };

  const createLink = async () => {
    const res = await fetch(`${API_URL}/api/training/link`, {
      method: 'POST',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ personalityId, url: linkUrl })
    });
    const payload = await res.json();
    if (!res.ok || !payload.success) throw new Error(payload.error || 'Link import failed');
    setLinkUrl('');
  };

  const createMedium = async () => {
    const res = await fetch(`${API_URL}/api/training/medium`, {
      method: 'POST',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ personalityId, username: mediumUsername })
    });
    const payload = await res.json();
    if (!res.ok || !payload.success) throw new Error(payload.error || 'Medium import failed');
    setMediumUsername('');
  };

  const createFile = async (fileArg) => {
    const fileToUpload = fileArg || uploadFile;
    if (!fileToUpload) throw new Error('Select a file first');
    const form = new FormData();
    form.append('personalityId', personalityId);
    form.append('file', fileToUpload);

    const res = await fetch(`${API_URL}/api/training/file`, {
      method: 'POST',
      headers: authHeaders,
      body: form
    });

    const payload = await res.json();
    if (!res.ok || !payload.success) throw new Error(payload.error || 'File upload failed');

    setUploadFile(null);
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => { input.value = ''; });
  };

  const removeItem = async (id) => {
    const res = await fetch(`${API_URL}/api/training/${id}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    const payload = await res.json();
    if (!res.ok || !payload.success) throw new Error(payload.error || 'Delete failed');
  };

  const connectSocial = async (platform, handle, accessToken) => {
    if (!accessToken) throw new Error('Access token is required');
    const res = await fetch(`${API_URL}/api/training/social/connect`, {
      method: 'POST',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ personalityId, platform, handle, accessToken })
    });
    const payload = await res.json();
    if (!res.ok || !payload.success) throw new Error(payload.error || 'Connection failed');
  };

  const syncSocial = async (platform) => {
    const res = await fetch(`${API_URL}/api/training/social/sync/${platform}`, {
      method: 'POST',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ personalityId })
    });
    const payload = await res.json();
    if (!res.ok || !payload.success) throw new Error(payload.error || 'Sync failed');
  };

  const disconnectSocial = async (platform) => {
    const res = await fetch(`${API_URL}/api/training/social/${platform}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    const payload = await res.json();
    if (!res.ok || !payload.success) throw new Error(payload.error || 'Disconnect failed');
  };

  // ── EMPTY STATE: No clones yet ──
  if (bootError === 'NO_CLONES') {
    return (
      <div className="mx-auto max-w-5xl pb-4" data-scroll-section>
        <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0D0D0D]">
          <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
            <Sparkles className="h-12 w-12 text-[rgba(0,212,255,0.3)]" strokeWidth={1.25} />
            <h2
              className="mt-6 text-[24px] italic font-light text-white/60"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              No clones to train yet
            </h2>
            <p
              className="mt-2 max-w-md text-[13px] text-white/30"
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            >
              Create your first AI clone, then come back here to train it with your content, documents, and social media.
            </p>
            <button
              type="button"
              onClick={() => navigate('/dashboard/clones')}
              className="mt-8 inline-flex h-11 items-center gap-2 rounded-[10px] border border-[rgba(0,212,255,0.45)] bg-[rgba(0,212,255,0.12)] px-6 text-[11px] text-[rgba(0,212,255,0.88)] transition hover:bg-[rgba(0,212,255,0.18)]"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              + Create Your First Clone
            </button>
          </div>
        </div>
      </div>
    );
  }

  const FilteredItemList = ({ sourceTypes }) => (
    <div className="mt-6 space-y-2">
      {(trainingItems || [])
        .filter((item) => sourceTypes.includes(item.source_type))
        .map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2">
            <div>
              <p className="text-[11px] text-white" style={{ fontFamily: "'DM Mono', monospace" }}>
                {item.source_type} · {item.file_name || `${item.char_count || 0} chars`}
              </p>
              <p className="text-[9px] text-white/50" style={{ fontFamily: "'DM Mono', monospace" }}>
                {item.status} {item.error_message ? `· ${item.error_message}` : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={() => runAction(() => removeItem(item.id), 'Training item deleted')}
              className="cursor-pointer rounded-md border border-white/20 p-1 text-white/60 hover:text-white"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
    </div>
  );

  const panel =
    active === 'upload' ? (
      <div>
        <input
          type="file"
          onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
          className="block w-full cursor-pointer text-sm text-white/80 file:mr-4 file:cursor-pointer file:rounded-lg file:border file:border-cyan-400/40 file:bg-cyan-400/10 file:px-4 file:py-2 file:text-cyan-300"
          style={{ fontFamily: "'DM Mono', monospace" }}
        />
        <button
          type="button"
          onClick={() => runAction(createFile, 'File uploaded and queued for training')}
          disabled={busy || !personalityId || !uploadFile}
          className="mt-3 cursor-pointer rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-[11px] text-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          {busy ? 'Uploading...' : 'Upload File'}
        </button>
        <FilteredItemList sourceTypes={['file']} />
      </div>
    ) : active === 'paste' ? (
      <div>
        <textarea
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          className="min-h-[220px] w-full rounded-xl border border-white/10 bg-black/20 p-4 text-white"
          style={{ fontFamily: "'DM Mono', monospace" }}
          placeholder="Paste text to train your clone..."
        />
        <button
          type="button"
          onClick={() => runAction(createText, 'Text saved and training started')}
          disabled={busy || !personalityId}
          className="mt-3 cursor-pointer rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-[11px] text-cyan-300 disabled:opacity-40"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Save Text
        </button>
        <FilteredItemList sourceTypes={['text']} />
      </div>
    ) : active === 'qa' ? (
      <div className="space-y-3">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="h-11 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-white"
          style={{ fontFamily: "'DM Mono', monospace" }}
          placeholder="Question"
        />
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="min-h-[150px] w-full rounded-lg border border-white/10 bg-black/20 p-3 text-white"
          style={{ fontFamily: "'DM Mono', monospace" }}
          placeholder="Your answer"
        />
        <button
          type="button"
          onClick={() => runAction(createQa, 'Q&A saved and training started')}
          disabled={busy || !personalityId}
          className="cursor-pointer rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-[11px] text-cyan-300 disabled:opacity-40"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Add Q&A
        </button>
        <FilteredItemList sourceTypes={['qa']} />
      </div>
    ) : active === 'social' ? (
      <SocialMedia
        connections={socialConnections}
        busy={busy}
        onConnect={(platform, handle, accessToken) =>
          runAction(() => connectSocial(platform, handle, accessToken), `${platform} connected`)
        }
        onSync={(platform) => runAction(() => syncSocial(platform), `${platform} sync started`)}
        onDisconnect={(platform) => runAction(() => disconnectSocial(platform), `${platform} disconnected`)}
      />
    ) : active === 'links' ? (
      <div className="space-y-3">
        <input
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          className="h-11 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-white"
          style={{ fontFamily: "'DM Mono', monospace" }}
          placeholder="https://example.com/article"
        />
        <button
          type="button"
          onClick={() => runAction(createLink, 'Link import started')}
          disabled={busy || !personalityId}
          className="cursor-pointer rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-[11px] text-cyan-300 disabled:opacity-40"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Import URL
        </button>
        <input
          value={mediumUsername}
          onChange={(e) => setMediumUsername(e.target.value)}
          className="h-11 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-white"
          style={{ fontFamily: "'DM Mono', monospace" }}
          placeholder="Medium username"
        />
        <button
          type="button"
          onClick={() => runAction(createMedium, 'Medium import started')}
          disabled={busy || !personalityId}
          className="cursor-pointer rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-[11px] text-cyan-300 disabled:opacity-40"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Import Medium
        </button>
        <FilteredItemList sourceTypes={['link', 'medium', 'rss']} />
      </div>
    ) : (
      <FilteredItemList sourceTypes={['text', 'qa', 'file', 'link', 'medium', 'rss', 'twitter', 'reddit', 'github', 'linkedin', 'notion', 'instagram']} />
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

            {/* Clone Selector Dropdown */}
            {allClones.length > 1 && (
              <div className="relative mt-3" style={{ zIndex: 20 }}>
                <button
                  type="button"
                  onClick={() => setCloneSelectorOpen(o => !o)}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] text-white/70 transition hover:border-[rgba(0,212,255,0.3)] hover:text-white"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: selectedClone?.avatar_color || '#00D4FF',
                      flexShrink: 0
                    }}
                  />
                  {selectedClone?.name || 'Select clone'}
                  <ChevronDown className="h-3 w-3" style={{ opacity: 0.5 }} />
                </button>

                {cloneSelectorOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      left: 0,
                      background: '#111111',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 10,
                      padding: 6,
                      minWidth: 220,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                      zIndex: 30
                    }}
                  >
                    {allClones.map((clone) => (
                      <button
                        key={clone.id}
                        type="button"
                        onClick={() => handleCloneSwitch(clone)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          width: '100%',
                          background: clone.id === personalityId ? 'rgba(0,212,255,0.08)' : 'transparent',
                          border: 'none',
                          borderRadius: 7,
                          padding: '7px 10px',
                          fontFamily: "'DM Mono', monospace",
                          fontSize: 11,
                          color: clone.id === personalityId ? 'rgba(0,212,255,0.88)' : 'rgba(255,255,255,0.6)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background 150ms'
                        }}
                        onMouseEnter={(e) => {
                          if (clone.id !== personalityId) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        }}
                        onMouseLeave={(e) => {
                          if (clone.id !== personalityId) e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: clone.avatar_color || '#00D4FF',
                            flexShrink: 0
                          }}
                        />
                        {clone.name}
                        {clone.id === personalityId && <span style={{ marginLeft: 'auto', fontSize: 9, opacity: 0.5 }}>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Show which clone is being trained */}
            {selectedClone && allClones.length <= 1 && (
              <div
                className="mt-2 inline-flex items-center gap-2 text-[10px] text-white/40"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: selectedClone.avatar_color || '#00D4FF'
                  }}
                />
                Training: {selectedClone.name}
              </div>
            )}
          </div>
          <TrainingSummaryBar barWidthClass="w-[160px]" percent={strengthPercent} />
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
                  className={`cursor-pointer border-b-2 px-3 py-3 text-[10px] transition-colors ${
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

        <div className="px-5 py-8 md:px-8 md:py-10">
          {tabStatus[active] ? (
            <p className="mb-3 text-[10px] text-cyan-300" style={{ fontFamily: "'DM Mono', monospace" }}>
              {tabStatus[active]}
            </p>
          ) : null}
          {panel}
        </div>

        <div className="grid gap-6 border-t border-white/[0.06] bg-[#0D0D0D] px-5 py-4 md:grid-cols-3 md:items-center md:gap-4 md:px-6 md:py-4 rounded-b-2xl">
          <p className="text-center text-[10px] text-white/30 md:text-left" style={{ fontFamily: "'DM Mono', monospace" }}>
            Plan: {plan} · Text {usage?.textEntries || 0}/{limits?.maxTextEntries || '-'} · Files {usage?.files || 0}/
            {limits?.maxFiles || '-'} · Q&A {usage?.qaPairs || 0}/{limits?.maxQAPairs || '-'} · Links {usage?.links || 0}/
            {limits?.maxLinks || '-'} · Social {socialConnections.length}
          </p>
          <TrainingSummaryBar
            barWidthClass="w-[200px]"
            variant="footer"
            align="center"
            labelClass={busy ? 'opacity-80' : ''}
            percent={strengthPercent}
          />
          <div className="flex justify-center md:justify-end">
            <span
              className="training-clone-cta-pulse inline-flex h-10 cursor-default items-center rounded-[10px] border border-[rgba(0,212,255,0.4)] bg-[rgba(0,212,255,0.1)] px-5 text-[11px] text-[rgba(0,212,255,0.88)]"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              ✦ Strength {strengthPercent}% {busy ? '· Working...' : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingData;
