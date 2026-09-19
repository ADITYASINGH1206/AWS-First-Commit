import React, { useState } from 'react';
import { Sun, Sunset, Moon, Sunrise, CheckCircle2, Circle, Clock, Check, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

const SLOT_CONFIG = [
  { key: 'morning', label: 'Morning Regimen', time: '08:00 AM', icon: Sunrise, color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  { key: 'afternoon', label: 'Afternoon Regimen', time: '01:00 PM', icon: Sun, color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' },
  { key: 'evening', label: 'Evening Regimen', time: '07:00 PM', icon: Sunset, color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  { key: 'bedtime', label: 'Bedtime Regimen', time: '10:00 PM', icon: Moon, color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
];

export default function PillScheduleBoard({ schedule, onUpdateAdherence, adherenceLogs = {} }) {
  // Sync state from persistent adherenceLogs prop
  const [takenStatus, setTakenStatus] = useState(() => {
    const initial = {};
    if (schedule && adherenceLogs) {
      SLOT_CONFIG.forEach(({ key }) => {
        const list = schedule[key] || [];
        list.forEach((pill, idx) => {
          const logKey = `${key}_${pill.medication}`;
          if (adherenceLogs[logKey]?.status === 'TAKEN') {
            initial[`${key}-${idx}`] = true;
          }
        });
      });
    }
    return initial;
  });

  // Re-sync whenever adherenceLogs or schedule changes
  React.useEffect(() => {
    if (schedule && adherenceLogs) {
      const updated = {};
      SLOT_CONFIG.forEach(({ key }) => {
        const list = schedule[key] || [];
        list.forEach((pill, idx) => {
          const logKey = `${key}_${pill.medication}`;
          if (adherenceLogs[logKey]?.status === 'TAKEN') {
            updated[`${key}-${idx}`] = true;
          }
        });
      });
      setTakenStatus(updated);
    }
  }, [adherenceLogs, schedule]);

  if (!schedule) return null;

  // Compute adherence counts
  let totalPills = 0;
  let takenCount = 0;

  SLOT_CONFIG.forEach(({ key }) => {
    const list = schedule[key] || [];
    list.forEach((_, idx) => {
      totalPills += 1;
      const id = `${key}-${idx}`;
      if (takenStatus[id]) takenCount += 1;
    });
  });

  const adherencePercent = totalPills > 0 ? Math.round((takenCount / totalPills) * 100) : 100;

  const togglePillTaken = (slotKey, index, pill) => {
    const id = `${slotKey}-${index}`;
    const newStatus = !takenStatus[id];

    setTakenStatus((prev) => ({
      ...prev,
      [id]: newStatus,
    }));

    if (onUpdateAdherence) {
      onUpdateAdherence(slotKey, pill.medication, newStatus ? 'TAKEN' : 'PENDING');
    }

    // Confetti celebration when reaching 100% adherence
    if (newStatus && takenCount + 1 === totalPills && totalPills > 0) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#059669', '#10b981', '#06b6d4', '#f59e0b'],
      });
    }
  };

  return (
    <section style={{ marginTop: '1.75rem' }} aria-label="Daily Medication Schedule">
      {/* Title & Adherence Meter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.85rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-pure)' }}>
              Daily Medication Schedule & Tracking
            </h2>
            <span className="cs-badge cs-badge-emerald" style={{ fontSize: '0.7rem' }}>
              Schedule Active
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Optimized daily schedule with meal-timing directives and adherence tracking
          </p>
        </div>

        {/* Adherence Progress Counter */}
        {totalPills > 0 && (
          <div
            className="cs-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--surface-1)',
              border: '1px solid var(--border-default)',
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                Today's Adherence
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: adherencePercent === 100 ? '#059669' : '#d97706' }}>
                {adherencePercent}% Completed ({takenCount}/{totalPills} doses)
              </div>
            </div>

            <div style={{ width: '70px', height: '8px', background: 'var(--surface-3)', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${adherencePercent}%`,
                  height: '100%',
                  background: adherencePercent === 100 ? 'linear-gradient(90deg, #059669, #10b981)' : 'linear-gradient(90deg, #d97706, #f59e0b)',
                  transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* 4-Slot Bento Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '1rem' }}>
        {SLOT_CONFIG.map(({ key, label, time, icon: Icon, color, bg, border }) => {
          const pills = schedule[key] || [];
          const hasPills = pills.length > 0;

          return (
            <div
              key={key}
              className="cs-card"
              style={{
                background: hasPills ? bg : 'var(--surface-1)',
                borderColor: hasPills ? border : 'var(--border-default)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 'var(--radius-md)',
              }}
            >
              {/* Slot Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                  paddingBottom: '0.7rem',
                  borderBottom: `1px solid ${hasPills ? border : 'var(--border-default)'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '8px',
                      background: 'var(--surface-1)',
                      border: '1px solid var(--border-default)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={17} color={color} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-pure)' }}>
                      {label}
                    </h3>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '0.74rem',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <Clock size={12} />
                  <span>{time}</span>
                </div>
              </div>

              {/* Pills List */}
              {pills.length === 0 ? (
                <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.84rem' }}>
                  No medications scheduled
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                  {pills.map((pill, idx) => {
                    const id = `${key}-${idx}`;
                    const isTaken = !!takenStatus[id];

                    return (
                      <div
                        key={idx}
                        style={{
                          padding: '0.85rem 1rem',
                          borderRadius: '10px',
                          background: isTaken ? '#ecfdf5' : 'var(--surface-1)',
                          border: `1px solid ${isTaken ? '#a7f3d0' : 'var(--border-default)'}`,
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: '0.75rem',
                          transition: 'all 0.2s ease',
                          boxShadow: 'var(--shadow-sm)',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: '0.92rem',
                                color: isTaken ? '#059669' : 'var(--text-pure)',
                                textDecoration: isTaken ? 'line-through' : 'none',
                              }}
                            >
                              {pill.medication}
                            </span>
                          </div>

                          {pill.instructions && (
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem', lineHeight: 1.45 }}>
                              {pill.instructions}
                            </p>
                          )}
                        </div>

                        {/* Tactile Checkbox Button */}
                        <button
                          type="button"
                          className="cs-pill-check"
                          onClick={() => togglePillTaken(key, idx, pill)}
                          title={isTaken ? 'Mark as Pending' : 'Mark as Taken'}
                          aria-label={`Mark ${pill.medication} as ${isTaken ? 'Pending' : 'Taken'}`}
                        >
                          {isTaken ? (
                            <CheckCircle2 size={24} color="#059669" strokeWidth={2.4} />
                          ) : (
                            <Circle size={24} color="#94a3b8" strokeWidth={1.8} />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

