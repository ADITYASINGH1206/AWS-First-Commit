import React from 'react';
import { useCareSync } from '../context/CareSyncContext';
import CedarSecuritySelector from '../components/CedarSecuritySelector';
import { ShieldCheck, ShieldAlert, ShieldX, Lock, KeyRound, Play } from 'lucide-react';

export default function SecurityPage() {
  const {
    selectedUser,
    setSelectedUser,
    patientId,
    executeProcess,
    forbiddenError,
    resultData,
    isLoading,
  } = useCareSync();

  return (
    <div className="animate-fade-slide">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldCheck size={24} color="var(--cyan-light)" />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-bright)' }}>
              Zero-Trust Security Gate (AWS Cedar Engine)
            </h1>
          </div>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Zero-Trust access control enforced at the entry point using the Cedar Policy Engine (`cedarpy` Rust bindings). Evaluates permissions before reading health records or running LLM loops.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            type="button"
            onClick={() => executeProcess()}
            disabled={isLoading}
            className="cs-btn cs-btn-primary"
            style={{ fontSize: '0.82rem' }}
          >
            <Play size={14} />
            <span>Test Policy Evaluation</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Persona Selector & Policy Engine */}
      <div style={{ marginBottom: '1.75rem' }}>
        <CedarSecuritySelector
          selectedUser={selectedUser}
          setSelectedUser={(user) => {
            setSelectedUser(user);
            executeProcess(user);
          }}
          patientId={patientId}
        />
      </div>

      {/* Zero-Trust Decision Outcome */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Card 1: Authorization Diagnostic Panel */}
        <div className="cs-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <Lock size={18} color="var(--primary-light)" />
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-bright)' }}>
              Live Cedar Evaluation Diagnostics
            </h2>
          </div>

          <div
            style={{
              padding: '1rem',
              background: 'var(--surface-0)',
              borderRadius: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              border: '1px solid var(--border-subtle)',
              marginBottom: '1rem',
            }}
          >
            <div><strong style={{ color: 'var(--text-bright)' }}>Evaluated Principal:</strong> {selectedUser}</div>
            <div><strong style={{ color: 'var(--text-bright)' }}>Action:</strong> Action::"ViewPatientRecord"</div>
            <div><strong style={{ color: 'var(--text-bright)' }}>Target Resource:</strong> Patient::{patientId}</div>
            <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
              <strong style={{ color: 'var(--text-bright)' }}>Verdict:</strong>{' '}
              {forbiddenError ? (
                <span style={{ color: 'var(--danger-light)', fontWeight: 700 }}>Explicit Deny (403 Forbidden)</span>
              ) : resultData ? (
                <span style={{ color: 'var(--secondary-light)', fontWeight: 700 }}>Allow (Authorized Family)</span>
              ) : (
                <span>Pending evaluation...</span>
              )}
            </div>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
            AWS Cedar evaluates policies deterministically in microseconds via Rust WebAssembly/C-bindings. If denied, the request immediately terminates with HTTP 403.
          </p>
        </div>

        {/* Card 2: Zero-Trust Threat Model */}
        <div className="cs-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <KeyRound size={18} color="var(--warning-light)" />
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-bright)' }}>
              Healthcare Zero-Trust Architecture
            </h2>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <span className="cs-pulse-dot" style={{ marginTop: '6px', color: 'var(--secondary-light)' }}></span>
              <span><strong>Principle of Least Privilege:</strong> Only principals explicitly registered in the patient's family relation store are permitted to access EHR records.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <span className="cs-pulse-dot" style={{ marginTop: '6px', color: 'var(--danger-light)' }}></span>
              <span><strong>Attacker Isolation:</strong> Unauthorized callers (like <code>User::Eve</code>) are blocked prior to accessing DynamoDB, LLM prompts, or SNS topics.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <span className="cs-pulse-dot" style={{ marginTop: '6px', color: 'var(--cyan-light)' }}></span>
              <span><strong>Immutable Audit Log:</strong> Every access attempt is logged with timestamp, policy identifier, and principal identity for HIPAA compliance.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Forbidden Alert Demonstration State if Eve is active */}
      {forbiddenError && (
        <div
          className="cs-card"
          style={{
            padding: '1.75rem',
            border: '2px solid var(--danger-border)',
            background: 'rgba(220, 38, 38, 0.08)',
            boxShadow: 'var(--shadow-danger)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '12px',
                background: 'rgba(220, 38, 38, 0.2)',
                border: '1px solid var(--danger-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--danger-light)',
                flexShrink: 0,
              }}
            >
              <ShieldX size={30} />
            </div>

            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fca5a5' }}>
                  403 FORBIDDEN — CEDAR AUTHORIZATION REJECTED
                </h3>
                <span className="cs-badge cs-badge-crimson">
                  <ShieldAlert size={12} />
                  <span>Zero-Trust Interception</span>
                </span>
              </div>

              <p style={{ fontSize: '0.92rem', color: '#fee2e2', marginBottom: '1rem', lineHeight: 1.5 }}>
                {forbiddenError.message || forbiddenError.error}
              </p>

              <div
                style={{
                  padding: '1rem 1.25rem',
                  background: 'var(--surface-0)',
                  borderRadius: '10px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--danger-border)',
                  lineHeight: 1.6,
                }}
              >
                <div><strong style={{ color: 'var(--text-bright)' }}>Caller Attempted:</strong> {selectedUser}</div>
                <div><strong style={{ color: 'var(--text-bright)' }}>Protected Resource:</strong> Patient::{patientId}</div>
                <div><strong style={{ color: 'var(--text-bright)' }}>Enforced Policy:</strong> permit(principal, action == Action::"ViewPatientRecord", resource) when {'{'} principal in resource.authorized_family {'}'};</div>
                <div style={{ color: 'var(--danger-light)', marginTop: '0.4rem', fontWeight: 600 }}>
                  Verdict: Explicit Deny &bull; Caller halted before medical data or agent loop execution
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
