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
      {/* Page Title & Status Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CalendarDays size={22} color="var(--primary-light)" />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-bright)' }}>
              Daily Chronotherapy Medication Schedule
            </h1>
          </div>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Optimized circadian timing slots (Morning, Afternoon, Evening, Bedtime) with real-time adherence tracking.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            type="button"
            onClick={() => navigateTo('intake')}
            className="cs-btn cs-btn-secondary"
            style={{ fontSize: '0.82rem' }}
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
            marginBottom: '1.5rem',
            background: 'rgba(220, 38, 38, 0.08)',
            border: '2px solid var(--danger-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <ShieldAlert size={26} color="var(--danger-light)" />
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fca5a5' }}>
                  Access Blocked by Cedar Zero-Trust Engine
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#fee2e2' }}>
                  The current user cannot view this patient's medical schedule. Switch to an authorized family member in the Security Gate.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigateTo('security')}
              className="cs-btn cs-btn-primary"
              style={{ background: 'var(--danger)', borderColor: 'var(--danger-border)' }}
            >
              Resolve in Security Gate
            </button>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="cs-card" style={{ padding: '3rem', textAlign: 'center', marginBottom: '1.5rem' }}>
          <Activity size={32} color="var(--primary-light)" style={{ animation: 'spin 2s linear infinite', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-bright)' }}>
            Evaluating Chronotherapy Schedule...
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Strands Agent is executing chronotherapy schedule tools for {patientId}.
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
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(5, 150, 105, 0.16)',
                  border: '1px solid rgba(5, 150, 105, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--secondary-light)',
                }}
              >
                <User size={24} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-bright)' }}>
                    {resultData.patient_name || resultData.patient_id}
                  </h2>
                  <span className="cs-badge cs-badge-emerald" style={{ fontSize: '0.72rem' }}>
                    <CheckCircle2 size={12} />
                    <span>Cedar Authorized</span>
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Active Regimen on File: <strong style={{ color: 'var(--text-bright)' }}>{resultData.current_medications?.join(', ') || 'None'}</strong>
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
