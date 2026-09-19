import React, { useState } from 'react';
import { X, Bell, Smartphone, Send, ShieldAlert, CheckCheck, Copy, Check, Radio, ExternalLink } from 'lucide-react';

export default function CaregiverSnsDrawer({ isOpen, onClose, alerts, patientName = 'Grandma_Bob' }) {
  if (!isOpen) return null;

  const [copiedTopic, setCopiedTopic] = useState(false);
  const [realSendStatus, setRealSendStatus] = useState(null); // 'sending' | 'sent' | 'error'
  const [topicChannel] = useState(`caresync-${patientName.toLowerCase().replace(/[^a-z0-9]/g, '')}-alerts`);

  const currentAlert = alerts && alerts.length > 0 ? alerts[0] : {
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
      // Send real push notification to ntfy.sh (works instantly on iOS/Android via app or web push)
      await fetch(`https://ntfy.sh/${topicChannel}`, {
        method: 'POST',
        headers: {
          'Title': `CareSync Alert: ${patientName}`,
          'Priority': 'urgent',
          'Tags': 'warning,pill,rotating_light',
        },
        body: currentAlert.message,
      });
      setRealSendStatus('sent');
      setTimeout(() => setRealSendStatus(null), 4000);
    } catch (err) {
      console.warn('Real push notification delivery error:', err);
      setRealSendStatus('error');
      setTimeout(() => setRealSendStatus(null), 4000);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 7, 18, 0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <aside
        className="cs-card"
        style={{
          width: '100%',
          maxWidth: '520px',
          height: '100%',
          borderRadius: 0,
          borderLeft: '1px solid var(--border-subtle)',
          borderTop: 'none',
          borderRight: 'none',
          borderBottom: 'none',
          background: 'var(--surface-1)',
          padding: '2rem 1.75rem',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-12px 0 48px rgba(0, 0, 0, 0.6)',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(220, 38, 38, 0.16)',
                border: '1px solid var(--danger-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f87171',
              }}
            >
              <Bell size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-bright)' }}>
                  Caregiver Alerts & Dispatch
                </h2>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Multi-channel: AWS SNS SMS + Instant Real Phone Push
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cs-btn cs-btn-secondary"
            style={{ padding: '0.5rem', borderRadius: '50%', minWidth: 'auto', height: 'auto' }}
            aria-label="Close Drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Real Mobile Phone Connect Box */}
        <div
          className="cs-card"
          style={{
            padding: '1.25rem',
            marginBottom: '1.25rem',
            background: 'var(--surface-2)',
            border: '1px solid rgba(8, 145, 178, 0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Radio size={16} color="var(--primary-light)" />
              <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-bright)' }}>
                Real Phone Push Notifications
              </span>
            </div>
            <span className="cs-badge cs-badge-cyan" style={{ fontSize: '0.68rem' }}>
              Live Channel
            </span>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '0.85rem' }}>
            You can receive real instant alerts on your mobile phone via <strong>ntfy.sh</strong> (iOS, Android, or Browser).
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              padding: '0.6rem 0.85rem',
              background: 'var(--surface-3)',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              marginBottom: '0.85rem',
            }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--primary-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              ntfy.sh/{topicChannel}
            </div>

            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button
                type="button"
                onClick={copyChannelUrl}
                className="cs-btn cs-btn-secondary"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.74rem' }}
                title="Copy mobile push subscription URL"
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
            style={{ width: '100%', justifyContent: 'center', padding: '0.65rem 1rem' }}
          >
            <Send size={15} />
            <span>
              {realSendStatus === 'sending'
                ? 'Broadcasting to Mobile...'
                : realSendStatus === 'sent'
                ? 'Mobile Alert Delivered!'
                : 'Send Test Push Alert to My Phone'}
            </span>
          </button>
        </div>

        {/* SMS Phone Simulator Graphic */}
        <div
          className="cs-card"
          style={{
            flex: 1,
            background: 'var(--surface-0)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <Smartphone size={16} color="var(--text-muted)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Simulated Carrier SMS &bull; Recipient: <strong>Alice (Daughter) &bull; +1 (555) 019-2834</strong>
            </span>
          </div>

          {/* Incoming Message Bubble */}
          <div
            style={{
              background: 'rgba(220, 38, 38, 0.12)',
              border: '1px solid var(--danger-border)',
              borderRadius: '12px',
              borderTopLeftRadius: '2px',
              padding: '1rem 1.15rem',
              color: 'var(--text-bright)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
              <ShieldAlert size={16} color="var(--danger-light)" />
              <strong style={{ fontSize: '0.85rem', color: '#fca5a5' }}>
                {currentAlert.subject}
              </strong>
            </div>
            <p style={{ fontSize: '0.82rem', lineHeight: 1.5, color: '#fee2e2' }}>
              {currentAlert.message}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              <span>AWS SNS &bull; Delivered via Carrier Gateway</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--secondary-light)' }}>
                <CheckCheck size={14} /> Delivered
              </span>
            </div>
          </div>

          {/* AWS SNS Cloud Telemetry Details */}
          <div
            style={{
              marginTop: 'auto',
              padding: '0.85rem',
              borderRadius: '8px',
              background: 'var(--surface-2)',
              border: '1px solid var(--border-subtle)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
            }}
          >
            <div style={{ color: 'var(--text-bright)', marginBottom: '0.35rem', fontWeight: 600 }}>
              AWS SNS Dispatch Telemetry:
            </div>
            <div><strong>Topic ARN:</strong> {currentAlert.topic_arn}</div>
            <div style={{ marginTop: '0.25rem' }}><strong>Timestamp:</strong> {currentAlert.timestamp}</div>
            <div style={{ marginTop: '0.25rem' }}><strong>Simulated Service:</strong> LocalStack SNS Port 4566</div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="cs-btn cs-btn-secondary"
          style={{ marginTop: '1.25rem', width: '100%', justifyContent: 'center' }}
        >
          Close Drawer
        </button>
      </aside>
    </div>
  );
}

