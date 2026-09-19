import React from 'react';
import { ShieldCheck, Cloud, Cpu, Activity, Smartphone } from 'lucide-react';

export default function Header({ isLiveBackend, onOpenPhoneAlerts }) {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(6, 9, 17, 0.88)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0.85rem 1.75rem',
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
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
              width: '42px',
              height: '42px',
              borderRadius: '11px',
              background: 'linear-gradient(135deg, #059669 0%, #0891b2 100%)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 4px 16px rgba(5, 150, 105, 0.35), var(--highlight-top)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Activity size={22} color="#ffffff" strokeWidth={2.4} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#ffffff' }}>
                CareSync
              </h1>
              <span
                className="cs-badge cs-badge-cyan"
                style={{ fontSize: '0.68rem', padding: '0.18rem 0.5rem', textTransform: 'uppercase' }}
              >
                AWS First Commit Track
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 400 }}>
              Autonomous Eldercare Medication Orchestrator &bull; Zero-Trust Policy Engine
            </p>
          </div>
        </div>

        {/* Local Cloud Simulation Status Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div
            className="badge badge-crimson glass-card-interactive"
            onClick={onOpenPhoneAlerts}
            style={{ cursor: 'pointer' }}
            title="Configure Real Phone Push Notifications"
          >
            <Smartphone size={14} />
            <span>Real Phone Alerts: Live 📲</span>
            <span className="pulse-dot"></span>
          </div>

          <div className="badge badge-emerald" title="AWS SAM Serverless Local API Gateway & Lambda">
            <Cloud size={14} />
            <span>SAM Local :3001</span>
            <span className="cs-pulse-dot" style={{ backgroundColor: '#10b981' }}></span>
          </div>

          {/* Cedar Zero-Trust Engine */}
          <div className="cs-badge cs-badge-cyan" title="AWS Cedar Policy Engine (cedarpy)">
            <ShieldCheck size={14} color="#06b6d4" />
            <span>Cedar Auth (Rust)</span>
            <span className="cs-pulse-dot" style={{ backgroundColor: '#06b6d4' }}></span>
          </div>

          {/* Strands SDK Agent */}
          <div className="cs-badge cs-badge-amber" title="AWS Strands Agents SDK Runtime">
            <Cpu size={14} color="#f59e0b" />
            <span>Strands SDK Agent</span>
            <span className="cs-pulse-dot" style={{ backgroundColor: '#f59e0b' }}></span>
          </div>

          {/* Execution Environment Mode */}
          <div
            className={`cs-badge ${isLiveBackend ? 'cs-badge-emerald' : 'cs-badge-cyan'}`}
            style={{ fontSize: '0.74rem' }}
          >
            <CheckCircle2 size={13} />
            <span>{isLiveBackend ? 'Live SAM Server' : 'Client Simulation'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
