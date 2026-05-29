import React, { useState, useEffect, useRef } from 'react';
import { cloneApi } from '../../api/cloneApi.js';
import { PUBLIC_APP_HOST } from '../../utils/publicLinks.js';

const generateSlug = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 30);

const SlugInput = ({ name = '', value, onChange, onAvailabilityChange }) => {
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState(null);
  const [reason, setReason] = useState(null);
  const [manuallyEdited, setManuallyEdited] = useState(false);
  const debounceRef = useRef(null);
  const prevNameRef = useRef(name);

  // Auto-generate from name if user hasn't manually edited
  useEffect(() => {
    if (!manuallyEdited && name !== prevNameRef.current) {
      const generated = generateSlug(name);
      prevNameRef.current = name;
      if (generated !== value) {
        onChange(generated);
        setAvailable(null);
        setReason(null);
      }
    }
  }, [name, manuallyEdited, value, onChange]);

  // Check availability on value change (debounced)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value || value.length < 3) {
      setAvailable(null);
      setReason(null);
      setChecking(false);
      onAvailabilityChange(false);
      return;
    }

    if (!/^[a-z0-9-]{3,30}$/.test(value)) {
      setAvailable(false);
      setReason('Only lowercase letters, numbers, and hyphens (3-30 chars)');
      setChecking(false);
      onAvailabilityChange(false);
      return;
    }

    setChecking(true);
    setAvailable(null);
    setReason(null);

    debounceRef.current = setTimeout(async () => {
      const result = await cloneApi.checkSlug(value);
      setChecking(false);
      setAvailable(result.available);
      setReason(result.reason || null);
      onAvailabilityChange(result.available === true);
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, onAvailabilityChange]);

  const handleChange = (e) => {
    setManuallyEdited(true);
    onChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
  };

  return (
    <div>
      <div className="flex items-stretch">
        {/* Prefix */}
        <div
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRight: 'none',
            borderRadius: '12px 0 0 12px',
            height: 52,
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            fontFamily: "'DM Mono', monospace",
            fontSize: 12,
            color: 'rgba(255,255,255,0.3)',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            userSelect: 'none'
          }}
        >
          {PUBLIC_APP_HOST}/chat/
        </div>

        {/* Slug input */}
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="yourname"
          maxLength={30}
          autoComplete="off"
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderLeft: 'none',
            borderRadius: '0 12px 12px 0',
            height: 52,
            padding: '0 16px',
            fontFamily: "'DM Mono', monospace",
            fontSize: 14,
            color: '#fff',
            outline: 'none',
            transition: 'border-color 200ms'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'rgba(0,212,255,0.5)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
          }}
        />
      </div>

      {/* Status indicator */}
      <div
        style={{
          marginTop: 6,
          fontFamily: "'DM Mono', monospace",
          fontSize: 9,
          minHeight: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 5
        }}
      >
        {checking && (
          <>
            <span
              style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                border: '1.5px solid rgba(255,255,255,0.2)',
                borderTopColor: 'rgba(255,255,255,0.6)',
                borderRadius: '50%',
                animation: 'slug-spin 0.6s linear infinite'
              }}
            />
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>Checking...</span>
          </>
        )}

        {!checking && available === true && value && (
          <>
            <span style={{ color: '#059669' }}>✓</span>
            <span style={{ color: '#059669' }}>
              {PUBLIC_APP_HOST}/chat/{value} is available
            </span>
          </>
        )}

        {!checking && available === false && value && (
          <>
            <span style={{ color: '#EF4444' }}>✗</span>
            <span style={{ color: '#EF4444' }}>
              {reason || 'This slug is taken. Try another.'}
            </span>
          </>
        )}

        {!checking && available === null && value && value.length >= 3 && (
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>
            Type to check availability…
          </span>
        )}
      </div>

      <style>{`
        @keyframes slug-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SlugInput;
