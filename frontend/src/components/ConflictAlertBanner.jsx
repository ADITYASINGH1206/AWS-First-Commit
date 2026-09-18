import React from 'react';
import { AlertTriangle, BellRing, ShieldAlert, HeartPulse, Info } from 'lucide-react';

export default function ConflictAlertBanner({ warnings, onOpenSnsDrawer }) {
  if (!warnings || warnings.length === 0) return null;

  return (
    <div
      className="glass-panel animate-fade-in"
      style={{
        border: '1.5px solid var(--border-danger)',
        background: 'rgba(239, 68, 68, 0.08)',
        boxShadow: 'var(--shadow-danger)',
        padding: '1.25rem 1.5rem',
        marginTop: '1.25rem',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flex: 1 }}>
          <div
            style={{
              padding: '0.65rem',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertTriangle size={26} color="#ef4444" />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fca5a5' }}>
                CRITICAL DRUG INTERACTION DETECTED
              </h3>
              <span className="badge badge-crimson" style={{ fontSize: '0.7rem' }}>
                Severity: {warnings[0]?.severity || 'High'}
              </span>
            </div>

            {warnings.map((w, idx) => (
              <div key={idx} style={{ marginTop: '0.5rem' }}>
                <p style={{ fontSize: '0.92rem', fontWeight: 600, color: '#fef2f2' }}>
                  {w.warning}
                </p>

                {w.clinical_guidance && (
                  <p style={{ fontSize: '0.82rem', color: '#fecaca', marginTop: '0.35rem', lineHeight: 1.5 }}>
                    <Info size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
                    <strong>Clinical Guidance:</strong> {w.clinical_guidance}
                  </p>
                )}

                {w.drugs && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                    {w.drugs.map((d, dIdx) => (
                      <span
                        key={dIdx}
                        style={{
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          background: 'rgba(239, 68, 68, 0.25)',
                          color: '#ffffff',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                        }}
                      >
                        💊 {d}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SNS Emergency Dispatch Button */}
        <button
          type="button"
          onClick={onOpenSnsDrawer}
          className="btn-secondary"
          style={{
            borderColor: 'rgba(239, 68, 68, 0.4)',
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#fca5a5',
            fontSize: '0.82rem',
          }}
        >
          <BellRing size={16} color="#ef4444" />
          <span>View Dispatched SNS Alert</span>
        </button>
      </div>
    </div>
  );
}
