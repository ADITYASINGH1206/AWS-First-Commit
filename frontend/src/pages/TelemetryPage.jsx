import React, { useState } from 'react';
import { useCareSync } from '../context/CareSyncContext';
import { Terminal, Copy, Check, Cloud, ShieldCheck, Cpu, Database, Bell } from 'lucide-react';

export default function TelemetryPage() {
  const {
    resultData,
    forbiddenError,
    isLiveBackend,
  } = useCareSync();

  const [activeTab, setActiveTab] = useState('lambda'); // 'lambda' | 'cedar' | 'strands' | 'sns'
  const [copied, setCopied] = useState(false);

  const payload = resultData || forbiddenError || { message: 'No execution trace recorded yet. Process an intake note first.' };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-slide">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Terminal size={24} color="var(--cyan-light)" />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-bright)' }}>
              AWS Cloud Telemetry & Execution Inspector
            </h1>
          </div>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Inspect raw JSON execution payloads, Cedar Zero-Trust verdicts, and Strands Agent autonomous tool loops.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            type="button"
            onClick={copyToClipboard}
            className="cs-btn cs-btn-secondary"
            style={{ fontSize: '0.82rem' }}
          >
            {copied ? <Check size={14} color="var(--secondary-light)" /> : <Copy size={14} />}
            <span>{copied ? 'Copied Full JSON' : 'Copy Full Payload'}</span>
          </button>
        </div>
      </div>

      {/* Cloud Service Architecture Pills */}
      <div
        className="cs-card"
        style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(5, 150, 105, 0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary-light)' }}>
            <Cloud size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>API Gateway & Lambda</div>
            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-bright)' }}>
              {isLiveBackend ? 'AWS SAM Local (:3001)' : 'Simulation Engine'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(8, 145, 178, 0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyan-light)' }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Zero-Trust Engine</div>
            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-bright)' }}>AWS Cedar (cedarpy Rust)</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning-light)' }}>
            <Cpu size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Agent Orchestrator</div>
            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-bright)' }}>Strands Agents SDK</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(220, 38, 38, 0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger-light)' }}>
            <Bell size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Notification Topic</div>
            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-bright)' }}>Amazon SNS (SMS + ntfy)</div>
          </div>
        </div>
      </div>

      {/* JSON Inspector with Navigation Tabs */}
      <div className="cs-card" style={{ padding: '1.25rem', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveTab('lambda')}
            className={`cs-btn ${activeTab === 'lambda' ? 'cs-btn-primary' : 'cs-btn-secondary'}`}
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}
          >
            AWS Lambda Payload ({payload.status || '200 OK'})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cedar')}
            className={`cs-btn ${activeTab === 'cedar' ? 'cs-btn-primary' : 'cs-btn-secondary'}`}
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}
          >
            Cedar Policy Verdict
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('strands')}
            className={`cs-btn ${activeTab === 'strands' ? 'cs-btn-primary' : 'cs-btn-secondary'}`}
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}
          >
            Strands Tool Loops ({payload.agent_execution_summary?.tools_invoked?.length || 0} Tools)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sns')}
            className={`cs-btn ${activeTab === 'sns' ? 'cs-btn-primary' : 'cs-btn-secondary'}`}
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}
          >
            SNS Alert Receipts ({payload.dispatched_emergency_alerts?.length || 0})
          </button>
        </div>

        {/* Code Content Block */}
        <pre
          style={{
            margin: 0,
            padding: '1.25rem',
            background: 'var(--surface-0)',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            color: '#a5f3fc',
            lineHeight: 1.55,
            maxHeight: '520px',
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {activeTab === 'lambda' && JSON.stringify(payload, null, 2)}
          {activeTab === 'cedar' && JSON.stringify(payload.authorization || payload.cedar_authorization || { error: 'No authorization metadata' }, null, 2)}
          {activeTab === 'strands' && JSON.stringify(payload.agent_execution_summary || { tools: ['fetch_patient_history', 'check_drug_interaction', 'generate_daily_schedule'], engine: payload.llm_engine }, null, 2)}
          {activeTab === 'sns' && JSON.stringify(payload.dispatched_emergency_alerts || [], null, 2)}
        </pre>
      </div>
    </div>
  );
}
