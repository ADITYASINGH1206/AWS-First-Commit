import React from 'react';
import { CareSyncProvider, useCareSync } from './context/CareSyncContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import SchedulePage from './pages/SchedulePage';
import IntakePage from './pages/IntakePage';
import SecurityPage from './pages/SecurityPage';
import AlertsPage from './pages/AlertsPage';
import TelemetryPage from './pages/TelemetryPage';
import CaregiverSnsDrawer from './components/CaregiverSnsDrawer';
import ExecutionTraceModal from './components/ExecutionTraceModal';
import { Sparkles, Terminal } from 'lucide-react';

function AppContent() {
  const {
    activeTab,
    isSnsDrawerOpen,
    setIsSnsDrawerOpen,
    isTraceModalOpen,
    setIsTraceModalOpen,
    resultData,
    forbiddenError,
    patientId,
    navigateTo,
  } = useCareSync();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ maxWidth: '1440px', width: '100%', margin: '0 auto', padding: '1.75rem', flex: 1 }}>
        {/* Top Hackathon Context & Quick Trace Banner (Show only in App Views) */}
        {activeTab !== 'home' && (
          <div
            className="cs-card"
            style={{
              marginBottom: '1.5rem',
              padding: '0.85rem 1.25rem',
              background: 'linear-gradient(90deg, rgba(8, 145, 178, 0.08) 0%, rgba(5, 150, 105, 0.08) 100%)',
              border: '1px solid rgba(8, 145, 178, 0.25)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  background: 'rgba(5, 150, 105, 0.16)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--secondary-light)',
                }}
              >
                <Sparkles size={16} />
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-bright)' }}>
                <strong>AWS First Commit Hackathon</strong> &bull; Track:{' '}
                <span style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Build It: Local / AWS-Simulated</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <button
                type="button"
                className="cs-btn cs-btn-secondary"
                onClick={() => navigateTo('telemetry')}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                title="Inspect raw JSON payloads and Cedar/Strands execution logs"
              >
                <Terminal size={14} color="var(--primary-light)" />
                <span>Inspect Cloud Telemetry</span>
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Page Views */}
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'schedule' && <SchedulePage />}
        {activeTab === 'intake' && <IntakePage />}
        {activeTab === 'security' && <SecurityPage />}
        {activeTab === 'alerts' && <AlertsPage />}
        {activeTab === 'telemetry' && <TelemetryPage />}
      </main>

      {/* Global Drawers & Modals */}
      <CaregiverSnsDrawer
        isOpen={isSnsDrawerOpen}
        onClose={() => setIsSnsDrawerOpen(false)}
        alerts={resultData?.dispatched_emergency_alerts}
        patientName={resultData?.patient_name || patientId}
      />

      <ExecutionTraceModal
        isOpen={isTraceModalOpen}
        onClose={() => setIsTraceModalOpen(false)}
        traceData={resultData || forbiddenError}
      />

      {/* Accessible Footer */}
      <footer
        style={{
          padding: '1.5rem',
          borderTop: '1px solid var(--border-subtle)',
          color: 'var(--text-dim)',
          fontSize: '0.8rem',
          background: 'var(--surface-0)',
        }}
      >
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            CareSync Eldercare Medication Orchestrator &bull; Local AWS Cloud Simulation
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="cs-badge cs-badge-cyan" style={{ fontSize: '0.7rem' }}>AWS SAM CLI</span>
            <span className="cs-badge cs-badge-emerald" style={{ fontSize: '0.7rem' }}>Cedar Engine</span>
            <span className="cs-badge cs-badge-amber" style={{ fontSize: '0.7rem' }}>Strands SDK</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <CareSyncProvider>
      <AppContent />
    </CareSyncProvider>
  );
}
