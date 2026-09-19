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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldCheck size={24} color="var(--primary)" />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-pure)' }}>
              Access Control & Family Permissions
            </h1>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Zero-Trust access control ensures only verified family healthcare proxies can access patient medication records.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            type="button"
            onClick={() => executeProcess()}
            disabled={isLoading}
            className="cs-btn cs-btn-primary"
            style={{ fontSize: '0.84rem' }}
          >
            <Play size={14} />
            <span>Verify Permissions</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Persona Selector */}
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
        {/* Card 1: Diagnostic Panel */}
        <div className="cs-card" style={{ padding: '1.5rem', background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <Lock size={18} color="var(--primary)" />
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-pure)' }}>
              Authorization Verdict & Diagnostics
            </h2>
          </div>

          <div
            style={{
              padding: '1rem',
              background: 'var(--surface-2)',
              borderRadius: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.82rem',
              color: 'var(--text-main)',
              lineHeight: 1.6,
              border: '1px solid var(--border-default)',
              marginBottom: '1rem',
            }}
          >
            <div><strong>Active Caller:</strong> {selectedUser}</div>
            <div><strong>Target Record:</strong> {patientId}</div>
            <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-default)' }}>
              <strong>Access Decision:</strong>{' '}
              {forbiddenError ? (
                <span style={{ color: 'var(--danger)', fontWeight: 700 }}>Denied (403 Forbidden)</span>
              ) : resultData ? (
                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Allowed (Authorized Healthcare Proxy)</span>
              ) : (
                <span>Checking credentials...</span>
              )}
            </div>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Access policies evaluate relationships in real-time. Unauthorized attempts are rejected immediately before any medical history can be accessed.
          </p>
        </div>

        {/* Card 2: Privacy Architecture */}
        <div className="cs-card" style={{ padding: '1.5rem', background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <KeyRound size={18} color="var(--cyan)" />
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-pure)' }}>
              Patient Healthcare Privacy
            </h2>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              <span className="cs-pulse-dot" style={{ marginTop: '6px', color: 'var(--primary)' }}></span>
              <span><strong>Explicit Family Authorization:</strong> Only designated family members registered in the patient's record can view or modify medications.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              <span className="cs-pulse-dot" style={{ marginTop: '6px', color: 'var(--danger)' }}></span>
              <span><strong>Strict Isolation:</strong> Unregistered callers (like Eve) are completely blocked before data reading or analysis can occur.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              <span className="cs-pulse-dot" style={{ marginTop: '6px', color: 'var(--cyan)' }}></span>
              <span><strong>Audit Compliance:</strong> Every permission check is logged with caller identity and timestamp.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Forbidden Alert State when Eve is active */}
      {forbiddenError && (
        <div
          className="cs-card"
          style={{
            padding: '1.75rem',
            border: '2px solid var(--danger-border)',
            background: 'var(--danger-subtle)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#ffffff',
                border: '1px solid var(--danger-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--danger)',
                flexShrink: 0,
              }}
            >
              <ShieldX size={28} />
            </div>

            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--danger)' }}>
                  403 FORBIDDEN — ACCESS REJECTED
                </h3>
                <span className="cs-badge cs-badge-crimson">
                  <ShieldAlert size={12} />
                  <span>Unauthorized Caller</span>
                </span>
              </div>

              <p style={{ fontSize: '0.92rem', color: '#7f1d1d', marginBottom: '1rem', lineHeight: 1.5 }}>
                {forbiddenError.message || forbiddenError.error}
              </p>

              <div
                style={{
                  padding: '0.85rem 1.15rem',
                  background: '#ffffff',
                  borderRadius: '8px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  color: 'var(--text-main)',
                  border: '1px solid var(--danger-border)',
                  lineHeight: 1.6,
                }}
              >
                <div><strong>Caller Attempted:</strong> {selectedUser}</div>
                <div><strong>Target Patient:</strong> {patientId}</div>
                <div style={{ color: 'var(--danger)', marginTop: '0.35rem', fontWeight: 600 }}>
                  Decision: Deny &bull; Caller is not in the patient's authorized family member list
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
