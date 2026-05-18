import React, { useState } from 'react';

const StarterQuestions = ({ topics = [], onSelect }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // Generate questions based on topics
  const generateQuestions = () => {
    const list = [];
    const hasAI = topics.some(t => t.toLowerCase().includes('ai') || t.toLowerCase().includes('artificial'));
    const hasCoding = topics.some(t => t.toLowerCase().includes('code') || t.toLowerCase().includes('coding') || t.toLowerCase().includes('dev') || t.toLowerCase().includes('program'));

    if (hasAI) {
      list.push("How do you use AI daily?");
    }
    if (hasCoding) {
      list.push("What stack do you use?");
    }

    list.push("Tell me about yourself");
    list.push("What are you working on?");

    // Pad if fewer than 4 questions
    if (list.length < 4) {
      if (!list.includes("What's your best advice?")) list.push("What's your best advice?");
    }
    // Take exactly 4 questions
    return list.slice(0, 4);
  };

  const questions = generateQuestions();

  return (
    <div
      style={{
        padding: '16px 20px 8px',
        animation: 'fade-up-starter 500ms cubic-bezier(0.16, 1, 0.3, 1) 400ms forwards',
        opacity: 0,
        transform: 'translateY(12px)',
        zIndex: 1
      }}
    >
      <div
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 8,
          color: 'rgba(255,255,255,0.2)',
          letterSpacing: '0.1em',
          marginBottom: 10,
          textAlign: 'center'
        }}
      >
        TRY ASKING:
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 8
        }}
      >
        {questions.map((q, idx) => {
          const isHovered = hoveredIdx === idx;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelect(q)}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: isHovered ? 'rgba(0,212,255,0.05)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isHovered ? 'rgba(0,212,255,0.25)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 999,
                padding: '8px 16px',
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                color: isHovered ? 'rgba(0,212,255,0.8)' : 'rgba(255,255,255,0.45)',
                cursor: 'pointer',
                transition: 'all 200ms ease',
                transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
                whiteSpace: 'nowrap'
              }}
            >
              <span
                style={{
                  color: isHovered ? 'rgba(0,212,255,0.8)' : 'rgba(255,255,255,0.2)',
                  transition: 'color 200ms ease'
                }}
              >
                +
              </span>
              {q}
            </button>
          );
        })}
      </div>

      <style>{`
        @keyframes fade-up-starter {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default StarterQuestions;
