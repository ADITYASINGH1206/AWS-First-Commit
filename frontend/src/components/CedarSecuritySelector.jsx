import React from 'react';
import { ShieldAlert, ShieldCheck, Lock, UserCheck, UserX } from 'lucide-react';

export default function CedarSecuritySelector({ selectedUser, setSelectedUser, patientId }) {
  const users = [
    {
      id: 'User::Alice',
      name: 'Alice (Daughter)',
      role: 'Authorized Family',
      status: 'PERMITTED',
      icon: UserCheck,
      color: '#10b981',
      desc: 'Member of resource.authorized_family',
    },
    {
      id: 'User::Charlie',
      name: 'Charlie (Son)',
      role: 'Authorized Family',
      status: 'PERMITTED',
      icon: UserCheck,
      color: '#10b981',
      desc: 'Member of resource.authorized_family',
    },
    {
      id: 'User::Eve',
      name: 'Eve (Stranger)',
      role: 'Unauthorized Intruder',
      status: 'DENIED',
      icon: UserX,
      color: '#ef4444',
      desc: 'NotIn resource.authorized_family -> 403 Forbidden',
    },
  ];

  return (
    <div className="glass-panel" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Lock size={18} color="#10b981" />
          <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f1f5f9' }}>
            Cedar Policy Engine: Zero-Trust Security Gate
          </h2>
        </div>
        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          Target: Patient::{patientId}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
        {users.map((u) => {
          const isSelected = selectedUser === u.id;
          const Icon = u.icon;
          const isPermitted = u.status === 'PERMITTED';

          return (
            <div
              key={u.id}
              onClick={() => setSelectedUser(u.id)}
              className="glass-card-interactive"
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                background: isSelected
                  ? isPermitted
                    ? 'rgba(16, 185, 129, 0.12)'
                    : 'rgba(239, 68, 68, 0.12)'
                  : 'rgba(255, 255, 255, 0.03)',
                border: `1.5px solid ${
                  isSelected ? (isPermitted ? '#10b981' : '#ef4444') : 'var(--border-subtle)'
                }`,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Icon size={16} color={u.color} />
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f8fafc' }}>
                    {u.name}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    background: isPermitted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: u.color,
                  }}
                >
                  {u.status}
                </span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {u.desc}
              </p>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: '0.85rem',
          padding: '0.6rem 0.85rem',
          borderRadius: '8px',
          background: 'rgba(0, 0, 0, 0.35)',
          border: '1px solid var(--border-subtle)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem',
          color: '#cbd5e1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span>
          <span style={{ color: '#10b981' }}>permit</span>(principal, action == Action::<span style={{ color: '#67e8f9' }}>"ViewPatientRecord"</span>, resource) <span style={{ color: '#a78bfa' }}>when</span> {'{'} principal <span style={{ color: '#f59e0b' }}>in</span> resource.authorized_family {'}'};
        </span>
        <span style={{ color: 'var(--text-dim)', fontSize: '0.68rem' }}>policies.cedar</span>
      </div>
    </div>
  );
}
