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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Stethoscope size={24} color="var(--primary)" />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-pure)' }}>
              Clinical Intake & Doctor Dictation
            </h1>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Record or paste clinical notes. The system extracts medication dosages, frequencies, and verifies adverse interactions in real-time.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span className="cs-badge cs-badge-cyan" style={{ fontSize: '0.78rem' }}>
            <ShieldCheck size={14} />
            <span>Active Caller: {selectedUser}</span>
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.75rem', marginBottom: '1.75rem' }}>
        {/* Left Column: Voice Note Recorder */}
        <VoiceNoteRecorder
          doctorsNote={doctorsNote}
          setDoctorsNote={setDoctorsNote}
          onProcess={() => executeProcess()}
          isLoading={isLoading}
        />

        {/* Right Column: Intake Processing Results */}
        <div className="cs-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-pure)' }}>
              Extracted Prescriptions & Safety Checks
            </h2>
            {resultData && (
              <span className="cs-badge cs-badge-emerald" style={{ fontSize: '0.74rem' }}>
                <CheckCircle2 size={12} />
                <span>Processed Successfully</span>
              </span>
            )}
          </div>

          {isLoading ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '260px' }}>
              <div className="cs-pulse-dot" style={{ width: '14px', height: '14px', color: 'var(--primary)', marginBottom: '1rem' }}></div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Extracting prescriptions and running conflict checks...
              </p>
            </div>
          ) : forbiddenError ? (
            <div style={{ flex: 1, padding: '1.5rem', background: 'var(--danger-subtle)', borderRadius: '10px', border: '1px solid var(--danger-border)' }}>
              <h3 style={{ color: 'var(--danger)', fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Access Blocked
              </h3>
              <p style={{ color: '#7f1d1d', fontSize: '0.86rem', lineHeight: 1.5, marginBottom: '1rem' }}>
                {forbiddenError.message || forbiddenError.error}
              </p>
              <button
                type="button"
                onClick={() => navigateTo('security')}
                className="cs-btn cs-btn-secondary"
                style={{ fontSize: '0.82rem' }}
              >
                Switch to Authorized User in Access Control
              </button>
            </div>
          ) : resultData ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Detected New Medications */}
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                  Newly Prescribed Medications:
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
                          <strong style={{ color: 'var(--text-pure)', fontSize: '0.92rem' }}>{item.name}</strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {item.dosage} &bull; {item.frequency} ({item.timing?.join(', ')})
                          </div>
                        </div>
                        {item.reason && (
                          <span className="cs-badge cs-badge-cyan" style={{ fontSize: '0.72rem' }}>
                            For: {item.reason}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No new medications detected in clinical note.
                  </p>
                )}
              </div>

              {/* Safety Evaluation */}
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                  Safety Check:
                </div>
                {resultData.conflict_found ? (
                  <div style={{ padding: '0.85rem 1rem', background: 'var(--danger-subtle)', border: '1px solid var(--danger-border)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <AlertTriangle size={16} color="var(--danger)" />
                      <strong style={{ fontSize: '0.88rem', color: 'var(--danger)' }}>
                        Adverse Interaction Detected ({resultData.interaction_warnings?.length})
                      </strong>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#7f1d1d', lineHeight: 1.45 }}>
                      {resultData.interaction_warnings?.[0]?.warning}
                    </p>
                  </div>
                ) : (
                  <div style={{ padding: '0.85rem 1rem', background: 'var(--primary-subtle)', border: '1px solid #a7f3d0', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle2 size={16} color="var(--primary)" />
                      <strong style={{ fontSize: '0.88rem', color: 'var(--primary)' }}>
                        No Adverse Drug Interactions Detected
                      </strong>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      All medications are safe for concurrent administration.
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
                  <span>View Daily Schedule</span>
                  <ArrowRight size={15} />
                </button>

                {resultData.conflict_found && (
                  <button
                    type="button"
                    onClick={() => navigateTo('alerts')}
                    className="cs-btn cs-btn-secondary"
                    style={{ borderColor: 'var(--danger-border)', color: 'var(--danger)' }}
                  >
                    <span>View Caregiver Alert</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '220px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Click "Process Clinical Note & Orchestrate" to extract prescriptions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
