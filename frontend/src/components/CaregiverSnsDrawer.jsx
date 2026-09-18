import React from 'react';
import { X, Bell, Smartphone, Send, ShieldAlert, CheckCheck } from 'lucide-react';

export default function CaregiverSnsDrawer({ isOpen, onClose, alerts, patientName }) {
  if (!isOpen) return null;

  const currentAlert = alerts && alerts.length > 0 ? alerts[0] : {
    subject: `URGENT: Adverse Drug Conflict for Grandma_Bob`,
    message: `CareSync Safety Alert: High-risk drug interaction detected for Grandma_Bob. Lisinopril 10mg + Ibuprofen 400mg may decrease kidney function and reduce BP control.`,
    timestamp: new Date().toISOString(),
    topic_arn: 'arn:aws:sns:us-east-1:000000000000:caresync-emergency-alerts',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--border-card)',
          height: '100%',
          padding: '2rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 40px rgba(0,0,0,0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bell size={18} color="#ef4444" />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                Simulated Amazon SNS Dispatcher
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Topic: caresync-emergency-alerts
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '0.4rem', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* SMS Phone Simulator Graphic */}
        <div
          style={{
            flex: 1,
            background: 'rgba(0, 0, 0, 0.4)',
            borderRadius: '16px',
            border: '1px solid var(--border-card)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <Smartphone size={16} color="var(--text-muted)" />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Recipient: <strong>Alice (Daughter) &bull; +1 (555) 019-2834</strong>
            </span>
          </div>

          {/* Incoming Message Bubble */}
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '12px',
              borderTopLeftRadius: '2px',
              padding: '1rem',
              color: '#f8fafc',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
              <ShieldAlert size={14} color="#ef4444" />
              <strong style={{ fontSize: '0.82rem', color: '#fca5a5' }}>
                {currentAlert.subject}
              </strong>
            </div>
            <p style={{ fontSize: '0.82rem', lineHeight: 1.45, color: '#fee2e2' }}>
              {currentAlert.message}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', fontSize: '0.68rem', color: 'var(--text-dim)' }}>
              <span>AWS SNS &bull; Delivered via SMS</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <CheckCheck size={12} color="#10b981" /> Delivered
              </span>
            </div>
          </div>

          {/* AWS SNS Cloud Details */}
          <div
            style={{
              marginTop: 'auto',
              padding: '0.85rem',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              color: 'var(--text-dim)',
            }}
          >
            <div><strong>Topic ARN:</strong> {currentAlert.topic_arn}</div>
            <div style={{ marginTop: '0.25rem' }}><strong>Timestamp:</strong> {currentAlert.timestamp}</div>
            <div style={{ marginTop: '0.25rem' }}><strong>Simulated Service:</strong> LocalStack SNS Port 4566</div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="btn-primary"
          style={{ marginTop: '1.25rem', width: '100%', justifyContent: 'center' }}
        >
          Acknowledge Alert
        </button>
      </div>
    </div>
  );
}
