import React from 'react';
import { ShieldCheck, Cloud, Cpu, Activity, Smartphone } from 'lucide-react';

export default function Header({ isLiveBackend, onOpenPhoneAlerts }) {
  return (
    <header className="app-header">
      <div className="header-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
          }}>
            <Activity size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#f8fafc' }}>
                CareSync
              </h1>
              <span className="badge badge-indigo" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                AWS First Commit Track
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Localized Zero-Trust Eldercare Medication Orchestrator
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
            <span className="pulse-dot"></span>
          </div>

          <div className="badge badge-indigo" title="AWS Cedar Policy Engine (cedarpy)">
            <ShieldCheck size={14} />
            <span>Cedar Zero-Trust</span>
            <span className="pulse-dot"></span>
          </div>

          <div className="badge badge-amber" title="Strands Agents SDK (Python) & Local LLM">
            <Cpu size={14} />
            <span>Strands SDK Agent</span>
            <span className="pulse-dot"></span>
          </div>

          <div className={`badge ${isLiveBackend ? 'badge-emerald' : 'badge-indigo'}`} style={{ fontSize: '0.75rem' }}>
            <span>Backend: {isLiveBackend ? '🟢 Connected (SAM)' : '⚡ Simulation Mode'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
