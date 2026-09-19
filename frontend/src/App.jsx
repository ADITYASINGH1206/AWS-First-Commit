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
  } = useCareSync();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--surface-0)' }}>
      <Header />

      <main style={{ maxWidth: '1440px', width: '100%', margin: '0 auto', padding: activeTab === 'home' ? '0' : '2rem 1.75rem', flex: 1 }}>
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

      {/* Clean Clinical Footer */}
      <footer
        style={{
          padding: '1.5rem',
          borderTop: '1px solid var(--border-subtle)',
          color: 'var(--text-muted)',
          fontSize: '0.82rem',
          background: '#ffffff',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            CareSync Eldercare Medication Safety & Chronotherapy Management
          </div>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.76rem' }}>
            Zero-Trust Privacy &bull; Real-time Conflict Prevention &bull; Family Escalation
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
