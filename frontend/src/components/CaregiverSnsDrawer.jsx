import React, { useState } from 'react';
import { X, Bell, Smartphone, Send, ShieldAlert, CheckCheck, ExternalLink, Radio, Check, Sparkles } from 'lucide-react';
import { sendRealTestNotification } from '../services/api';

export default function CaregiverSnsDrawer({
  isOpen,
  onClose,
  alerts,
  patientName,
  notifyTopic,
  setNotifyTopic,
  phoneNumber,
  setPhoneNumber
}) {
  const [activeTab, setActiveTab] = useState('live_push'); // 'live_push' | 'simulated_sms'
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const currentAlert = alerts && alerts.length > 0 ? alerts[0] : {
    subject: `URGENT: Adverse Drug Conflict for Grandma_Bob`,
    message: `CareSync Safety Alert: High-risk drug interaction detected for Grandma_Bob. Lisinopril 10mg + Ibuprofen 400mg may decrease kidney function and reduce BP control.`,
    timestamp: new Date().toISOString(),
    topic_arn: 'arn:aws:sns:us-east-1:000000000000:caresync-emergency-alerts',
  };

  const activeTopic = notifyTopic || 'caresync-eldercare-alerts';

  const handleSendTestPush = async () => {
    setIsSendingTest(true);
    setTestResult(null);

    // Also trigger native browser notification if granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🚨 CareSync Test Alert', {
        body: 'Real notification dispatched to your device from CareSync!',
        icon: '/favicon.ico'
      });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }

    const res = await sendRealTestNotification(
      activeTopic,
      `🚨 CareSync Test Alert for ${patientName || 'Grandma Bob'}`,
      `Test emergency notification ringing on your phone! Lisinopril + Ibuprofen adverse interaction alert verified.`,
      phoneNumber
    );

    setIsSendingTest(false);
    setTestResult(res);
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
          maxWidth: '520px',
          background: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--border-card)',
          height: '100%',
          padding: '1.75rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 40px rgba(0,0,0,0.5)',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(245, 158, 11, 0.2) 100%)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bell size={20} color="#ef4444" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                Caregiver Emergency Alert System
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Real Mobile Push + AWS SNS Local & Live Delivery
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

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            padding: '0.25rem',
            background: 'rgba(0, 0, 0, 0.35)',
            borderRadius: '10px',
            marginBottom: '1.25rem',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('live_push')}
            style={{
              flex: 1,
              padding: '0.55rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              background: activeTab === 'live_push' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              color: activeTab === 'live_push' ? '#34d399' : 'var(--text-muted)',
              transition: 'all 0.2s',
            }}
          >
            <Smartphone size={15} />
            <span>Real Phone Push (Live)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('simulated_sms')}
            style={{
              flex: 1,
              padding: '0.55rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              background: activeTab === 'simulated_sms' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: activeTab === 'simulated_sms' ? '#a5b4fc' : 'var(--text-muted)',
              transition: 'all 0.2s',
            }}
          >
            <Radio size={15} />
            <span>AWS SNS Local Preview</span>
          </button>
        </div>

        {/* TAB 1: REAL PHONE PUSH DISPATCHER */}
        {activeTab === 'live_push' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
            <div
              style={{
                padding: '1rem',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <Sparkles size={16} color="#10b981" />
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#34d399' }}>
                  Live Notification Connected to Your Phone
                </h4>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                CareSync pushes alerts directly to iOS & Android devices using an open push channel.
                Open the link below on your phone to subscribe and receive real vibrations & audible alerts!
              </p>

              {/* Topic Config Input */}
              <div style={{ marginTop: '0.85rem' }}>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                  YOUR ALERT TOPIC (Click link to subscribe on your phone):
                </label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <input
                    type="text"
                    value={activeTopic}
                    onChange={(e) => setNotifyTopic && setNotifyTopic(e.target.value)}
                    placeholder="caresync-eldercare-alerts"
                    style={{
                      flex: 1,
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid var(--border-card)',
                      color: '#67e8f9',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.82rem',
                    }}
                  />
                  <a
                    href={`https://ntfy.sh/${activeTopic}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary"
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    title="Open on phone or browser"
                  >
                    <ExternalLink size={14} />
                    <span>Open Link</span>
                  </a>
                </div>
              </div>

              {/* Real Phone Number (Optional AWS SNS SMS) */}
              <div style={{ marginTop: '0.75rem' }}>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                  MOBILE PHONE NUMBER (Optional - For AWS SNS Carrier SMS):
                </label>
                <input
                  type="text"
                  value={phoneNumber || ''}
                  onChange={(e) => setPhoneNumber && setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 019-2834 or +91..."
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--border-card)',
                    color: '#f8fafc',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.82rem',
                  }}
                />
              </div>

              {/* Action: Send Test Phone Push */}
              <button
                type="button"
                onClick={handleSendTestPush}
                disabled={isSendingTest}
                className="btn-primary"
                style={{ marginTop: '1rem', width: '100%', justifyContent: 'center', fontSize: '0.88rem' }}
              >
                {isSendingTest ? (
                  <>
                    <div className="pulse-dot" style={{ width: '8px', height: '8px', backgroundColor: '#fff' }}></div>
                    <span>Sending Real Alert to Phone...</span>
                  </>
                ) : (
                  <>
                    <Bell size={16} />
                    <span>Send Live Test Alert to My Phone</span>
                  </>
                )}
              </button>

              {testResult && (
                <div
                  style={{
                    marginTop: '0.75rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    fontSize: '0.75rem',
                    color: '#a7f3d0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Check size={14} color="#10b981" />
                  <span>
                    Delivered! Check your phone on <strong>ntfy.sh/{activeTopic}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Quick Steps Guide */}
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: '#f8fafc' }}>📱 How to get alerts on your phone:</strong>
              <ol style={{ paddingLeft: '1.25rem', marginTop: '0.35rem' }}>
                <li>Install <strong>ntfy</strong> from the Apple App Store or Google Play Store (free, no sign-up).</li>
                <li>Tap <strong>+</strong> and subscribe to topic: <code style={{ color: '#67e8f9' }}>{activeTopic}</code></li>
                <li>Whenever a dangerous drug clash occurs, your phone rings immediately with priority!</li>
              </ol>
            </div>
          </div>
        )}

        {/* TAB 2: SIMULATED AWS SNS PHONE VIEW */}
        {activeTab === 'simulated_sms' && (
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
                Simulated Device: <strong>Alice (Daughter) &bull; {phoneNumber || '+1 (555) 019-2834'}</strong>
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
        )}

        <button
          type="button"
          onClick={onClose}
          className="btn-secondary"
          style={{ marginTop: '1.25rem', width: '100%', justifyContent: 'center' }}
        >
          Close Drawer
        </button>
      </div>
    </div>
  );
}
