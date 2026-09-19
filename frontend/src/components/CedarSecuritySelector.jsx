import React from 'react';
import { ShieldAlert, ShieldCheck, Lock, UserCheck, UserX, Check, AlertCircle } from 'lucide-react';

export default function CedarSecuritySelector({ selectedUser, setSelectedUser, patientId }) {
  const users = [
    {
      id: 'User::Alice',
      name: 'Alice',
      relation: 'Daughter / Primary Caregiver',
      status: 'PERMITTED',
      icon: UserCheck,
      color: '#10b981',
      badgeClass: 'cs-badge-emerald',
      rule: 'In resource.authorized_family',
    },
    {
      id: 'User::Charlie',
      name: 'Charlie',
      relation: 'Son / Secondary Contact',
      status: 'PERMITTED',
      icon: UserCheck,
      color: '#10b981',
      badgeClass: 'cs-badge-emerald',
      rule: 'In resource.authorized_family',
    },
    {
      id: 'User::Eve',
      name: 'Eve',
      relation: 'Unauthorized Stranger',
      status: 'DENIED',
      icon: UserX,
      color: '#ef4444',
      badgeClass: 'cs-badge-crimson',
      rule: 'NotIn authorized_family -> 403',
    },
  ];

  return (
    <section className="cs-card" style={{ padding: '1.4rem' }} aria-label="Cedar Zero-Trust Security Gate">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--cyan-subtle)',
              border: '1px solid rgba(8, 145, 178, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Lock size={16} color="#06b6d4" />
          </div>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-pure)' }}>
              Zero-Trust Cedar Authorization Gate
            </h2>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Evaluated in sub-millisecond Rust execution via <code>cedarpy</code>
            </p>
          </div>
        </div>

        <span
          style={{
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            padding: '0.25rem 0.6rem',
            borderRadius: '6px',
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid var(--border-subtle)',
            color: '#38bdf8',
          }}
        >
          Scope: Patient::{patientId}
        </span>
      </div>

      {/* Identity Switcher Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.75rem' }}>
        {users.map((u) => {
          const isSelected = selectedUser === u.id;
          const Icon = u.icon;
          const isPermitted = u.status === 'PERMITTED';

          return (
            <button
              key={u.id}
              type="button"
              onClick={() => setSelectedUser(u.id)}
              className="cs-card-interactive"
              style={{
                textAlign: 'left',
                padding: '0.9rem 1rem',
                borderRadius: 'var(--radius-sm)',
                background: isSelected
                  ? isPermitted
                    ? 'rgba(5, 150, 105, 0.14)'
                    : 'rgba(220, 38, 38, 0.14)'
                  : 'rgba(0, 0, 0, 0.28)',
                border: `1.5px solid ${
                  isSelected
                    ? isPermitted
                      ? 'rgba(16, 185, 129, 0.5)'
                      : 'rgba(239, 68, 68, 0.5)'
                    : 'var(--border-subtle)'
                }`,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                outline: 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Icon size={16} color={u.color} />
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: isSelected ? '#ffffff' : 'var(--text-main)' }}>
                    {u.name}
                  </span>
                </div>

                <span className={`cs-badge ${u.badgeClass}`} style={{ fontSize: '0.66rem', padding: '0.15rem 0.45rem' }}>
                  {u.status}
                </span>
              </div>

              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                {u.relation}
              </div>

              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                {u.rule}
              </div>
            </button>
          );
        })}
      </div>

      {/* Live Policy Syntax Banner */}
      <div
        style={{
          marginTop: '0.9rem',
          padding: '0.65rem 0.9rem',
          borderRadius: '8px',
          background: 'rgba(0, 0, 0, 0.45)',
          border: '1px solid var(--border-subtle)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem',
          color: '#cbd5e1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <span>
          <span style={{ color: '#10b981', fontWeight: 600 }}>permit</span>(principal, action == Action::<span style={{ color: '#38bdf8' }}>"ViewPatientRecord"</span>, resource) <span style={{ color: '#a78bfa' }}>when</span> {'{'} principal <span style={{ color: '#f59e0b' }}>in</span> resource.authorized_family {'}'};
        </span>
        <span style={{ color: 'var(--text-dim)', fontSize: '0.68rem', letterSpacing: '0.04em' }}>
          policies.cedar
        </span>
      </div>
    </section>
  );
}
