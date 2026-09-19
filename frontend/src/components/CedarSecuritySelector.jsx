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
      color: '#059669',
      badgeClass: 'cs-badge-emerald',
      rule: 'In authorized_family',
    },
    {
      id: 'User::Charlie',
      name: 'Charlie',
      relation: 'Son / Secondary Contact',
      status: 'PERMITTED',
      icon: UserCheck,
      color: '#059669',
      badgeClass: 'cs-badge-emerald',
      rule: 'In authorized_family',
    },
    {
      id: 'User::Eve',
      name: 'Eve',
      relation: 'Unauthorized External',
      status: 'DENIED',
      icon: UserX,
      color: '#dc2626',
      badgeClass: 'cs-badge-crimson',
      rule: 'Not in authorized_family',
    },
  ];

  return (
    <section className="cs-card" style={{ padding: '1.4rem', background: 'var(--surface-1)', border: '1px solid var(--border-default)' }} aria-label="Security Access Control Gate">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Lock size={16} color="#059669" />
          </div>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-pure)' }}>
              Family Access & Security Gate
            </h2>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Role-based verification of caregiver permissions and patient privacy scope
            </p>
          </div>
        </div>

        <span
          style={{
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            padding: '0.25rem 0.6rem',
            borderRadius: '6px',
            background: 'var(--surface-2)',
            border: '1px solid var(--border-default)',
            color: 'var(--primary-dark)',
            fontWeight: 600,
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
                    ? '#ecfdf5'
                    : '#fef2f2'
                  : 'var(--surface-1)',
                border: `1.5px solid ${
                  isSelected
                    ? isPermitted
                      ? '#10b981'
                      : '#ef4444'
                    : 'var(--border-default)'
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
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-pure)' }}>
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
          background: 'var(--surface-2)',
          border: '1px solid var(--border-default)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem',
          color: 'var(--text-pure)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <span>
          <span style={{ color: '#059669', fontWeight: 600 }}>permit</span>(principal, action == Action::<span style={{ color: '#0284c7' }}>"ViewPatientRecord"</span>, resource) <span style={{ color: '#7c3aed' }}>when</span> {'{'} principal <span style={{ color: '#d97706' }}>in</span> resource.authorized_family {'}'};
        </span>
        <span style={{ color: 'var(--text-dim)', fontSize: '0.68rem', letterSpacing: '0.04em' }}>
          Access Policy Rule
        </span>
      </div>
    </section>
  );
}

