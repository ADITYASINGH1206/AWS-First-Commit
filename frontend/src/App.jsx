import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CedarSecuritySelector from './components/CedarSecuritySelector';
import VoiceNoteRecorder from './components/VoiceNoteRecorder';
import ConflictAlertBanner from './components/ConflictAlertBanner';
import PillScheduleBoard from './components/PillScheduleBoard';
import CaregiverSnsDrawer from './components/CaregiverSnsDrawer';
import ExecutionTraceModal from './components/ExecutionTraceModal';
import { processDoctorNote, updateAdherence } from './services/api';
import { ShieldX, Sparkles, User, Terminal, CheckCircle2, ShieldAlert } from 'lucide-react';

const DEFAULT_DOCTOR_NOTE = (
  "Hi, this is Dr. Smith. I need Grandma Bob to start taking 400mg of Ibuprofen " +
  "twice a day for her knee pain, morning and evening. She should continue her other meds."
);

export default function App() {
  const [selectedUser, setSelectedUser] = useState('User::Alice');
  const [patientId, setPatientId] = useState('Grandma_Bob');
  const [doctorsNote, setDoctorsNote] = useState(DEFAULT_DOCTOR_NOTE);
  const [notifyTopic, setNotifyTopic] = useState('caresync-eldercare-alerts');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [forbiddenError, setForbiddenError] = useState(null);
  const [isLiveBackend, setIsLiveBackend] = useState(false);
  const [isSnsDrawerOpen, setIsSnsDrawerOpen] = useState(false);
  const [isTraceModalOpen, setIsTraceModalOpen] = useState(false);

  // Auto-run golden path on initial mount for instant presentation
  useEffect(() => {
    handleProcess();
  }, []);

  const handleProcess = async () => {
    setIsLoading(true);
    setForbiddenError(null);

    try {
      const res = await processDoctorNote(selectedUser, patientId, doctorsNote, {
        ntfyTopic,
        phoneNumber,
      });
      setIsLiveBackend(res.isLiveBackend);

      if (res.status === 403) {
        setForbiddenError(res.data);
        setResultData(null);
      } else if (res.status === 200) {
        setResultData(res.data);
        setForbiddenError(null);
      } else {
        setForbiddenError({
          error: 'Execution Error',
          message: res.data?.error || 'An unexpected error occurred during execution.',
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdherenceUpdate = async (slot, medication, status) => {
    await updateAdherence(patientId, slot, medication, status);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        isLiveBackend={isLiveBackend}
        onOpenPhoneAlerts={() => setIsSnsDrawerOpen(true)}
      />

      <main style={{ maxWidth: '1440px', width: '100%', margin: '0 auto', padding: '2rem 1.75rem', flex: 1 }}>
        {/* Top Notice & Quick Access Bar */}
        <div
          className="cs-card"
          style={{
            marginBottom: '1.75rem',
            padding: '1rem 1.4rem',
            background: 'linear-gradient(90deg, rgba(8, 145, 178, 0.08) 0%, rgba(5, 150, 105, 0.08) 100%)',
            border: '1px solid rgba(8, 145, 178, 0.25)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(5, 150, 105, 0.16)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--secondary-light)',
              }}
            >
              <Sparkles size={18} />
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-bright)' }}>
              <strong>AWS First Commit Hackathon</strong> &bull; Track:{' '}
              <span style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Build It: Local / AWS-Simulated</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {resultData && (
              <button
                type="button"
                className="cs-btn cs-btn-secondary"
                onClick={() => setIsTraceModalOpen(true)}
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
                title="Inspect raw JSON payloads and Cedar/Strands execution logs"
              >
                <Terminal size={15} color="var(--primary-light)" />
                <span>Inspect AWS Lambda JSON Trace</span>
              </button>
            )}
          </div>
        </div>

        {/* Top Grid: Cedar Security Gate & Doctor Voice Note Dictation Station */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
            gap: '1.5rem',
            marginBottom: '1.75rem',
          }}
        >
          <CedarSecuritySelector
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            patientId={patientId}
          />

          <VoiceNoteRecorder
            doctorsNote={doctorsNote}
            setDoctorsNote={setDoctorsNote}
            onProcess={handleProcess}
            isLoading={isLoading}
          />
        </div>

        {/* Forbidden Security Interception Card (When Eve is selected) */}
        {forbiddenError && (
          <div
            className="cs-card"
            style={{
              padding: '1.75rem',
              border: '2px solid var(--danger-border)',
              background: 'rgba(220, 38, 38, 0.08)',
              boxShadow: 'var(--shadow-danger)',
              marginBottom: '1.75rem',
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
                    <span>Zero-Trust Gate Denied</span>
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
                  <div><strong style={{ color: 'var(--text-bright)' }}>Principal Caller:</strong> {selectedUser}</div>
                  <div><strong style={{ color: 'var(--text-bright)' }}>Target Resource:</strong> Patient::{patientId}</div>
                  <div><strong style={{ color: 'var(--text-bright)' }}>Cedar Enforced Rule:</strong> permit(principal, action == Action::"ViewPatientRecord", resource) when {'{'} principal in resource.authorized_family {'}'};</div>
                  <div style={{ color: 'var(--danger-light)', marginTop: '0.4rem', fontWeight: 600 }}>
                    Cedar Verdict: Explicit Deny &bull; Caller halted before medical data or agent loop execution
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Output Flow */}
        {resultData && (
          <div>
            {/* Patient Header & Active Regimen Bar */}
            <div
              className="cs-card"
              style={{
                padding: '1.25rem 1.6rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.25rem',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: 'rgba(5, 150, 105, 0.16)',
                    border: '1px solid rgba(5, 150, 105, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--secondary-light)',
                  }}
                >
                  <User size={24} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-bright)' }}>
                      {resultData.patient_name || resultData.patient_id}
                    </h2>
                    <span className="cs-badge cs-badge-emerald" style={{ fontSize: '0.72rem' }}>
                      <CheckCircle2 size={12} />
                      <span>Cedar Authorized</span>
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Active Regimen on File: <strong style={{ color: 'var(--text-bright)' }}>{resultData.current_medications?.join(', ') || 'None'}</strong>
                  </p>
                </div>
              </div>

              {/* Agent LLM Engine Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                    Strands Agent Engine
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary-light)', fontFamily: 'var(--font-mono)' }}>
                    {resultData.llm_engine}
                  </div>
                </div>
              </div>
            </div>

            {/* High Severity Drug Conflict Callout */}
            <ConflictAlertBanner
              warnings={resultData.interaction_warnings}
              onOpenSnsDrawer={() => setIsSnsDrawerOpen(true)}
            />

            {/* Daily Chronotherapy Pill Schedule */}
            <PillScheduleBoard
              schedule={resultData.daily_schedule}
              onUpdateAdherence={handleAdherenceUpdate}
            />
          </div>
        )}
      </main>

      {/* Drawers & Modals */}
      <CaregiverSnsDrawer
        isOpen={isSnsDrawerOpen}
        onClose={() => setIsSnsDrawerOpen(false)}
        alerts={resultData?.dispatched_emergency_alerts}
        patientName={resultData?.patient_name}
        notifyTopic={notifyTopic}
        setNotifyTopic={setNotifyTopic}
        phoneNumber={phoneNumber}
        setPhoneNumber={setPhoneNumber}
      />

      <ExecutionTraceModal
        isOpen={isTraceModalOpen}
        onClose={() => setIsTraceModalOpen(false)}
        traceData={resultData || forbiddenError}
      />

      {/* Minimal Accessible Footer */}
      <footer
        style={{
          padding: '1.75rem 1.5rem',
          textAlign: 'center',
          borderTop: '1px solid var(--border-subtle)',
          color: 'var(--text-dim)',
          fontSize: '0.8rem',
          background: 'var(--surface-0)',
        }}
      >
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            CareSync Eldercare Medication Orchestrator &bull; Local AWS Cloud Simulation
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="cs-badge cs-badge-cyan" style={{ fontSize: '0.7rem' }}>AWS SAM CLI</span>
            <span className="cs-badge cs-badge-emerald" style={{ fontSize: '0.7rem' }}>Cedar Engine</span>
            <span className="cs-badge cs-badge-amber" style={{ fontSize: '0.7rem' }}>Strands SDK</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

