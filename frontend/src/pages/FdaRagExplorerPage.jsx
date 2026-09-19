import React, { useState, useEffect } from 'react';
import { useCareSync } from '../context/CareSyncContext';
import { searchFdaDrugLabel, checkClinicalRagSafety } from '../services/api';
import {
  FileText,
  Search,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Plus,
  Activity,
  Sparkles,
  Info,
  Clock,
  User,
} from 'lucide-react';

const PRESET_DRUGS = [
  'Lisinopril',
  'Metformin',
  'Warfarin',
  'Ibuprofen',
  'Aspirin',
  'Atorvastatin',
  'Eliquis',
  'Tramadol',
];

export default function FdaRagExplorerPage() {
  const {
    patientId,
    patients,
    resultData,
    addCustomMedication,
    setIsMedManagerOpen,
  } = useCareSync();

  const [searchQuery, setSearchQuery] = useState('Lisinopril');
  const [activeDrug, setActiveDrug] = useState('Lisinopril');
  const [fdaLabel, setFdaLabel] = useState(null);
  const [ragReport, setRagReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const currentPatientObj = patients[patientId] || {
    name: patientId,
    current_medications: resultData?.current_medications || ['Lisinopril 10mg'],
  };
  const activeRegimen = resultData?.current_medications || currentPatientObj.current_medications || [];

  const handleSearch = async (drugName) => {
    const target = drugName || searchQuery;
    if (!target.trim()) return;

    setIsLoading(true);
    setActiveDrug(target);
    try {
      // 1. Fetch live openFDA drug label
      const label = await searchFdaDrugLabel(target);
      setFdaLabel(label);

      // 2. Run Clinical RAG safety analysis against patient's active regimen
      const report = await checkClinicalRagSafety(target, activeRegimen);
      setRagReport(report);
    } catch (err) {
      console.error('FDA RAG search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleSearch('Lisinopril');
  }, [patientId]);

  const handleAddSearchedMed = async () => {
    if (!activeDrug) return;
    await addCustomMedication(activeDrug, 'morning', 'Take as directed by physician');
    setToastMessage(`Added "${activeDrug}" to ${currentPatientObj.name || patientId}'s regimen!`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="animate-fade-slide">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <BookOpen size={24} color="var(--primary)" />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-pure)' }}>
              Clinical RAG & Official FDA Drug Safety Engine
            </h1>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Real-time Retrieval-Augmented Generation grounding prescriptions against live US FDA Structured Product Labels (SPL) and DailyMed monographs.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span className="cs-badge cs-badge-emerald" style={{ fontSize: '0.78rem' }}>
            <Activity size={13} />
            <span>openFDA Live API Connected</span>
          </span>
        </div>
      </div>

      {/* Toast alert */}
      {toastMessage && (
        <div
          className="cs-card animate-fade-slide"
          style={{
            padding: '0.75rem 1.25rem',
            marginBottom: '1.25rem',
            background: 'var(--primary-subtle)',
            border: '1px solid #a7f3d0',
            color: 'var(--primary)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.86rem',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Drug Search Bar & Presets */}
      <div className="cs-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.75rem', background: '#ffffff' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(searchQuery);
          }}
          style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}
        >
          <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
            <Search size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search any drug (e.g. Lisinopril, Metformin, Warfarin, Ibuprofen, Atorvastatin, Eliquis)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.4rem',
                borderRadius: '8px',
                border: '1px solid var(--border-default)',
                fontSize: '0.9rem',
                color: 'var(--text-pure)',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="cs-btn cs-btn-primary"
            style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem' }}
          >
            {isLoading ? <Activity size={16} className="spin" /> : <Search size={16} />}
            <span>Retrieve FDA Label</span>
          </button>
        </form>

        {/* Preset Quick Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-dim)', fontWeight: 600 }}>Quick Evaluate:</span>
          {PRESET_DRUGS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => {
                setSearchQuery(d);
                handleSearch(d);
              }}
              className={`cs-badge ${activeDrug.toLowerCase() === d.toLowerCase() ? 'cs-badge-cyan' : 'cs-badge-slate'}`}
              style={{ cursor: 'pointer', padding: '0.25rem 0.65rem', fontSize: '0.76rem' }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Clinical RAG Verdict + Label Data */}
      {isLoading ? (
        <div className="cs-card" style={{ padding: '4rem', textAlign: 'center', background: '#ffffff' }}>
          <Activity size={32} color="var(--primary)" style={{ animation: 'spin 1.5s linear infinite', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-pure)' }}>
            Grounding FDA Monograph for {activeDrug}...
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Querying openFDA Structured Product Label API and synthesizing RAG interaction matrix.
          </p>
        </div>
      ) : fdaLabel ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.75rem' }}>
          {/* Left Column: Clinical RAG Safety Evaluation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* RAG Verification Banner */}
            <div
              className="cs-card"
              style={{
                padding: '1.5rem',
                background: ragReport?.conflicts_detected?.length > 0 ? 'var(--danger-subtle)' : 'var(--primary-subtle)',
                border: `1px solid ${ragReport?.conflicts_detected?.length > 0 ? 'var(--danger-border)' : '#a7f3d0'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  {ragReport?.conflicts_detected?.length > 0 ? (
                    <AlertTriangle size={22} color="var(--danger)" />
                  ) : (
                    <CheckCircle2 size={22} color="var(--primary)" />
                  )}
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: ragReport?.conflicts_detected?.length > 0 ? 'var(--danger)' : 'var(--primary)' }}>
                    {ragReport?.conflicts_detected?.length > 0
                      ? `RAG Conflict Flagged (${ragReport.conflicts_detected.length})`
                      : 'RAG Safety Check Passed'}
                  </h2>
                </div>

                <span
                  className={`cs-badge ${ragReport?.conflicts_detected?.length > 0 ? 'cs-badge-crimson' : 'cs-badge-emerald'}`}
                  style={{ fontSize: '0.72rem' }}
                >
                  Target: {activeDrug}
                </span>
              </div>

              <p style={{ fontSize: '0.86rem', color: 'var(--text-main)', lineHeight: 1.5, marginBottom: '1rem' }}>
                Evaluated against active patient <strong>{currentPatientObj.name || patientId}</strong>'s current regimen: [
                <em>{activeRegimen.join(', ') || 'No active medications'}</em>].
              </p>

              {/* Conflict citations if present */}
              {ragReport?.conflicts_detected?.map((conflict, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '1rem',
                    background: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid var(--border-default)',
                    marginBottom: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--danger)' }}>
                      Conflict with: {conflict.interacting_drug}
                    </strong>
                    <span className="cs-badge cs-badge-crimson" style={{ fontSize: '0.7rem' }}>
                      {conflict.severity} Severity
                    </span>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                    {conflict.fda_warning_excerpt}
                  </p>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                    <strong>Clinical Action:</strong> {conflict.clinical_recommendation}
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={handleAddSearchedMed}
                  className="cs-btn cs-btn-primary"
                  style={{ fontSize: '0.82rem' }}
                >
                  <Plus size={14} />
                  <span>Add {activeDrug} to Patient Regimen</span>
                </button>

                <a
                  href={fdaLabel.dailymed_url}
                  target="_blank"
                  rel="noreferrer"
                  className="cs-btn cs-btn-secondary"
                  style={{ fontSize: '0.82rem', textDecoration: 'none' }}
                >
                  <span>View on DailyMed</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>

            {/* Geriatric Precautions Box */}
            <div className="cs-card" style={{ padding: '1.5rem', background: '#ffffff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.85rem' }}>
                <User size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-pure)' }}>
                  FDA Geriatric Use Considerations
                </h3>
              </div>

              {fdaLabel.geriatric_use && fdaLabel.geriatric_use.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {fdaLabel.geriatric_use.map((text, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.85rem 1rem',
                        background: 'var(--surface-2)',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        color: 'var(--text-main)',
                        lineHeight: 1.55,
                        border: '1px solid var(--border-default)',
                      }}
                    >
                      {text}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  No specific geriatric contraindications listed on product label.
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Live FDA Label Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header Identity Card */}
            <div className="cs-card" style={{ padding: '1.5rem', background: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-pure)' }}>
                    {fdaLabel.brand_name}
                  </h2>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    Generic: <strong>{fdaLabel.generic_name}</strong>
                  </div>
                </div>

                <span className="cs-badge cs-badge-cyan" style={{ fontSize: '0.72rem' }}>
                  {fdaLabel.source}
                </span>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
                Manufacturer / Sponsor: <strong>{fdaLabel.manufacturer}</strong>
              </div>

              {/* Boxed Warnings */}
              {fdaLabel.boxed_warning && fdaLabel.boxed_warning.length > 0 && (
                <div
                  style={{
                    padding: '1rem',
                    background: '#fff1f2',
                    borderRadius: '8px',
                    border: '1.5px solid #fecdd3',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.4rem', color: '#be123c' }}>
                    <ShieldAlert size={16} />
                    <strong style={{ fontSize: '0.85rem' }}>FDA BLACK BOX WARNING</strong>
                  </div>
                  {fdaLabel.boxed_warning.map((bw, idx) => (
                    <p key={idx} style={{ fontSize: '0.8rem', color: '#881337', lineHeight: 1.5 }}>
                      {bw}
                    </p>
                  ))}
                </div>
              )}

              {/* Contraindications */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.4rem' }}>
                  Contraindications:
                </div>
                {fdaLabel.contraindications && fdaLabel.contraindications.length > 0 ? (
                  fdaLabel.contraindications.map((ci, idx) => (
                    <p key={idx} style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.5, marginBottom: '0.35rem' }}>
                      &bull; {ci}
                    </p>
                  ))
                ) : (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>None recorded.</p>
                )}
              </div>

              {/* Drug Interactions Section */}
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.4rem' }}>
                  FDA Drug Interactions Summary:
                </div>
                {fdaLabel.drug_interactions && fdaLabel.drug_interactions.length > 0 ? (
                  fdaLabel.drug_interactions.slice(0, 3).map((di, idx) => (
                    <p key={idx} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '0.45rem' }}>
                      {di}
                    </p>
                  ))
                ) : (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>None recorded.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
