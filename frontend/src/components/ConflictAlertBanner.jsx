import React from 'react';
import { AlertOctagon, BellRing, Info, ShieldAlert, ArrowRight } from 'lucide-react';

export default function ConflictAlertBanner({ warnings, onOpenSnsDrawer }) {
  if (!warnings || warnings.length === 0) return null;

  return (
    <div
      className="cs-card animate-fade-slide"
      style={{
        border: '1.5px solid #fca5a5',
        background: '#fff1f2',
        boxShadow: '0 4px 14px rgba(220, 38, 38, 0.08)',
        padding: '1.35rem 1.6rem',
        marginTop: '1.25rem',
        borderRadius: 'var(--radius-md)',
      }}
      role="alert"
      aria-live="assertive"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flex: 1, minWidth: '280px' }}>
          <div
            style={{
              padding: '0.7rem',
              borderRadius: '11px',
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertOctagon size={28} color="#dc2626" />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#991b1b', letterSpacing: '-0.02em' }}>
                CRITICAL DRUG INTERACTION DETECTED
              </h3>
              <span className="cs-badge cs-badge-crimson" style={{ fontSize: '0.72rem' }}>
                Severity: {warnings[0]?.severity || 'High'}
              </span>
            </div>

            {warnings.map((w, idx) => (
              <div key={idx} style={{ marginTop: '0.45rem' }}>
                <p style={{ fontSize: '0.94rem', fontWeight: 600, color: '#1e293b', lineHeight: 1.45 }}>
                  {w.warning}
                </p>

                {w.clinical_guidance && (
                  <p style={{ fontSize: '0.84rem', color: '#7f1d1d', marginTop: '0.4rem', lineHeight: 1.5 }}>
                    <Info size={14} style={{ display: 'inline', marginRight: '5px', verticalAlign: '-2px' }} />
                    <strong>Clinical Guidance:</strong> {w.clinical_guidance}
                  </p>
                )}

                {w.drugs && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.7rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Interacting Medications:
                    </span>
                    {w.drugs.map((d, dIdx) => (
                      <span
                        key={dIdx}
                        style={{
                          fontSize: '0.78rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          padding: '0.25rem 0.6rem',
                          borderRadius: '6px',
                          background: '#fee2e2',
                          color: '#991b1b',
                          border: '1px solid #fca5a5',
                        }}
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Button to Open Real Alert Dispatcher */}
        <button
          type="button"
          onClick={onOpenSnsDrawer}
          className="cs-btn"
          style={{
            borderColor: '#fca5a5',
            background: '#ffffff',
            color: '#b91c1c',
            border: '1.5px solid #fca5a5',
            fontSize: '0.84rem',
            alignSelf: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <BellRing size={16} color="#dc2626" />
          <span>Dispatch Phone Alert</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

