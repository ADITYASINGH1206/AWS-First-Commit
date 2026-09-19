import React, { useState } from 'react';
import { useCareSync } from '../context/CareSyncContext';
import { Bell, Smartphone, Send, ShieldAlert, CheckCheck, Radio, Copy, Check, ExternalLink, Users, AlertOctagon } from 'lucide-react';

export default function AlertsPage() {
  const {
    resultData,
    patientId,
  } = useCareSync();

  const patientName = resultData?.patient_name || patientId;
  const [copiedTopic, setCopiedTopic] = useState(false);
  const [realSendStatus, setRealSendStatus] = useState(null);
  const topicChannel = `caresync-${(patientName || 'patient').toLowerCase().replace(/[^a-z0-9]/g, '')}-alerts`;

  const warnings = resultData?.interaction_warnings || [
    {
      drugs: ['Lisinopril 10mg', 'Ibuprofen 400mg'],
      severity: 'High',
      warning: 'May decrease kidney function and reduce blood pressure control.',
      clinical_guidance: 'NSAIDs inhibit renal prostaglandins, attenuating the hypotensive effect of ACE inhibitors and escalating the risk of acute renal failure.',
    },
  ];

  const currentAlert = resultData?.dispatched_emergency_alerts?.[0] || {
    alert_id: 'sns-simulated-001',
    subject: `URGENT: Adverse Drug Conflict for ${patientName}`,
    message: `CareSync Safety Alert: High-risk drug interaction detected for ${patientName}. Lisinopril 10mg + Ibuprofen 400mg may decrease kidney function and reduce BP control. Immediate clinical review advised.`,
    timestamp: new Date().toISOString(),
    topic_arn: 'arn:aws:sns:us-east-1:000000000000:caresync-emergency-alerts',
  };

  const copyChannelUrl = () => {
    navigator.clipboard.writeText(`https://ntfy.sh/${topicChannel}`);
    setCopiedTopic(true);
    setTimeout(() => setCopiedTopic(false), 2500);
  };

  const sendRealNotification = async () => {
    setRealSendStatus('sending');
    try {
      await fetch(`https://ntfy.sh/${topicChannel}`, {
        method: 'POST',
        headers: {
          'Title': `CareSync Medication Safety Alert`,
          'Priority': 'urgent',
          'Tags': 'warning,pill,rotating_light',
        },
        body: currentAlert.message || 'Adverse drug conflict flagged during daily schedule calculation. Clinical review recommended.',
      });
      setRealSendStatus('sent');
      setTimeout(() => setRealSendStatus(null), 4000);
    } catch (err) {
      console.warn('Real push notification error:', err);
      setRealSendStatus('error');
      setTimeout(() => setRealSendStatus(null), 4000);
    }
  };

  return (
    <div className="animate-fade-slide">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Bell size={24} color="var(--danger-light)" />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-bright)' }}>
              Caregiver Emergency Alerts & Multi-Channel Dispatch
            </h1>
          </div>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Instant escalation when adverse drug-drug interactions or missed high-risk dosages are flagged. Supports simulated Amazon SNS and real-time mobile push notifications.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span className="cs-badge cs-badge-crimson">
            <Radio size={12} />
            <span>Active Alerts: {warnings.length}</span>
          </span>
        </div>
      </div>

      {/* Main Grid: Hazard Warning & Mobile Channels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Left Column: Adverse Interaction Clinical Breakdown */}
        <div className="cs-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <AlertOctagon size={20} color="var(--danger-light)" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-bright)' }}>
              Clinical Drug Conflict Evaluation
            </h2>
          </div>

          {warnings.map((w, idx) => (
            <div
              key={idx}
              style={{
                padding: '1.25rem',
                borderRadius: '10px',
                background: 'rgba(220, 38, 38, 0.08)',
                border: '1px solid var(--danger-border)',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {w.drugs?.map((drug, dIdx) => (
                    <span
                      key={dIdx}
                      className="cs-badge"
                      style={{ background: 'rgba(0,0,0,0.5)', color: '#fca5a5', border: '1px solid var(--danger-border)', fontSize: '0.74rem' }}
                    >
                      {drug}
                    </span>
                  ))}
                </div>
                <span className="cs-badge cs-badge-crimson" style={{ fontSize: '0.72rem' }}>
                  {w.severity || 'High'} Hazard
                </span>
              </div>

              <h3 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#fca5a5', marginBottom: '0.45rem' }}>
                {w.warning}
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#fee2e2', lineHeight: 1.5 }}>
                {w.clinical_guidance || 'NSAIDs attenuate hypotensive effect and increase risk of acute renal decompensation.'}
              </p>
            </div>
          ))}

          {/* Caregiver Escalation Roster */}
          <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem', color: 'var(--text-dim)', fontSize: '0.76rem', textTransform: 'uppercase', fontWeight: 600 }}>
              <Users size={14} />
              <span>Registered Emergency Caregivers</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Alice (Primary Daughter &bull; Healthcare Proxy)</span>
                <strong style={{ color: 'var(--text-bright)' }}>+1 (555) 019-2834</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Charlie (Secondary Son)</span>
                <strong style={{ color: 'var(--text-bright)' }}>+1 (555) 019-9941</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Channel Real Phone & Simulated SMS Dispatch */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Live Mobile Push Channel */}
          <div
            className="cs-card"
            style={{
              padding: '1.5rem',
              background: 'var(--surface-2)',
              border: '1px solid rgba(8, 145, 178, 0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <Radio size={18} color="var(--primary-light)" />
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-bright)' }}>
                  Real Mobile Push Broadcast Channel
                </h3>
              </div>
              <span className="cs-badge cs-badge-cyan" style={{ fontSize: '0.68rem' }}>
                Live Stream
              </span>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>
              Caregivers can receive push notifications on iOS, Android, or desktop web without installing private apps via <strong>ntfy.sh</strong>.
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem',
                padding: '0.65rem 0.9rem',
                background: 'var(--surface-3)',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                marginBottom: '1rem',
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--primary-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                https://ntfy.sh/{topicChannel}
              </div>

              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  type="button"
                  onClick={copyChannelUrl}
                  className="cs-btn cs-btn-secondary"
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.74rem' }}
                  title="Copy push subscription URL"
                >
                  {copiedTopic ? <Check size={13} color="var(--secondary-light)" /> : <Copy size={13} />}
                  <span>{copiedTopic ? 'Copied' : 'Copy'}</span>
                </button>

                <a
                  href={`https://ntfy.sh/${topicChannel}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cs-btn cs-btn-secondary"
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.74rem', textDecoration: 'none' }}
                  title="Open topic in browser / mobile app"
                >
                  <ExternalLink size={13} />
                  <span>Open</span>
                </a>
              </div>
            </div>

            <button
              type="button"
              onClick={sendRealNotification}
              disabled={realSendStatus === 'sending'}
              className="cs-btn cs-btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem 1rem' }}
            >
              <Send size={15} />
              <span>
                {realSendStatus === 'sending'
                  ? 'Broadcasting to Mobile...'
                  : realSendStatus === 'sent'
                  ? 'Mobile Alert Delivered Successfully!'
                  : 'Broadcast Live Push Alert to My Phone'}
              </span>
            </button>
          </div>

          {/* SMS Phone Simulator Graphic */}
          <div className="cs-card" style={{ padding: '1.25rem', background: 'var(--surface-0)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem', marginBottom: '0.85rem' }}>
              <Smartphone size={16} color="var(--text-muted)" />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Simulated Carrier SMS &bull; Recipient: <strong>Alice &bull; +1 (555) 019-2834</strong>
              </span>
            </div>

            <div
              style={{
                background: 'rgba(220, 38, 38, 0.12)',
                border: '1px solid var(--danger-border)',
                borderRadius: '10px',
                borderTopLeftRadius: '2px',
                padding: '0.85rem 1rem',
                color: 'var(--text-bright)',
                marginBottom: '0.85rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
                <ShieldAlert size={14} color="var(--danger-light)" />
                <strong style={{ fontSize: '0.82rem', color: '#fca5a5' }}>
                  {currentAlert.subject}
                </strong>
              </div>
              <p style={{ fontSize: '0.8rem', lineHeight: 1.45, color: '#fee2e2' }}>
                {currentAlert.message}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.6rem', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                <span>AWS SNS &bull; Delivered via SMS</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--secondary-light)' }}>
                  <CheckCheck size={13} /> Delivered
                </span>
              </div>
            </div>

            {/* AWS SNS Cloud Details */}
            <div
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                background: 'var(--surface-2)',
                border: '1px solid var(--border-subtle)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
              }}
            >
              <div><strong>Topic ARN:</strong> {currentAlert.topic_arn}</div>
              <div style={{ marginTop: '0.2rem' }}><strong>Timestamp:</strong> {currentAlert.timestamp}</div>
              <div style={{ marginTop: '0.2rem' }}><strong>Simulated Service:</strong> LocalStack SNS Port 4566</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
