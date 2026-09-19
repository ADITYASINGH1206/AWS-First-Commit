import React from 'react';
import { useCareSync } from '../context/CareSyncContext';
import {
  Home,
  Activity,
  CalendarDays,
  Stethoscope,
  ShieldCheck,
  Bell,
  Terminal,
  Smartphone,
  ArrowRight,
} from 'lucide-react';

export default function Header() {
  const {
    activeTab,
    navigateTo,
    resultData,
    setIsSnsDrawerOpen,
  } = useCareSync();

  const conflictCount = resultData?.interaction_warnings?.length || 0;
  const isHomePage = activeTab === 'home';

  const navItems = [
    { id: 'schedule', label: 'Daily Schedule', icon: CalendarDays },
    { id: 'intake', label: 'Clinical Intake', icon: Stethoscope },
    { id: 'security', label: 'Access Control', icon: ShieldCheck },
    { id: 'alerts', label: 'Caregiver Alerts', icon: Bell, badge: conflictCount > 0 ? conflictCount : null },
    { id: 'telemetry', label: 'Diagnostics', icon: Terminal },
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: '#ffffff',
        borderBottom: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0.85rem 1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {/* Brand Emblem & Clean Title */}
        <div
          onClick={() => navigateTo('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer' }}
          title="CareSync Overview"
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #059669 0%, #0891b2 100%)',
              boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <Activity size={20} strokeWidth={2.5} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-pure)' }}>
                CareSync
              </h1>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Eldercare Medication Safety & Chronotherapy Scheduler
            </p>
          </div>
        </div>

        {/* Action Controls: If Landing Page, show Launch Button; If in App, show Mobile Alert trigger and Home return */}
        {isHomePage ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => navigateTo('schedule')}
              className="cs-btn cs-btn-primary"
              style={{ fontSize: '0.88rem', padding: '0.55rem 1.25rem' }}
            >
              <span>Go to Dashboard</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setIsSnsDrawerOpen(true)}
              className="cs-badge cs-badge-crimson cs-card-interactive"
              style={{
                cursor: 'pointer',
                padding: '0.4rem 0.85rem',
                fontSize: '0.76rem',
              }}
              title="Open Mobile Push Alerts & SMS Dispatcher"
            >
              <Smartphone size={14} color="var(--danger)" />
              <span>Mobile Alerts Live</span>
              <span className="cs-pulse-dot" style={{ backgroundColor: 'var(--danger)' }}></span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="cs-btn cs-btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
              title="Return to Product Overview"
            >
              <Home size={14} />
              <span>Overview</span>
            </button>
          </div>
        )}
      </div>

      {/* App Navigation Bar (Shown ONLY in Dashboard, NOT on Landing Page) */}
      {!isHomePage && (
        <div
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '0 1.75rem',
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            borderTop: '1px solid var(--border-subtle)',
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
                className={`cs-nav-tab ${isActive ? 'active' : ''}`}
              >
                <Icon size={16} color={isActive ? 'var(--primary)' : 'currentColor'} />
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
      )}
    </header>
  );
}
