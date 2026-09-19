import React, { useState } from 'react';
import { useCareSync } from '../context/CareSyncContext';
import {
  X,
  Camera,
  UploadCloud,
  FileScan,
  CheckCircle2,
  AlertCircle,
  Pill,
  ArrowRight,
  Sparkles,
  Activity,
} from 'lucide-react';

const SAMPLE_PRESCRIPTIONS = [
  {
    label: 'Rx Bottle: Metformin 500mg',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
    parsed: {
      drug_name: 'Metformin 500mg',
      dosage: '500mg',
      slot: 'morning',
      frequency: 'twice daily with meals',
      instructions: 'Take 1 tablet by mouth twice daily with breakfast and dinner',
      doctor: 'Dr. Maria Alvarez, Endocrinology',
      rx_number: 'RX-948271',
    },
  },
  {
    label: 'Rx Label: Atorvastatin 20mg',
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop&q=60',
    parsed: {
      drug_name: 'Atorvastatin 20mg',
      dosage: '20mg',
      slot: 'bedtime',
      frequency: 'once daily at bedtime',
      instructions: 'Take 1 tablet by mouth at bedtime with water',
      doctor: 'Dr. Harold Smith, Cardiology',
      rx_number: 'RX-381902',
    },
  },
  {
    label: 'Blister Pack: Amlodipine 5mg',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=500&auto=format&fit=crop&q=60',
    parsed: {
      drug_name: 'Amlodipine 5mg',
      dosage: '5mg',
      slot: 'morning',
      frequency: 'once daily',
      instructions: 'Take 1 tablet every morning for blood pressure control',
      doctor: 'Dr. Sarah Jenkins, Primary Care',
      rx_number: 'RX-102934',
    },
  },
];

export default function PrescriptionScannerModal({ isOpen, onClose }) {
  const {
    patientId,
    addCustomMedication,
    setDoctorsNote,
    doctorsNote,
    navigateTo,
  } = useCareSync();

  const [selectedImage, setSelectedImage] = useState(SAMPLE_PRESCRIPTIONS[0].image);
  const [isScanning, setIsScanning] = useState(false);
  const [extractedData, setExtractedData] = useState(SAMPLE_PRESCRIPTIONS[0].parsed);
  const [toastMessage, setToastMessage] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        setSelectedImage(dataUrl);
        runOcrScan(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const runOcrScan = (sourceName = 'Prescription Bottle') => {
    setIsScanning(true);
    setExtractedData(null);

    // Realistic OCR extraction simulation
    setTimeout(() => {
      let result = SAMPLE_PRESCRIPTIONS[0].parsed;
      const lower = sourceName.toLowerCase();
      if (lower.includes('atorvastatin') || lower.includes('statin')) {
        result = SAMPLE_PRESCRIPTIONS[1].parsed;
      } else if (lower.includes('amlodipine')) {
        result = SAMPLE_PRESCRIPTIONS[2].parsed;
      }

      setExtractedData(result);
      setIsScanning(false);
      setToastMessage('OCR Extraction complete! Prescription details parsed.');
      setTimeout(() => setToastMessage(''), 3000);
    }, 1200);
  };

  const handleSelectSample = (sample) => {
    setSelectedImage(sample.image);
    setIsScanning(true);
    setExtractedData(null);
    setTimeout(() => {
      setExtractedData(sample.parsed);
      setIsScanning(false);
    }, 800);
  };

  const handleImportToRegimen = async () => {
    if (!extractedData) return;
    await addCustomMedication(
      extractedData.drug_name,
      extractedData.slot,
      extractedData.instructions
    );
    setToastMessage(`Imported ${extractedData.drug_name} into ${patientId}'s daily schedule!`);
    setTimeout(() => {
      onClose();
      navigateTo('schedule');
    }, 1200);
  };

  const handleAppendToDictation = () => {
    if (!extractedData) return;
    const noteText = `Prescription Bottle OCR Scan (${extractedData.rx_number}): Start ${extractedData.drug_name}. Directions: ${extractedData.instructions}. Prescribing physician: ${extractedData.doctor}.`;
    setDoctorsNote(doctorsNote ? `${doctorsNote}\n\n${noteText}` : noteText);
    setToastMessage('Prescription appended to clinical intake dictation!');
    setTimeout(() => {
      onClose();
      navigateTo('intake');
    }, 1200);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 110,
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(5px)',
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
          maxWidth: '720px',
          maxHeight: '92vh',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'var(--primary-subtle)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Camera size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-pure)' }}>
                Computer Vision Prescription Scanner
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Upload or capture photos of pill bottles to extract dosages and directives via OCR
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
          >
            <X size={20} />
          </button>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div
            style={{
              padding: '0.65rem 1.75rem',
              background: 'var(--primary-subtle)',
              color: 'var(--primary)',
              fontSize: '0.84rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderBottom: '1px solid #a7f3d0',
            }}
          >
            <CheckCircle2 size={16} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Sample Selectors */}
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600, marginBottom: '0.5rem' }}>
              Select Sample Prescription Bottle Image:
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {SAMPLE_PRESCRIPTIONS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className={`cs-badge ${selectedImage === sample.image ? 'cs-badge-cyan' : 'cs-badge-slate'}`}
                  style={{ cursor: 'pointer', padding: '0.35rem 0.75rem', fontSize: '0.76rem' }}
                >
                  <Pill size={12} />
                  <span>{sample.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {/* Image Preview & Upload Container */}
            <div
              style={{
                borderRadius: '12px',
                border: '2px dashed var(--border-default)',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--surface-2)',
                position: 'relative',
                minHeight: '220px',
                overflow: 'hidden',
              }}
            >
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt="Prescription label scan preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '180px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  <UploadCloud size={36} color="var(--primary)" style={{ margin: '0 auto 0.5rem' }} />
                  <p style={{ fontSize: '0.84rem' }}>Drop prescription bottle photo here</p>
                </div>
              )}

              {/* Laser scanning beam overlay when scanning */}
              {isScanning && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, transparent, #059669, #10b981, transparent)',
                    boxShadow: '0 0 12px #059669',
                    animation: 'scanLaser 1.2s ease-in-out infinite alternate',
                  }}
                ></div>
              )}

              <label
                className="cs-btn cs-btn-secondary"
                style={{
                  marginTop: '0.75rem',
                  fontSize: '0.78rem',
                  padding: '0.35rem 0.75rem',
                  cursor: 'pointer',
                }}
              >
                <UploadCloud size={13} />
                <span>Upload Custom Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {/* OCR Extracted Details Box */}
            <div
              style={{
                borderRadius: '12px',
                border: '1px solid var(--border-default)',
                padding: '1.25rem',
                background: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <FileScan size={16} color="var(--primary)" />
                  <h3 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-pure)' }}>
                    OCR Extracted Clinical Fields
                  </h3>
                </div>
                {extractedData && (
                  <span className="cs-badge cs-badge-emerald" style={{ fontSize: '0.68rem' }}>
                    Confidence 98.4%
                  </span>
                )}
              </div>

              {isScanning ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Activity size={24} color="var(--primary)" className="spin" style={{ marginBottom: '0.5rem' }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Running OCR vision pipeline...</span>
                </div>
              ) : extractedData ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', flex: 1 }}>
                  <div style={{ padding: '0.6rem 0.8rem', background: 'var(--surface-2)', borderRadius: '6px', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-dim)', fontWeight: 600 }}>Medication: </span>
                    <strong style={{ color: 'var(--text-pure)' }}>{extractedData.drug_name}</strong>
                  </div>

                  <div style={{ padding: '0.6rem 0.8rem', background: 'var(--surface-2)', borderRadius: '6px', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-dim)', fontWeight: 600 }}>Dosage / Slot: </span>
                    <span style={{ color: 'var(--text-main)' }}>{extractedData.dosage} &bull; {extractedData.slot.toUpperCase()}</span>
                  </div>

                  <div style={{ padding: '0.6rem 0.8rem', background: 'var(--surface-2)', borderRadius: '6px', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-dim)', fontWeight: 600 }}>Clinical Directions: </span>
                    <p style={{ color: 'var(--text-main)', marginTop: '0.2rem', lineHeight: 1.4 }}>{extractedData.instructions}</p>
                  </div>

                  <div style={{ padding: '0.6rem 0.8rem', background: 'var(--surface-2)', borderRadius: '6px', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-dim)', fontWeight: 600 }}>Doctor: </span>
                    <span style={{ color: 'var(--text-muted)' }}>{extractedData.doctor}</span>
                  </div>
                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: '0.84rem' }}>
                  No data extracted yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '1rem 1.75rem',
            borderTop: '1px solid var(--border-default)',
            background: 'var(--surface-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="cs-btn cs-btn-secondary"
            style={{ fontSize: '0.82rem' }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleAppendToDictation}
            disabled={!extractedData}
            className="cs-btn cs-btn-secondary"
            style={{ fontSize: '0.82rem' }}
          >
            <span>Append to Clinical Note</span>
          </button>

          <button
            type="button"
            onClick={handleImportToRegimen}
            disabled={!extractedData}
            className="cs-btn cs-btn-primary"
            style={{ fontSize: '0.84rem' }}
          >
            <Sparkles size={14} />
            <span>Import into Daily Schedule</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
