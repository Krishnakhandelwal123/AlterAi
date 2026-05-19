import React from 'react';

const PhoneMockup = ({ data }) => {
  const isLive = data?.clone?.is_public || data?.clone?.status === 'live';

  return (
    <div className="share-phone-wrap">
      <p className="share-label">LIVE PREVIEW</p>
      <div className="share-phone">
        <div className="share-phone-notch" />
        {isLive ? (
          <iframe
            src={`${data.shareUrl}?embed=true&preview=true`}
            title={`${data.clone.name} preview`}
          />
        ) : (
          <div className="share-phone-overlay">Make clone public to preview</div>
        )}
      </div>
      <p className="share-phone-caption">&lt;- How visitors see your clone</p>
    </div>
  );
};

export default PhoneMockup;
