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
    subject: `URGENT: Adverse Drug Conflict for ${patientName}`,
    message: `CareSync Safety Alert: High-risk drug interaction detected for ${patientName}. Lisinopril 10mg + Ibuprofen 400mg may decrease kidney function and reduce BP control. Immediate clinical review advised.`,
    timestamp: new Date().toISOString(),
    topic_arn: 'caresync-emergency-alerts',
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
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(8px)',
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
          background: '#ffffff',
          borderLeft: '1px solid var(--border-default)',
          height: '100%',
          padding: '1.75rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 35px rgba(0, 0, 0, 0.1)',
          overflowY: 'auto',
          borderRadius: 0,
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
                background: '#fee2e2',
                border: '1px solid #fca5a5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bell size={20} color="#dc2626" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-pure)' }}>
                Caregiver Emergency Alert System
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Real Mobile Push & SMS Alert Dispatch
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

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            padding: '0.35rem',
            background: 'var(--surface-2)',
            borderRadius: '10px',
            marginBottom: '1.25rem',
            border: '1px solid var(--border-default)',
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
              background: activeTab === 'live_push' ? '#ffffff' : 'transparent',
              color: activeTab === 'live_push' ? '#059669' : 'var(--text-muted)',
              boxShadow: activeTab === 'live_push' ? 'var(--shadow-sm)' : 'none',
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
              background: activeTab === 'simulated_sms' ? '#ffffff' : 'transparent',
              color: activeTab === 'simulated_sms' ? '#2563eb' : 'var(--text-muted)',
              boxShadow: activeTab === 'simulated_sms' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <Radio size={15} />
            <span>SMS Preview</span>
          </button>
        </div>

        {/* TAB 1: REAL PHONE PUSH DISPATCHER */}
        {activeTab === 'live_push' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
            <div
              style={{
                padding: '1.15rem',
                borderRadius: '12px',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <Sparkles size={16} color="#059669" />
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#065f46' }}>
                  Live Notification Connected to Your Phone
                </h4>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#047857', lineHeight: 1.45 }}>
                CareSync pushes alerts directly to iOS & Android devices using an open push channel.
                Open the link below on your phone to subscribe and receive real vibrations & audible alerts!
              </p>

              {/* Topic Config Input */}
              <div style={{ marginTop: '0.85rem' }}>
                <label style={{ fontSize: '0.72rem', color: '#065f46', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
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
                      background: '#ffffff',
                      border: '1px solid #a7f3d0',
                      color: 'var(--text-pure)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.82rem',
                    }}
                  />
                  <a
                    href={`https://ntfy.sh/${activeTopic}`}
                    target="_blank"
                    rel="noreferrer"
                    className="cs-btn cs-btn-secondary"
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    title="Open on phone or browser"
                  >
                    <ExternalLink size={14} />
                    <span>Open Link</span>
                  </a>
                </div>
              </div>

              {/* Real Phone Number (Optional SMS) */}
              <div style={{ marginTop: '0.75rem' }}>
                <label style={{ fontSize: '0.72rem', color: '#065f46', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                  MOBILE PHONE NUMBER (Optional - For Direct SMS):
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
                    background: '#ffffff',
                    border: '1px solid #a7f3d0',
                    color: 'var(--text-pure)',
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
                className="cs-btn cs-btn-primary"
                style={{ marginTop: '1rem', width: '100%', justifyContent: 'center', fontSize: '0.88rem' }}
              >
                {isSendingTest ? (
                  <>
                    <div className="cs-pulse-dot" style={{ width: '8px', height: '8px', backgroundColor: '#fff' }}></div>
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
                    background: '#ffffff',
                    border: '1px solid #10b981',
                    fontSize: '0.75rem',
                    color: '#047857',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Check size={14} color="#059669" />
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
                background: 'var(--surface-2)',
                border: '1px solid var(--border-default)',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: 'var(--text-pure)' }}>📱 How to get alerts on your phone:</strong>
              <ol style={{ paddingLeft: '1.25rem', marginTop: '0.35rem' }}>
                <li>Install <strong>ntfy</strong> from the Apple App Store or Google Play Store (free, no sign-up).</li>
                <li>Tap <strong>+</strong> and subscribe to topic: <code style={{ color: '#0284c7' }}>{activeTopic}</code></li>
                <li>Whenever a dangerous drug clash occurs, your phone rings immediately with priority!</li>
              </ol>
            </div>
          </div>
        )}

        {/* TAB 2: SIMULATED PHONE VIEW */}
        {activeTab === 'simulated_sms' && (
          <div
            style={{
              flex: 1,
              background: 'var(--surface-2)',
              borderRadius: '16px',
              border: '1px solid var(--border-default)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.75rem' }}>
              <Smartphone size={16} color="var(--text-muted)" />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Simulated Device: <strong style={{ color: 'var(--text-pure)' }}>Alice (Daughter) &bull; {phoneNumber || '+1 (555) 019-2834'}</strong>
              </span>
            </div>

            {/* Incoming Message Bubble */}
            <div
              style={{
                background: '#fff1f2',
                border: '1px solid #fca5a5',
                borderRadius: '12px',
                borderTopLeftRadius: '2px',
                padding: '1rem',
                color: 'var(--text-pure)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                <ShieldAlert size={14} color="#dc2626" />
                <strong style={{ fontSize: '0.82rem', color: '#991b1b' }}>
                  {currentAlert.subject}
                </strong>
              </div>
              <p style={{ fontSize: '0.82rem', lineHeight: 1.45, color: '#7f1d1d' }}>
                {currentAlert.message}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                <span>Delivered via SMS Notification</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#059669' }}>
                  <CheckCheck size={12} color="#059669" /> Delivered
                </span>
              </div>
            </div>

            {/* Details */}
            <div
              style={{
                marginTop: 'auto',
                padding: '0.85rem',
                borderRadius: '8px',
                background: '#ffffff',
                border: '1px solid var(--border-default)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
              }}
            >
              <div><strong>Topic:</strong> {currentAlert.topic_arn}</div>
              <div style={{ marginTop: '0.25rem' }}><strong>Timestamp:</strong> {currentAlert.timestamp}</div>
            </div>
          </div>
        )}

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


