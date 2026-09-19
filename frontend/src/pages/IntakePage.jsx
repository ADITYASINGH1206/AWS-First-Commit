import React from 'react';
import { useCareSync } from '../context/CareSyncContext';
import VoiceNoteRecorder from '../components/VoiceNoteRecorder';
import { Stethoscope, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function IntakePage() {
  const {
    doctorsNote,
    setDoctorsNote,
    executeProcess,
    isLoading,
    resultData,
    forbiddenError,
    selectedUser,
    navigateTo,
  } = useCareSync();

  return (
    <div className="animate-fade-slide">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Stethoscope size={24} color="var(--primary-light)" />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-bright)' }}>
              Clinical Intake & Doctor Dictation Station
            </h1>
          </div>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Dictate, record, or paste clinical doctor notes. The Strands Agent extracts dosage, timing, indications, and checks for adverse drug conflicts.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span className="cs-badge cs-badge-cyan" style={{ fontSize: '0.74rem' }}>
            <ShieldCheck size={13} />
            <span>Active Caller: {selectedUser}</span>
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Left Column: Voice Note Recorder */}
        <VoiceNoteRecorder
          doctorsNote={doctorsNote}
          setDoctorsNote={setDoctorsNote}
          onProcess={() => executeProcess()}
          isLoading={isLoading}
        />

        {/* Right Column: Intake Processing Results & Clinical Extraction Details */}
        <div className="cs-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-bright)' }}>
              Clinical Extraction & Intelligence
            </h2>
            {resultData && (
              <span className="cs-badge cs-badge-emerald" style={{ fontSize: '0.72rem' }}>
                <CheckCircle2 size={12} />
                <span>Processed Successfully</span>
              </span>
            )}
          </div>

          {isLoading ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '260px' }}>
              <div className="cs-pulse-dot" style={{ width: '14px', height: '14px', color: 'var(--primary-light)', marginBottom: '1rem' }}></div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>
                Parsing dosage & analyzing pharmacokinetics...
              </p>
            </div>
          ) : forbiddenError ? (
            <div style={{ flex: 1, padding: '1.5rem', background: 'rgba(220, 38, 38, 0.08)', borderRadius: '10px', border: '1px solid var(--danger-border)' }}>
              <h3 style={{ color: 'var(--danger-light)', fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Unauthorized Access
              </h3>
              <p style={{ color: '#fee2e2', fontSize: '0.84rem', lineHeight: 1.5, marginBottom: '1rem' }}>
                {forbiddenError.message || forbiddenError.error}
              </p>
              <button
                type="button"
                onClick={() => navigateTo('security')}
                className="cs-btn cs-btn-secondary"
                style={{ fontSize: '0.8rem' }}
              >
                Switch to Authorized User in Security Gate
              </button>
            </div>
          ) : resultData ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Detected New Medications */}
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                  Newly Detected Prescriptions:
                </div>
                {resultData.new_medications_detected && resultData.new_medications_detected.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {resultData.new_medications_detected.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '0.85rem 1rem',
                          background: 'var(--surface-2)',
                          border: '1px solid var(--border-default)',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                        }}
                      >
                        <div>
                          <strong style={{ color: 'var(--text-bright)', fontSize: '0.9rem' }}>{item.name}</strong>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {item.dosage} &bull; {item.frequency} ({item.timing?.join(', ')})
                          </div>
                        </div>
                        {item.reason && (
                          <span className="cs-badge cs-badge-cyan" style={{ fontSize: '0.7rem' }}>
                            Indication: {item.reason}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No new medications detected in clinical note.
                  </p>
                )}
              </div>

              {/* Drug-Drug Interaction Safety Status */}
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                  Safety Check:
                </div>
                {resultData.conflict_found ? (
                  <div style={{ padding: '0.85rem 1rem', background: 'rgba(220, 38, 38, 0.12)', border: '1px solid var(--danger-border)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <AlertTriangle size={16} color="var(--danger-light)" />
                      <strong style={{ fontSize: '0.86rem', color: '#fca5a5' }}>
                        Adverse Interaction Flagged ({resultData.interaction_warnings?.length})
                      </strong>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#fee2e2', lineHeight: 1.45 }}>
                      {resultData.interaction_warnings?.[0]?.warning}
                    </p>
                  </div>
                ) : (
                  <div style={{ padding: '0.85rem 1rem', background: 'rgba(5, 150, 105, 0.12)', border: '1px solid rgba(5, 150, 105, 0.3)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle2 size={16} color="var(--secondary-light)" />
                      <strong style={{ fontSize: '0.86rem', color: 'var(--text-bright)' }}>
                        No Adverse Drug Interactions Detected
                      </strong>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      All prescribed medications are safe for concurrent administration.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons to Next Views */}
              <div style={{ marginTop: 'auto', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => navigateTo('schedule')}
                  className="cs-btn cs-btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <span>View Updated Schedule</span>
                  <ArrowRight size={15} />
                </button>

                {resultData.conflict_found && (
                  <button
                    type="button"
                    onClick={() => navigateTo('alerts')}
                    className="cs-btn cs-btn-secondary"
                    style={{ borderColor: 'var(--danger-border)', color: '#fca5a5' }}
                  >
                    <span>View Alert Dispatch</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '220px', color: 'var(--text-dim)', fontSize: '0.86rem' }}>
              Click "Process Clinical Note & Orchestrate" to execute AI extraction.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
