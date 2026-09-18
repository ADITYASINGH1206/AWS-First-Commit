import React, { useState } from 'react';
import { Sun, Sunset, Moon, Sunrise, CheckCircle2, Circle, Clock, Check, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

const SLOT_CONFIG = [
  { key: 'morning', label: 'Morning', time: '8:00 AM', icon: Sunrise, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)' },
  { key: 'afternoon', label: 'Afternoon', time: '1:00 PM', icon: Sun, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.08)' },
  { key: 'evening', label: 'Evening', time: '7:00 PM', icon: Sunset, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.08)' },
  { key: 'bedtime', label: 'Bedtime', time: '10:00 PM', icon: Moon, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.08)' },
];

export default function PillScheduleBoard({ schedule, onUpdateAdherence }) {
  // Local state tracking which pills have been marked taken
  const [takenStatus, setTakenStatus] = useState({});

  if (!schedule) return null;

  // Calculate total scheduled pills vs taken
  let totalPills = 0;
  let takenCount = 0;

  SLOT_CONFIG.forEach(({ key }) => {
    const list = schedule[key] || [];
    list.forEach((item, idx) => {
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

    // Confetti celebration if 100% completed
    if (newStatus && takenCount + 1 === totalPills && totalPills > 0) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  };

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
            Daily Chronotherapy Pill Schedule
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            AI-synthesized medication timetable with food requirements & adherence tracking
          </p>
        </div>

        {/* Adherence Rate Metric */}
        {totalPills > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.45rem 0.85rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Adherence: <strong style={{ color: adherencePercent === 100 ? '#34d399' : '#f59e0b' }}>{adherencePercent}%</strong> ({takenCount}/{totalPills} taken)
            </div>
            <div style={{ width: '60px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${adherencePercent}%`,
                  height: '100%',
                  background: adherencePercent === 100 ? '#10b981' : '#f59e0b',
                  transition: 'width 0.3s ease',
                }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Grid of time slots */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {SLOT_CONFIG.map(({ key, label, time, icon: Icon, color, bg }) => {
          const pills = schedule[key] || [];

          return (
            <div
              key={key}
              className="glass-panel"
              style={{
                background: pills.length > 0 ? bg : 'rgba(15, 23, 42, 0.4)',
                borderColor: pills.length > 0 ? 'var(--border-card)' : 'var(--border-subtle)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Slot Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', paddingBottom: '0.65rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Icon size={18} color={color} />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>
                    {label}
                  </h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  <Clock size={12} />
                  <span>{time}</span>
                </div>
              </div>

              {/* Pill List */}
              {pills.length === 0 ? (
                <div style={{ padding: '1.5rem 0', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.82rem' }}>
                  No medications scheduled
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', flex: 1 }}>
                  {pills.map((pill, idx) => {
                    const id = `${key}-${idx}`;
                    const isTaken = !!takenStatus[id];

                    return (
                      <div
                        key={idx}
                        style={{
                          padding: '0.75rem',
                          borderRadius: '10px',
                          background: isTaken ? 'rgba(16, 185, 129, 0.12)' : 'rgba(0, 0, 0, 0.3)',
                          border: `1px solid ${isTaken ? 'rgba(16, 185, 129, 0.35)' : 'var(--border-subtle)'}`,
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: '0.6rem',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <span
                              style={{
                                fontWeight: 600,
                                fontSize: '0.88rem',
                                color: isTaken ? '#34d399' : '#f8fafc',
                                textDecoration: isTaken ? 'line-through' : 'none',
                              }}
                            >
                              💊 {pill.medication}
                            </span>
                          </div>
                          {pill.instructions && (
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: 1.4 }}>
                              {pill.instructions}
                            </p>
                          )}
                        </div>

                        {/* Mark Taken Button */}
                        <button
                          type="button"
                          className={`pill-check-btn ${isTaken ? 'checked' : ''}`}
                          onClick={() => togglePillTaken(key, idx, pill)}
                          title={isTaken ? 'Mark as Pending' : 'Mark as Taken'}
                        >
                          {isTaken ? (
                            <CheckCircle2 size={22} color="#10b981" />
                          ) : (
                            <Circle size={22} color="#64748b" />
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
    </div>
  );
}
