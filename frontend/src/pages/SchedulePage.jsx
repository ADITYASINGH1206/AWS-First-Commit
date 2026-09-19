import React from 'react';
import { useCareSync } from '../context/CareSyncContext';
import PillScheduleBoard from '../components/PillScheduleBoard';
import ConflictAlertBanner from '../components/ConflictAlertBanner';
import { User, CheckCircle2, ShieldAlert, ArrowRight, Activity, CalendarDays } from 'lucide-react';

export default function SchedulePage() {
  const {
    patientId,
    resultData,
    forbiddenError,
    isLoading,
    handleAdherenceUpdate,
    setIsSnsDrawerOpen,
    navigateTo,
  } = useCareSync();

  return (
    <div className="animate-fade-slide">
      {/* Page Title & Navigation Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CalendarDays size={24} color="var(--primary)" />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-pure)' }}>
              Daily Chronotherapy Medication Schedule
            </h1>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Daily pill regimen organized across Morning, Afternoon, Evening, and Bedtime slots with real-time adherence tracking.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            type="button"
            onClick={() => navigateTo('intake')}
            className="cs-btn cs-btn-secondary"
            style={{ fontSize: '0.84rem' }}
          >
            <span>Update Regimen via Clinical Intake</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Forbidden Warning if Eve is active */}
      {forbiddenError && (
        <div
          className="cs-card"
          style={{
            padding: '1.5rem',
            marginBottom: '1.75rem',
            background: 'var(--danger-subtle)',
            border: '2px solid var(--danger-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <ShieldAlert size={26} color="var(--danger)" />
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--danger)' }}>
                  Access Blocked by Permission Policy
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#7f1d1d' }}>
                  The current user does not have permission to view this patient's medical schedule. Switch to an authorized family member in Access Control.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigateTo('security')}
              className="cs-btn cs-btn-primary"
              style={{ background: 'var(--danger)', borderColor: 'var(--danger-border)' }}
            >
              Open Access Control
            </button>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="cs-card" style={{ padding: '3rem', textAlign: 'center', marginBottom: '1.75rem', background: '#ffffff' }}>
          <Activity size={32} color="var(--primary)" style={{ animation: 'spin 2s linear infinite', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-pure)' }}>
            Updating Medication Schedule...
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Processing chronotherapy timing and adherence for {patientId}.
          </p>
        </div>
      )}

      {/* Patient Header & Active Regimen Bar */}
      {resultData && (
        <>
          <div
            className="cs-card"
            style={{
              padding: '1.25rem 1.6rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.25rem',
              marginBottom: '1.5rem',
              background: '#ffffff',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'var(--primary-subtle)',
                  border: '1px solid #a7f3d0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                }}
              >
                <User size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-pure)' }}>
                    {resultData.patient_name || resultData.patient_id}
                  </h2>
                  <span className="cs-badge cs-badge-emerald" style={{ fontSize: '0.72rem' }}>
                    <CheckCircle2 size={12} />
                    <span>Authorized Access</span>
                  </span>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Active Maintenance Regimen: <strong style={{ color: 'var(--text-pure)' }}>{resultData.current_medications?.join(', ') || 'None'}</strong>
                </p>
              </div>
            </div>

            {/* Quick Link to Alerts if Conflict Found */}
            {resultData.conflict_found && (
              <button
                type="button"
                onClick={() => navigateTo('alerts')}
                className="cs-badge cs-badge-crimson cs-card-interactive"
                style={{ cursor: 'pointer', padding: '0.45rem 0.9rem', fontSize: '0.78rem' }}
              >
                <ShieldAlert size={14} />
                <span>{resultData.interaction_warnings?.length} Adverse Conflict Detected — View Alert</span>
              </button>
            )}
          </div>

          {/* Conflict Alert Banner Callout */}
          <ConflictAlertBanner
            warnings={resultData.interaction_warnings}
            onOpenSnsDrawer={() => setIsSnsDrawerOpen(true)}
          />

          {/* Daily Chronotherapy Pill Schedule */}
          <PillScheduleBoard
            schedule={resultData.daily_schedule}
            onUpdateAdherence={handleAdherenceUpdate}
          />
        </>
      )}
    </div>
  );
}
