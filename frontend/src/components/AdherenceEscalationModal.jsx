import React, { useState } from 'react';
import { useCareSync } from '../context/CareSyncContext';
import { triggerAdherenceEscalation } from '../services/api';
import {
  X,
  BellRing,
  Smartphone,
  ShieldAlert,
  Volume2,
  Clock,
  CheckCircle2,
  Play,
  Send,
  AlertTriangle,
} from 'lucide-react';

export default function AdherenceEscalationModal({ isOpen, onClose }) {
  const {
    patientId,
    patients,
    resultData,
  } = useCareSync();

  const [selectedSlot, setSelectedSlot] = useState('morning');
  const [selectedMed, setSelectedMed] = useState('');
  const [activeTier, setActiveTier] = useState(2);
  const [topicName, setTopicName] = useState('caresync-eldercare-alerts');
  const [phoneNumber, setPhoneNumber] = useState('+1 (555) 234-8901');
  const [isDispatching, setIsDispatching] = useState(false);
  const [lastReceipt, setLastReceipt] = useState(null);

  if (!isOpen) return null;

  const currentPatientObj = patients[patientId] || {
    name: patientId,
    current_medications: resultData?.current_medications || ['Lisinopril 10mg'],
  };
  const meds = resultData?.current_medications || currentPatientObj.current_medications || ['Lisinopril 10mg'];
  const activeMed = selectedMed || meds[0] || 'Lisinopril 10mg';

  // Play audio chime for Tier 1
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      console.warn('Web Audio chime not supported:', e);
    }
  };

  const handleTriggerEscalation = async () => {
    setIsDispatching(true);
    setLastReceipt(null);

    if (activeTier === 1) {
      playChime();
    }

    try {
      const res = await triggerAdherenceEscalation(
        patientId,
        [activeMed],
        selectedSlot,
        activeTier,
        phoneNumber,
        topicName
      );
      setLastReceipt(res);
      if (activeTier >= 2) {
        playChime();
      }
    } catch (err) {
      console.error('Escalation trigger error:', err);
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 110,
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
      }}
      onClick={onClose}
    >
      <div
        className="cs-card animate-fade-slide"
        style={{
          width: '100%',
          maxWidth: '740px',
          maxHeight: '92vh',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--surface-2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#fff1f2',
                color: 'var(--danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BellRing size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-pure)' }}>
                Smart Adherence Escalation Ladder
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Automated multi-tier caregiver alerting protocol for critical missed doses
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-dim)',
              padding: '0.4rem',
              borderRadius: '8px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* 3-Tier Ladder Overview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
            {/* Tier 1 Card */}
            <div
              onClick={() => setActiveTier(1)}
              style={{
                padding: '1rem',
                borderRadius: '10px',
                border: `2px solid ${activeTier === 1 ? 'var(--primary)' : 'var(--border-default)'}`,
                background: activeTier === 1 ? 'var(--primary-subtle)' : 'var(--surface-2)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <Volume2 size={16} color="var(--primary)" />
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-pure)' }}>Tier 1: Audio Chime</strong>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginBottom: '0.4rem' }}>
                T + 0 min (Dose Time)
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                Gentle audible chime on bedside smart tablet reminding elder to take medication.
              </p>
            </div>

            {/* Tier 2 Card */}
            <div
              onClick={() => setActiveTier(2)}
              style={{
                padding: '1rem',
                borderRadius: '10px',
                border: `2px solid ${activeTier === 2 ? '#d97706' : 'var(--border-default)'}`,
                background: activeTier === 2 ? '#fffbeb' : 'var(--surface-2)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <Smartphone size={16} color="#d97706" />
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-pure)' }}>Tier 2: Caregiver Push</strong>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#b45309', marginBottom: '0.4rem' }}>
                T + 15 min (Missed Dose)
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                Real-time high-priority push notification delivered to family caregiver's smartphone.
              </p>
            </div>

            {/* Tier 3 Card */}
            <div
              onClick={() => setActiveTier(3)}
              style={{
                padding: '1rem',
                borderRadius: '10px',
                border: `2px solid ${activeTier === 3 ? 'var(--danger)' : 'var(--border-default)'}`,
                background: activeTier === 3 ? '#fff1f2' : 'var(--surface-2)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <ShieldAlert size={16} color="var(--danger)" />
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-pure)' }}>Tier 3: Critical Dispatch</strong>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#be123c', marginBottom: '0.4rem' }}>
                T + 45 min (Emergency)
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                Automated Amazon SNS / SMS broadcast to on-call clinical proxy and emergency contacts.
              </p>
            </div>
          </div>

          {/* Simulator Form */}
          <div
            style={{
              padding: '1.25rem',
              background: 'var(--surface-2)',
              borderRadius: '12px',
              border: '1px solid var(--border-default)',
            }}
          >
            <h3 style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-pure)', marginBottom: '0.85rem' }}>
              Test Escalation for {currentPatientObj.name || patientId}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.3rem' }}>
                  Circadian Regimen Slot
                </label>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-default)',
                    fontSize: '0.85rem',
                    background: '#ffffff',
                  }}
                >
                  <option value="morning">Morning (08:00 AM)</option>
                  <option value="afternoon">Afternoon (01:00 PM)</option>
                  <option value="evening">Evening (07:00 PM)</option>
                  <option value="bedtime">Bedtime (10:00 PM)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.3rem' }}>
                  Unconfirmed Medication
                </label>
                <select
                  value={activeMed}
                  onChange={(e) => setSelectedMed(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-default)',
                    fontSize: '0.85rem',
                    background: '#ffffff',
                  }}
                >
                  {meds.map((m, idx) => (
                    <option key={idx} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.3rem' }}>
                  Push Topic (ntfy.sh)
                </label>
                <input
                  type="text"
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-default)',
                    fontSize: '0.85rem',
                    background: '#ffffff',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.3rem' }}>
                  Caregiver Mobile Phone (SMS)
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-default)',
                    fontSize: '0.85rem',
                    background: '#ffffff',
                  }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleTriggerEscalation}
              disabled={isDispatching}
              className="cs-btn cs-btn-primary"
              style={{ width: '100%', justifyContent: 'center', fontSize: '0.88rem' }}
            >
              {isDispatching ? (
                <span>Dispatching Tier {activeTier} Escalation...</span>
              ) : (
                <>
                  <Send size={15} />
                  <span>Trigger Real Tier {activeTier} Escalation Alert</span>
                </>
              )}
            </button>
          </div>

          {/* Live Dispatch Receipt */}
          {lastReceipt && (
            <div
              className="cs-card animate-fade-slide"
              style={{
                padding: '1.25rem',
                background: '#ffffff',
                border: '1px solid var(--border-default)',
                borderRadius: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                <CheckCircle2 size={18} color="var(--primary)" />
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-pure)' }}>
                  Live Escalation Dispatch Receipt
                </h4>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: 1.5, fontFamily: 'var(--font-mono)' }}>
                <div><strong>Subject:</strong> {lastReceipt.alert?.subject}</div>
                <div><strong>Timestamp:</strong> {lastReceipt.alert?.timestamp}</div>
                <div><strong>Target:</strong> {topicName} &bull; {phoneNumber}</div>
                {lastReceipt.dispatch?.receipts?.ntfy?.status === 'delivered' && (
                  <div style={{ color: 'var(--primary)', marginTop: '0.35rem' }}>
                    &bull; Real smartphone push delivered (Message ID: {lastReceipt.dispatch.receipts.ntfy.message_id})
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.75rem',
            borderTop: '1px solid var(--border-default)',
            background: 'var(--surface-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="cs-btn cs-btn-secondary"
            style={{ fontSize: '0.82rem' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
