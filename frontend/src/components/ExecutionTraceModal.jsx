import React, { useState } from 'react';
import { X, Code, Copy, Check, Terminal } from 'lucide-react';

export default function ExecutionTraceModal({ isOpen, onClose, traceData }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !traceData) return null;

  const jsonString = JSON.stringify(traceData, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '850px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-card)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Terminal size={18} color="#06b6d4" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
              AWS Lambda & Strands Agent Execution Trace
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleCopy}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
            >
              {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              style={{ padding: '0.35rem', borderRadius: '50%' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
          <pre
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              lineHeight: 1.5,
              color: '#38bdf8',
              background: 'rgba(0, 0, 0, 0.5)',
              padding: '1.25rem',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {jsonString}
          </pre>
        </div>
      </div>
    </div>
  );
}
