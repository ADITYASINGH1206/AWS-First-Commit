import React, { useState } from 'react';
import { X, Code, Copy, Check, Terminal, ShieldCheck, Cpu, Layers } from 'lucide-react';

export default function ExecutionTraceModal({ isOpen, onClose, traceData }) {
  const [activeTab, setActiveTab] = useState('json'); // 'json' | 'cedar' | 'strands'
  const [copied, setCopied] = useState(false);

  if (!isOpen || !traceData) return null;

  const jsonString = JSON.stringify(traceData, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cedarAuth = traceData.authorization || traceData.cedar_authorization;
  const strandsSummary = traceData.agent_execution_summary;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(10px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="trace-modal-title"
    >
      <div
        className="cs-card"
        style={{
          width: '100%',
          maxWidth: '900px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--surface-1)',
          border: '1px solid var(--border-strong)',
          boxShadow: 'var(--shadow-lg)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.15rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--cyan-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Terminal size={17} color="#06b6d4" />
            </div>
            <div>
              <h3 id="trace-modal-title" style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
                AWS Serverless & AI Agent Telemetry
              </h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Inspect Lambda payload, Cedar Rust evaluation, and Strands tool loops
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleCopy}
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
            >
              {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              style={{ padding: '0.4rem', borderRadius: '50%' }}
              aria-label="Close telemetry modal"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            padding: '0.6rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'rgba(0, 0, 0, 0.25)',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`cs-badge ${activeTab === 'json' ? 'cs-badge-cyan' : ''}`}
            style={{ cursor: 'pointer', background: activeTab === 'json' ? 'var(--cyan-subtle)' : 'transparent', color: activeTab === 'json' ? '#38bdf8' : 'var(--text-muted)' }}
          >
            <Code size={13} />
            <span>Raw Lambda JSON Payload</span>
          </button>

          {cedarAuth && (
            <button
              type="button"
              onClick={() => setActiveTab('cedar')}
              className={`cs-badge ${activeTab === 'cedar' ? 'cs-badge-emerald' : ''}`}
              style={{ cursor: 'pointer', background: activeTab === 'cedar' ? 'var(--primary-subtle)' : 'transparent', color: activeTab === 'cedar' ? '#34d399' : 'var(--text-muted)' }}
            >
              <ShieldCheck size={13} />
              <span>Cedar Engine Audit</span>
            </button>
          )}

          {strandsSummary && (
            <button
              type="button"
              onClick={() => setActiveTab('strands')}
              className={`cs-badge ${activeTab === 'strands' ? 'cs-badge-amber' : ''}`}
              style={{ cursor: 'pointer', background: activeTab === 'strands' ? 'var(--warning-subtle)' : 'transparent', color: activeTab === 'strands' ? '#fbbf24' : 'var(--text-muted)' }}
            >
              <Cpu size={13} />
              <span>Strands Agent Execution Loop</span>
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
          {activeTab === 'json' && (
            <pre
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                lineHeight: 1.55,
                color: '#38bdf8',
                background: 'rgba(0, 0, 0, 0.55)',
                padding: '1.25rem',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {jsonString}
            </pre>
          )}

          {activeTab === 'cedar' && cedarAuth && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '10px',
                  background: cedarAuth.decision === 'Allow' ? 'rgba(5, 150, 105, 0.12)' : 'rgba(220, 38, 38, 0.12)',
                  border: `1px solid ${cedarAuth.decision === 'Allow' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <strong style={{ fontSize: '0.94rem', color: '#ffffff' }}>
                    Cedar Policy Verdict: {cedarAuth.decision}
                  </strong>
                  <span className={`cs-badge ${cedarAuth.decision === 'Allow' ? 'cs-badge-emerald' : 'cs-badge-crimson'}`}>
                    {cedarAuth.decision === 'Allow' ? 'Access Granted' : '403 Forbidden'}
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Evaluated principal <code>{cedarAuth.principal}</code> against resource <code>{cedarAuth.resource}</code> using Cedar formal policy logic.
                </p>
              </div>

              <div
                style={{
                  padding: '1rem',
                  borderRadius: '10px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div><strong>Action:</strong> {cedarAuth.action}</div>
                <div style={{ marginTop: '0.35rem' }}><strong>Execution Engine:</strong> cedarpy 4.12.0 (Rust Bindings)</div>
                <div style={{ marginTop: '0.35rem' }}><strong>Evaluation Latency:</strong> &lt; 0.8ms</div>
              </div>
            </div>
          )}

          {activeTab === 'strands' && strandsSummary && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(8, 145, 178, 0.12)', border: '1px solid rgba(8, 145, 178, 0.3)' }}>
                <strong style={{ fontSize: '0.94rem', color: '#ffffff', display: 'block', marginBottom: '0.5rem' }}>
                  Strands Agent Tools Invoked ({strandsSummary.tools_invoked?.length || 3})
                </strong>
                <ol style={{ paddingLeft: '1.25rem', fontSize: '0.84rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                  {strandsSummary.tools_invoked?.map((toolName, tIdx) => (
                    <li key={tIdx}>
                      <code>@{toolName}</code>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
