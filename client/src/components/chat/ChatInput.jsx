import React, { useRef, useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

const ChatInput = ({
  input,
  setInput,
  onSend,
  isStreaming,
  personalityName = 'AI',
  disabled = false,
  remainingMessages = null
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHoveredSend, setIsHoveredSend] = useState(false);
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = '24px';
    const scrollHeight = el.scrollHeight;
    el.style.height = Math.min(Math.max(scrollHeight - 4, 24), 120) + 'px';
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && !isStreaming && input.trim()) {
        onSend();
      }
    }
  };

  const hasText = input.trim().length > 0;
  const isSendDisabled = disabled || isStreaming || !hasText;

  return (
    <div
      style={{
        background: 'rgba(8,8,8,0.95)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '12px 20px',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
        flexShrink: 0,
        zIndex: 50,
        position: 'relative',
        animation: 'fade-up-input 500ms cubic-bezier(0.16, 1, 0.3, 1) 900ms forwards',
        opacity: 0,
        transform: 'translateY(12px)'
      }}
    >
      <div
        style={{
          maxWidth: 640,
          margin: '0 auto',
          position: 'relative'
        }}
      >
        {/* Remaining Messages Warning */}
        {remainingMessages !== null && remainingMessages < 5 && remainingMessages >= 0 && (
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 9,
              color: '#F59E0B',
              textAlign: 'center',
              padding: 6,
              animation: 'fade-in-warn 300ms ease forwards'
            }}
          >
            {remainingMessages} message{remainingMessages !== 1 ? 's' : ''} left today
          </div>
        )}

        {/* Input Container */}
        <div
          className="input-container-box"
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 10,
            background: isFocused ? 'rgba(255,255,255,0.075)' : 'rgba(255,255,255,0.045)',
            border: isFocused ? '1px solid rgba(0,212,255,0.34)' : '1px solid rgba(255,255,255,0.09)',
            borderRadius: 18,
            padding: '11px 10px 11px 16px',
            transition: 'all 300ms ease',
            boxSizing: 'border-box',
            boxShadow: isFocused ? '0 16px 44px rgba(0,0,0,0.28)' : '0 10px 30px rgba(0,0,0,0.18)'
          }}
        >
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled || isStreaming}
            placeholder={`Message ${personalityName}...`}
            rows={1}
            className="chat-textarea-el"
            style={{
              flex: 1,
              minHeight: 24,
              maxHeight: 120,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontFamily: 'Inter, system-ui, sans-serif',
              color: 'rgba(240,238,248,0.85)',
              lineHeight: 1.6,
              padding: 0,
              overflowY: input.split('\n').length > 4 ? 'auto' : 'hidden',
              boxSizing: 'border-box'
            }}
          />

          {/* Send/Loader Button */}
          <button
            type="button"
            onClick={onSend}
            disabled={isSendDisabled}
            onMouseEnter={() => setIsHoveredSend(true)}
            onMouseLeave={() => setIsHoveredSend(false)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxSizing: 'border-box',
              transition: 'all 200ms ease',
              border: isStreaming
                ? '1px solid rgba(0,212,255,0.2)'
                : hasText
                ? '1px solid rgba(0,212,255,0.35)'
                : '1px solid rgba(255,255,255,0.08)',
              background: isStreaming
                ? 'rgba(0,212,255,0.06)'
                : hasText
                ? (isHoveredSend ? 'rgba(0,212,255,0.2)' : 'rgba(0,212,255,0.12)')
                : 'rgba(255,255,255,0.06)',
              cursor: isSendDisabled ? 'not-allowed' : 'pointer',
              boxShadow: hasText && isHoveredSend && !isSendDisabled ? '0 0 12px rgba(0,212,255,0.15)' : 'none'
            }}
            aria-label="Send message"
          >
            {isStreaming ? (
              <div className="btn-spinner" />
            ) : (
              <ArrowUp
                size={16}
                style={{
                  color: hasText ? 'rgba(0,212,255,0.88)' : 'rgba(255,255,255,0.2)',
                  transition: 'color 200ms ease'
                }}
              />
            )}
          </button>
        </div>

        {/* Powered by line */}
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 8,
            color: 'rgba(255,255,255,0.12)',
            textAlign: 'center',
            marginTop: 8,
            letterSpacing: '0.08em'
          }}
        >
          Powered by Alter AI
        </div>
      </div>

      <style>{`
        /* Avoid iOS auto-zoom by enforcing 16px font-size minimum on mobile */
        @media (max-width: 768px) {
          .chat-textarea-el {
            font-size: 16px !important;
          }
          .input-container-box {
            padding: 8px 8px 8px 12px !important;
          }
        }
        
        .btn-spinner {
          width: 14px;
          height: 14px;
          border: 1.5px solid rgba(0,212,255,0.2);
          border-top-color: rgba(0,212,255,0.88);
          border-radius: 50%;
          animation: btn-spin 0.8s linear infinite;
        }

        @keyframes btn-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fade-up-input {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in-warn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ChatInput;
