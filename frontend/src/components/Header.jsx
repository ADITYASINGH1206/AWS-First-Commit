import React from 'react';
import { useCareSync } from '../context/CareSyncContext';
import {
  Activity,
  CalendarDays,
  Stethoscope,
  ShieldCheck,
  Bell,
  Terminal,
  Cloud,
  Cpu,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';

export default function Header() {
  const {
    activeTab,
    navigateTo,
    isLiveBackend,
    resultData,
    setIsSnsDrawerOpen,
  } = useCareSync();

  const conflictCount = resultData?.interaction_warnings?.length || 0;

  const navItems = [
    { id: 'schedule', label: 'Daily Schedule', icon: CalendarDays },
    { id: 'intake', label: 'Clinical Intake', icon: Stethoscope },
    { id: 'security', label: 'Security Gate', icon: ShieldCheck },
    { id: 'alerts', label: 'Caregiver Alerts', icon: Bell, badge: conflictCount > 0 ? conflictCount : null },
    { id: 'telemetry', label: 'Cloud Telemetry', icon: Terminal },
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(6, 9, 17, 0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {/* Top Brand & Cloud Telemetry Bar */}
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0.75rem 1.75rem 0.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {/* Brand Emblem & Identification */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #059669 0%, #0891b2 100%)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 4px 16px rgba(5, 150, 105, 0.35), var(--highlight-top)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Activity size={20} color="#ffffff" strokeWidth={2.4} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#ffffff' }}>
                CareSync
              </h1>
              <span
                className="cs-badge cs-badge-cyan"
                style={{ fontSize: '0.66rem', padding: '0.15rem 0.45rem', textTransform: 'uppercase' }}
              >
                AWS First Commit
              </span>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 400 }}>
              Autonomous Eldercare Medication Orchestrator &bull; Zero-Trust Policy Engine
            </p>
          </div>
        </div>

        {/* Local Cloud Telemetry & Quick Triggers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {/* Quick Mobile Alerts Drawer Button */}
          <button
            type="button"
            onClick={() => setIsSnsDrawerOpen(true)}
            className="cs-badge cs-badge-crimson cs-card-interactive"
            style={{
              cursor: 'pointer',
              border: '1px solid var(--danger-border)',
              background: 'rgba(220, 38, 38, 0.14)',
              color: '#fca5a5',
              padding: '0.35rem 0.75rem',
            }}
            title="Configure Real Phone Push Notifications & Carrier SMS"
          >
            <Smartphone size={13} color="#ef4444" />
            <span>Mobile Alerts: Live</span>
            <span className="cs-pulse-dot" style={{ backgroundColor: '#ef4444' }}></span>
          </button>

          {/* SAM Local Serverless Badge */}
          <div className="cs-badge cs-badge-emerald" title="AWS SAM Local API Gateway & Lambda">
            <Cloud size={13} color="#10b981" />
            <span>SAM Local :3001</span>
            <span className="cs-pulse-dot" style={{ backgroundColor: '#10b981' }}></span>
          </div>

          {/* Cedar Zero-Trust Engine */}
          <div className="cs-badge cs-badge-cyan" title="AWS Cedar Policy Engine (cedarpy)">
            <ShieldCheck size={13} color="#06b6d4" />
            <span>Cedar Auth (Rust)</span>
          </div>

          {/* Strands SDK Agent */}
          <div className="cs-badge cs-badge-amber" title="AWS Strands Agents SDK Runtime">
            <Cpu size={13} color="#f59e0b" />
            <span>Strands SDK Agent</span>
          </div>

          {/* Live Execution Indicator */}
          <div className={`cs-badge ${isLiveBackend ? 'cs-badge-emerald' : 'cs-badge-cyan'}`} style={{ fontSize: '0.72rem' }}>
            <CheckCircle2 size={12} />
            <span>{isLiveBackend ? 'Live SAM Server' : 'Simulation'}</span>
          </div>
        </div>
      </div>

      {/* Feature Navigation Tabs Bar */}
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 1.75rem',
          display: 'flex',
          gap: '0.35rem',
          overflowX: 'auto',
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigateTo(item.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1rem',
                background: isActive ? 'var(--surface-2)' : 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--primary-light)' : '2px solid transparent',
                color: isActive ? 'var(--text-bright)' : 'var(--text-muted)',
                fontSize: '0.86rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                borderRadius: '6px 6px 0 0',
              }}
            >
              <Icon size={16} color={isActive ? 'var(--primary-light)' : 'currentColor'} />
              <span>{item.label}</span>
              {item.badge && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '18px',
                    height: '18px',
                    padding: '0 4px',
                    borderRadius: '9px',
                    background: 'var(--danger)',
                    color: '#ffffff',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
}
