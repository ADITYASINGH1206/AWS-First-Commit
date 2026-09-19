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
            <Terminal size={24} color="var(--primary-dark)" />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-pure)' }}>
              System Diagnostics & Execution Inspector
            </h1>
          </div>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Inspect raw diagnostic payloads, security policy verdicts, and agent execution tool loops.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            type="button"
            onClick={copyToClipboard}
            className="cs-btn cs-btn-secondary"
            style={{ fontSize: '0.82rem' }}
          >
            {copied ? <Check size={14} color="var(--primary-dark)" /> : <Copy size={14} />}
            <span>{copied ? 'Copied Full JSON' : 'Copy Full Payload'}</span>
          </button>
        </div>
      </div>

      {/* Cloud Service Architecture Pills */}
      <div
        className="cs-card animate-stagger-1"
        style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          background: 'var(--surface-1)',
          border: '1px solid var(--border-default)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
            <Cloud size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>API Service</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-pure)' }}>
              {isLiveBackend ? 'Live API Connected (:3001)' : 'Simulation Engine Active'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Security Policy Engine</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-pure)' }}>Access Policy Evaluator</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
            <Cpu size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Agent Orchestrator</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-pure)' }}>Autonomous Clinical Agent</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
            <Bell size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Alert Engine</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-pure)' }}>Real-time Mobile Push & SMS</div>
          </div>
        </div>
      </div>

      {/* JSON Inspector with Navigation Tabs */}
      <div className="cs-card animate-stagger-2" style={{ padding: '1.25rem', overflow: 'hidden', background: 'var(--surface-1)', border: '1px solid var(--border-default)' }}>
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveTab('lambda')}
            className={`cs-btn ${activeTab === 'lambda' ? 'cs-btn-primary' : 'cs-btn-secondary'}`}
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}
          >
            API Response ({payload.status || '200 OK'})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cedar')}
            className={`cs-btn ${activeTab === 'cedar' ? 'cs-btn-primary' : 'cs-btn-secondary'}`}
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}
          >
            Security Authorization Verdict
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('strands')}
            className={`cs-btn ${activeTab === 'strands' ? 'cs-btn-primary' : 'cs-btn-secondary'}`}
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}
          >
            Agent Tool Loops ({payload.agent_execution_summary?.tools_invoked?.length || 0} Tools)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sns')}
            className={`cs-btn ${activeTab === 'sns' ? 'cs-btn-primary' : 'cs-btn-secondary'}`}
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}
          >
            Dispatched Alert Receipts ({payload.dispatched_emergency_alerts?.length || 0})
          </button>
        </div>

        {/* Code Content Block */}
        <pre
          style={{
            margin: 0,
            padding: '1.25rem',
            background: 'var(--surface-2)',
            borderRadius: '10px',
            border: '1px solid var(--border-default)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            color: 'var(--text-pure)',
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
