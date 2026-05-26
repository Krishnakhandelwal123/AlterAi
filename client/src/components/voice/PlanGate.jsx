import React from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

const PlanGate = () => (
  <div
    className="voice-fade-up"
    style={{
      background: 'rgba(124,58,237,0.05)',
      border: '1px solid rgba(124,58,237,0.2)',
      borderRadius: 20,
      padding: 40,
      textAlign: 'center'
    }}
  >
    <Lock size={40} strokeWidth={1.2} style={{ color: 'rgba(255,255,255,0.15)', margin: '0 auto' }} />
    <h3
      style={{
        margin: '16px 0 0',
        fontFamily: "'Playfair Display', serif",
        fontStyle: 'italic',
        fontSize: 24,
        fontWeight: 300,
        color: 'rgba(255,255,255,0.6)'
      }}
    >
      Creator Plan Required
    </h3>
    <p
      style={{
        margin: '12px auto 0',
        maxWidth: 400,
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 13,
        lineHeight: 1.7,
        color: 'rgba(255,255,255,0.3)'
      }}
    >
      Voice cloning is available on the Creator plan (₹3,999/mo). Upgrade to clone your voice and let your AI speak exactly like you.
    </p>
    <ul style={{ listStyle: 'none', margin: '20px 0 0', padding: 0 }}>
      {['Clone your exact voice', 'Voice responses in chat', 'Toggle voice on/off anytime'].map((item) => (
        <li
          key={item}
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            color: 'rgba(255,255,255,0.5)',
            marginTop: 8
          }}
        >
          ✓ {item}
        </li>
      ))}
    </ul>
    <Link
      to="/dashboard/billing#plans"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 52,
        marginTop: 24,
        padding: '0 32px',
        borderRadius: 12,
        border: '1px solid rgba(124,58,237,0.4)',
        background: 'rgba(124,58,237,0.15)',
        color: '#C084FC',
        fontFamily: "'DM Mono', monospace",
        fontSize: 12,
        textDecoration: 'none'
      }}
    >
      Upgrade to Creator →
    </Link>
  </div>
);

export default PlanGate;
