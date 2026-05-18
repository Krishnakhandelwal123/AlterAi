import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import CreateCloneModal from '../../components/clones/CreateCloneModal.jsx';
import { useClones } from '../../hooks/useClones.js';

const CreateClone = () => {
  const navigate = useNavigate();
  const { createClone } = useClones();
  const [toast, setToast] = useState(null);

  const showToast = (msg, color = '#059669') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const handleClose = useCallback(() => {
    navigate('/dashboard/clones');
  }, [navigate]);

  const handleCreate = useCallback(async (formData) => {
    try {
      const result = await createClone(formData);
      if (result?.success) {
        showToast(`Clone "${result.clone?.name || formData.name}" created! 🎉`);
        // Let the modal's own success animation play, then redirect
        setTimeout(() => navigate('/dashboard/clones'), 1800);
      }
      return result;
    } catch (err) {
      console.error('Clone creation error:', err);
      return { success: false, error: err?.message || 'Something went wrong. Please try again.' };
    }
  }, [createClone, navigate]);

  return (
    <>
      <CreateCloneModal onClose={handleClose} onCreate={handleCreate} />

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
            animation: 'toast-up 300ms ease',
            whiteSpace: 'nowrap'
          }}
        >
          {toast.msg}
        </div>,
        document.body
      )}

      <style>{`
        @keyframes toast-up {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </>
  );
};

export default CreateClone;
