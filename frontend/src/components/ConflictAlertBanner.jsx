import React from 'react';
import { AlertOctagon, BellRing, Info, ShieldAlert, ArrowRight } from 'lucide-react';

export default function ConflictAlertBanner({ warnings, onOpenSnsDrawer }) {
  if (!warnings || warnings.length === 0) return null;

  return (
    <div
      className="cs-card animate-fade-slide"
      style={{
        border: '1.5px solid var(--danger-border)',
        background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.12) 0%, rgba(15, 23, 42, 0.6) 100%)',
        boxShadow: 'var(--shadow-glow-danger)',
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
              background: 'rgba(220, 38, 38, 0.22)',
              border: '1px solid rgba(220, 38, 38, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertOctagon size={28} color="#ef4444" />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#fca5a5', letterSpacing: '-0.02em' }}>
                CRITICAL DRUG INTERACTION INTERCEPTED
              </h3>
              <span className="cs-badge cs-badge-crimson" style={{ fontSize: '0.72rem' }}>
                Severity: {warnings[0]?.severity || 'High'}
              </span>
            </div>

            {warnings.map((w, idx) => (
              <div key={idx} style={{ marginTop: '0.45rem' }}>
                <p style={{ fontSize: '0.94rem', fontWeight: 600, color: '#ffffff', lineHeight: 1.45 }}>
                  {w.warning}
                </p>

                {w.clinical_guidance && (
                  <p style={{ fontSize: '0.84rem', color: '#fecaca', marginTop: '0.4rem', lineHeight: 1.5 }}>
                    <Info size={14} style={{ display: 'inline', marginRight: '5px', verticalAlign: '-2px' }} />
                    <strong>Clinical Guidance:</strong> {w.clinical_guidance}
                  </p>
                )}

                {w.drugs && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.7rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Clashing Regimen:
                    </span>
                    {w.drugs.map((d, dIdx) => (
                      <span
                        key={dIdx}
                        style={{
                          fontSize: '0.78rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 600,
                          padding: '0.25rem 0.6rem',
                          borderRadius: '6px',
                          background: 'rgba(220, 38, 38, 0.28)',
                          color: '#ffffff',
                          border: '1px solid rgba(220, 38, 38, 0.45)',
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
          className="btn-secondary"
          style={{
            borderColor: 'rgba(220, 38, 38, 0.45)',
            background: 'rgba(220, 38, 38, 0.16)',
            color: '#fecaca',
            fontSize: '0.84rem',
            alignSelf: 'center',
          }}
        >
          <BellRing size={16} color="#ef4444" />
          <span>View Real Phone Alert Dispatch</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
