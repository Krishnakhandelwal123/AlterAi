import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const VisibilityToggle = ({ clone, toggling, onToggle, trainingReady, error }) => {
  const isLive = clone?.is_public || clone?.status === 'live';

  return (
    <div className={`share-visibility ${error ? 'share-visibility--warn' : ''}`}>
      <div className="share-visibility-status">
        <span className={`share-visibility-dot ${isLive ? 'is-live' : ''}`} />
        <div>
          <h3>{isLive ? 'Your clone is public' : 'Your clone is private'}</h3>
          <p>{isLive ? 'Anyone with the link can chat' : 'Only you can see this clone'}</p>
        </div>
      </div>

      <button
        type="button"
        className={`share-toggle-btn ${isLive ? 'is-private-action' : 'is-public-action'}`}
        onClick={() => onToggle(!isLive)}
        disabled={toggling}
      >
        {toggling ? (
          <>
            <Loader2 className="share-spin" size={14} />
            Updating...
          </>
        ) : isLive ? (
          'Make Private'
        ) : (
          'Make Public'
        )}
      </button>

      {(!trainingReady || error) && !isLive && (
        <div className="share-training-warning">
          <p>Add training data first</p>
          <span>Your clone needs training data before going public.</span>
          <Link to={`/dashboard/training?cloneId=${clone?.id}`}>Add Training</Link>
        </div>
      )}
    </div>
  );
};

export default VisibilityToggle;
