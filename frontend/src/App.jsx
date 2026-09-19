import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CedarSecuritySelector from './components/CedarSecuritySelector';
import VoiceNoteRecorder from './components/VoiceNoteRecorder';
import ConflictAlertBanner from './components/ConflictAlertBanner';
import PillScheduleBoard from './components/PillScheduleBoard';
import CaregiverSnsDrawer from './components/CaregiverSnsDrawer';
import ExecutionTraceModal from './components/ExecutionTraceModal';
import { processDoctorNote, updateAdherence } from './services/api';
import { ShieldX, AlertCircle, Sparkles, User, HeartPulse, Terminal } from 'lucide-react';

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

      <main style={{ maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '2rem 1.5rem', flex: 1 }}>
        {/* Top Notice Banner */}
        <div
          style={{
            marginBottom: '1.5rem',
            padding: '0.85rem 1.25rem',
            borderRadius: '12px',
            background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sparkles size={18} color="#10b981" />
            <span style={{ fontSize: '0.88rem', color: '#f1f5f9' }}>
              <strong>AWS First Commit Hackathon</strong> &bull; Track: <em>Build It (Local / AWS-Simulated)</em>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {resultData && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsTraceModalOpen(true)}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
              >
                <Terminal size={14} color="#06b6d4" />
                <span>Inspect AWS Lambda JSON Trace</span>
              </button>
            )}
          </div>
        </div>

        {/* Top Grid: Cedar Security Gate & Doctor Voice Note Recorder */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
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
            className="glass-panel animate-fade-in"
            style={{
              padding: '1.5rem',
              border: '2px solid var(--danger)',
              background: 'rgba(239, 68, 68, 0.12)',
              boxShadow: 'var(--shadow-danger)',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div
                style={{
                  padding: '0.75rem',
                  borderRadius: '12px',
                  background: 'rgba(239, 68, 68, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldX size={32} color="#ef4444" />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fca5a5' }}>
                    403 FORBIDDEN — CEDAR AUTHORIZATION REJECTED
                  </h3>
                  <span className="badge badge-crimson">Zero-Trust Block</span>
                </div>

                <p style={{ fontSize: '0.92rem', color: '#fee2e2', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                  {forbiddenError.message || forbiddenError.error}
                </p>

                <div
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'rgba(0, 0, 0, 0.4)',
                    borderRadius: '8px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.78rem',
                    color: '#cbd5e1',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                  }}
                >
                  <div><strong>Principal Attempt:</strong> {selectedUser}</div>
                  <div><strong>Protected Resource:</strong> Patient::{patientId}</div>
                  <div><strong>Required Policy:</strong> permit(principal, action == Action::"ViewPatientRecord", resource) when {'{'} principal in resource.authorized_family {'}'};</div>
                  <div style={{ color: '#f87171', marginTop: '0.25rem' }}>
                    <strong>Cedar Decision:</strong> Deny (Unauthorized caller halted before accessing medical history)
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Output Flow */}
        {resultData && (
          <div className="animate-fade-in">
            {/* Patient Header & Active Regimen Bar */}
            <div
              className="glass-panel"
              style={{
                padding: '1.25rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <User size={22} color="#10b981" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                      {resultData.patient_name || resultData.patient_id}
                    </h2>
                    <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                      Authorized Access
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Active Regimen on File: <strong>{resultData.current_medications?.join(', ') || 'None'}</strong>
                  </p>
                </div>
              </div>

              {/* Agent LLM Engine Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                    Strands Agent Engine
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#06b6d4' }}>
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

      {/* Minimal Footer */}
      <footer style={{ padding: '1.5rem', textAlign: 'center', borderTop: '1px solid var(--border-subtle)', color: 'var(--text-dim)', fontSize: '0.78rem' }}>
        CareSync Eldercare Orchestrator &bull; Local Cloud Simulation (AWS SAM CLI &bull; LocalStack &bull; Cedar Engine &bull; Strands Agents SDK)
      </footer>
    </div>
  );
}
