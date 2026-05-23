import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useClones } from '../../hooks/useClones.js';
import CreateCloneModal from '../../components/clones/CreateCloneModal.jsx';
import EditCloneModal from '../../components/clones/EditCloneModal.jsx';
import CloneGrid from '../../components/clones/CloneGrid.jsx';

const FILTERS = [
  { key: 'all', label: 'ALL' },
  { key: 'live', label: 'LIVE' },
  { key: 'draft', label: 'DRAFT' },
  { key: 'training', label: 'TRAINING' },
];

const MyClones = () => {
  const { clones, loading, error, filter, setFilter, counts, refetch, createClone, updateClone, deleteClone, publishClone } = useClones();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, color = '#059669') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2500);
  };

  const handleCreate = async (formData) => {
    const result = await createClone(formData);
    return result;
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteClone(deleteTarget);
    setDeleting(false);
    setDeleteTarget(null);
    if (result?.success) showToast('Clone deleted.');
    else showToast(result?.error || 'Failed to delete.', '#EF4444');
  };

  const handlePublish = async (id, publish) => {
    const result = await publishClone(id, publish);
    if (result?.success) showToast(result.message || (publish ? 'Clone is now live!' : 'Clone set to draft.'));
    else if (result?.error) showToast(result.error, '#EF4444');
    return result;
  };

  const handleEdit = (id) => {
    const clone = clones.find((item) => item.id === id);
    if (!clone) {
      showToast('Clone not found. Refresh and try again.', '#EF4444');
      return;
    }
    setEditTarget(clone);
  };

  const handleUpdate = async (id, payload) => {
    const result = await updateClone(id, payload);
    if (result?.success) showToast('Clone updated.');
    else if (result?.error) showToast(result.error, '#EF4444');
    return result;
  };

  const isEmpty = clones.length === 0 && !loading && !error && filter === 'all';

  return (
    <div className="mx-auto max-w-[1100px] space-y-8" data-scroll-section>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-[28px] italic font-light text-white" style={{ fontFamily: "'Playfair Display', serif" }}>My Clones</h2>
          <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-white/30" style={{ fontFamily: "'DM Mono', monospace" }}>Manage your AI personalities</p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex h-10 items-center justify-center rounded-[10px] border border-[rgba(0,212,255,0.45)] bg-[rgba(0,212,255,0.12)] px-5 text-[11px] text-[rgba(0,212,255,0.88)] transition hover:bg-[rgba(0,212,255,0.18)]"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          + Create New Clone
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map(({ key, label }) => {
          const count = counts[key] ?? 0;
          const active = filter === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className="rounded-full px-4 py-1.5 text-[10px] uppercase tracking-wide transition"
              style={{
                fontFamily: "'DM Mono', monospace",
                background: active ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.03)',
                border: active ? '1px solid rgba(0,212,255,0.25)' : '1px solid rgba(255,255,255,0.08)',
                color: active ? 'rgba(0,212,255,0.88)' : 'rgba(255,255,255,0.4)',
              }}
            >
              {label} {count > 0 && <span style={{ color: key === 'live' ? '#22c55e' : 'inherit' }}>({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Grid / Empty state */}
      {isEmpty ? (
        <div className="rounded-2xl border border-dashed border-white/[0.12] bg-[#0D0D0D]/50 px-8 py-16 text-center">
          <Sparkles className="mx-auto h-10 w-10 text-[rgba(0,212,255,0.35)]" strokeWidth={1.25} />
          <p className="mt-6 text-[20px] italic font-light text-white/50" style={{ fontFamily: "'Playfair Display', serif" }}>No clones yet</p>
          <p className="mx-auto mt-2 max-w-md text-[13px] text-white/30" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Create your first AI clone to get started. It only takes a few minutes.</p>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="mt-8 inline-flex items-center gap-2 text-[11px] text-[rgba(0,212,255,0.88)] hover:underline"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            Create Clone →
          </button>
        </div>
      ) : (
        <CloneGrid
          clones={clones}
          loading={loading}
          error={error}
          filter={filter}
          onDelete={(id) => setDeleteTarget(id)}
          onPublish={handlePublish}
          onEdit={handleEdit}
          onShare={(clone) => navigate(`/dashboard/share/${clone.id}`)}
          onRetry={refetch}
        />
      )}

      {/* Create Modal */}
      {showModal && (
        <CreateCloneModal
          onClose={() => setShowModal(false)}
          onCreate={async (data) => {
            const result = await handleCreate(data);
            if (result?.success) {
              setShowModal(false);
              showToast(`Clone "${result.clone.name}" created! 🎉`);
            }
            return result;
          }}
        />
      )}

      {editTarget && (
        <EditCloneModal
          clone={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleUpdate}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#111111', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 14, padding: '28px 32px', maxWidth: 400, width: '100%' }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 22, color: '#fff', marginBottom: 12 }}>Delete this clone?</h3>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: 24 }}>
              This will permanently delete your clone, all training data, and all conversations. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setDeleteTarget(null)} style={{ flex: 1, height: 44, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={handleDeleteConfirm} disabled={deleting} style={{ flex: 1, height: 44, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 10, fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#EF4444', cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.6 : 1 }}>
                {deleting ? 'Deleting...' : 'Delete Clone'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Toast */}
      {toast && createPortal(
        <div style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 99999, background: '#111111', border: `1px solid ${toast.color}33`, borderRadius: 10, padding: '10px 20px', fontFamily: "'DM Mono', monospace", fontSize: 11, color: toast.color, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', animation: 'toast-up 300ms ease', whiteSpace: 'nowrap' }}>
          {toast.msg}
        </div>,
        document.body
      )}

      <style>{`
        @keyframes toast-up { from { opacity:0; transform:translateX(-50%) translateY(12px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        .skeleton-shimmer { background: linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.08), rgba(255,255,255,0.04)); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .clone-card-appear { animation: card-appear 400ms ease forwards; }
        @keyframes card-appear { from { opacity:0; transform:translateY(-16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
};

export default MyClones;
