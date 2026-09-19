import React, { useState } from 'react';
import { useCareSync } from '../context/CareSyncContext';
import {
  X,
  Plus,
  Trash2,
  Pill,
  UserPlus,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
} from 'lucide-react';

export default function ManageMedicationsModal({ isOpen, onClose }) {
  const {
    patientId,
    setPatientId,
    patients,
    resultData,
    addCustomMedication,
    removeCustomMedication,
    createNewPatient,
    resetAllData,
  } = useCareSync();

  const [activeTab, setActiveTab] = useState('meds'); // 'meds' | 'new_patient'
  const [newMedName, setNewMedName] = useState('');
  const [newMedSlot, setNewMedSlot] = useState('morning');
  const [newMedInstructions, setNewMedInstructions] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // New Patient Form State
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientAge, setNewPatientAge] = useState(76);
  const [newPatientMed, setNewPatientMed] = useState('');
  const [newPatientAllergy, setNewPatientAllergy] = useState('');
  const [newPatientProxy, setNewPatientProxy] = useState('User::Alice');

  if (!isOpen) return null;

  const currentPatientObj = patients[patientId] || {
    name: patientId,
    age: 78,
    current_medications: resultData?.current_medications || [],
  };

  const currentMeds = resultData?.current_medications || currentPatientObj.current_medications || [];

  const handleAddMed = async (e) => {
    e.preventDefault();
    if (!newMedName.trim()) return;

    await addCustomMedication(newMedName.trim(), newMedSlot, newMedInstructions.trim());
    setToastMessage(`Added "${newMedName.trim()}" to persistent database!`);
    setNewMedName('');
    setNewMedInstructions('');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleRemoveMed = async (med) => {
    await removeCustomMedication(med);
    setToastMessage(`Removed "${med}" from database.`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    if (!newPatientName.trim()) return;

    await createNewPatient({
      name: newPatientName.trim(),
      age: Number(newPatientAge) || 75,
      current_medications: newPatientMed.trim() ? [newPatientMed.trim()] : [],
      allergies: newPatientAllergy.trim() ? [newPatientAllergy.trim()] : [],
      authorized_family: [newPatientProxy],
      notes: 'Custom patient added via Patient Manager',
    });

    setToastMessage(`Created patient profile for "${newPatientName.trim()}"!`);
    setNewPatientName('');
    setNewPatientMed('');
    setNewPatientAllergy('');
    setActiveTab('meds');
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleReset = async () => {
    if (window.confirm('Reset all patient regimens and adherence logs back to factory defaults?')) {
      await resetAllData();
      setToastMessage('Database restored to default demo state.');
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
      }}
      onClick={onClose}
    >
      <div
        className="cs-card animate-fade-slide"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--surface-2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--primary-subtle)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Pill size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-pure)' }}>
                Patient Regimen & Database Manager
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Add custom medications, create patient profiles, or manage persistent dosages
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-dim)',
              padding: '0.4rem',
              borderRadius: '8px',
            }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Toast alert banner */}
        {toastMessage && (
          <div
            style={{
              padding: '0.75rem 1.75rem',
              background: 'var(--primary-subtle)',
              borderBottom: '1px solid #a7f3d0',
              color: 'var(--primary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <CheckCircle2 size={16} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Tab Switcher */}
        <div
          style={{
            padding: '0.75rem 1.75rem',
            display: 'flex',
            gap: '0.75rem',
            borderBottom: '1px solid var(--border-subtle)',
            background: '#ffffff',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('meds')}
            className={`cs-btn ${activeTab === 'meds' ? 'cs-btn-primary' : 'cs-btn-secondary'}`}
            style={{ fontSize: '0.82rem', padding: '0.4rem 0.9rem' }}
          >
            <Pill size={14} />
            <span>Custom Medications ({currentMeds.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('new_patient')}
            className={`cs-btn ${activeTab === 'new_patient' ? 'cs-btn-primary' : 'cs-btn-secondary'}`}
            style={{ fontSize: '0.82rem', padding: '0.4rem 0.9rem' }}
          >
            <UserPlus size={14} />
            <span>Add New Patient</span>
          </button>

          {/* Patient Quick Selector */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Users size={14} color="var(--text-dim)" />
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              style={{
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
                border: '1px solid var(--border-default)',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-pure)',
                background: 'var(--surface-1)',
              }}
            >
              {Object.keys(patients).map((id) => (
                <option key={id} value={id}>
                  {patients[id]?.name || id}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', flex: 1 }}>
          {activeTab === 'meds' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Form: Add New Medication */}
              <form
                onSubmit={handleAddMed}
                style={{
                  padding: '1.25rem',
                  background: 'var(--surface-2)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-default)',
                }}
              >
                <h3 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-pure)', marginBottom: '0.75rem' }}>
                  Add Custom Medication for {currentPatientObj.name || patientId}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', marginBottom: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.3rem' }}>
                      Medication & Dosage *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Metformin 500mg, Atorvastatin 20mg"
                      value={newMedName}
                      onChange={(e) => setNewMedName(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.8rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-default)',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.3rem' }}>
                      Circadian Time Slot
                    </label>
                    <select
                      value={newMedSlot}
                      onChange={(e) => setNewMedSlot(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.8rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-default)',
                        fontSize: '0.85rem',
                        background: '#ffffff',
                      }}
                    >
                      <option value="morning">Morning (08:00 AM)</option>
                      <option value="afternoon">Afternoon (01:00 PM)</option>
                      <option value="evening">Evening (07:00 PM)</option>
                      <option value="bedtime">Bedtime (10:00 PM)</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.3rem' }}>
                    Clinical / Food Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Take with dinner or with plenty of water"
                    value={newMedInstructions}
                    onChange={(e) => setNewMedInstructions(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.8rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-default)',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="cs-btn cs-btn-primary"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '0.88rem' }}
                >
                  <Plus size={16} />
                  <span>Save to Patient Regimen</span>
                </button>
              </form>

              {/* Current Medications List */}
              <div>
                <h3 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-pure)', marginBottom: '0.65rem' }}>
                  Current Active Medications ({currentMeds.length})
                </h3>

                {currentMeds.length === 0 ? (
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No medications listed for this patient. Add one above!
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {currentMeds.map((med, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem 1rem',
                          borderRadius: '8px',
                          border: '1px solid var(--border-default)',
                          background: '#ffffff',
                          boxShadow: 'var(--shadow-sm)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <Pill size={16} color="var(--primary)" />
                          <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-pure)' }}>
                            {med}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveMed(med)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--danger)',
                            padding: '0.35rem',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.78rem',
                          }}
                          title={`Remove ${med}`}
                        >
                          <Trash2 size={15} />
                          <span>Delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* New Patient Form */
            <form onSubmit={handleCreatePatient} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.3rem' }}>
                    Patient Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Margaret Evans"
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.8rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-default)',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.3rem' }}>
                    Patient Age
                  </label>
                  <input
                    type="number"
                    value={newPatientAge}
                    onChange={(e) => setNewPatientAge(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.8rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-default)',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.3rem' }}>
                  Initial Medication
                </label>
                <input
                  type="text"
                  placeholder="e.g. Amlodipine 5mg"
                  value={newPatientMed}
                  onChange={(e) => setNewPatientMed(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-default)',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.3rem' }}>
                  Allergies
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sulfa, Codeine"
                  value={newPatientAllergy}
                  onChange={(e) => setNewPatientAllergy(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-default)',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.3rem' }}>
                  Authorized Family Proxy (Cedar Authorization)
                </label>
                <select
                  value={newPatientProxy}
                  onChange={(e) => setNewPatientProxy(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-default)',
                    fontSize: '0.85rem',
                    background: '#ffffff',
                  }}
                >
                  <option value="User::Alice">User::Alice (Daughter / Power of Attorney)</option>
                  <option value="User::Charlie">User::Charlie (Caregiver Son)</option>
                  <option value="User::David">User::David (Family Healthcare Proxy)</option>
                </select>
              </div>

              <button
                type="submit"
                className="cs-btn cs-btn-primary"
                style={{ marginTop: '0.5rem', justifyContent: 'center', fontSize: '0.88rem' }}
              >
                <UserPlus size={16} />
                <span>Create & Switch to Patient</span>
              </button>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '1rem 1.75rem',
            borderTop: '1px solid var(--border-default)',
            background: 'var(--surface-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <button
            type="button"
            onClick={handleReset}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-dim)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.8rem',
            }}
          >
            <RotateCcw size={13} />
            <span>Reset Demo Data</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="cs-btn cs-btn-secondary"
            style={{ fontSize: '0.82rem', padding: '0.45rem 1rem' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
