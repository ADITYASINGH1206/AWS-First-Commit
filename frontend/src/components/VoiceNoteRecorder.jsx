import React, { useState } from 'react';
import { Volume2, Sparkles, FileText, Play, RotateCcw, Stethoscope } from 'lucide-react';

const SAMPLES = [
  {
    label: "Dr. Smith Dictation (Golden Path)",
    author: "Dr. Smith, Primary Care",
    text: "Hi, this is Dr. Smith. I need Grandma Bob to start taking 400mg of Ibuprofen twice a day for her knee pain, morning and evening. She should continue her other meds.",
    tag: "High DDI Conflict",
    badgeClass: "cs-badge-crimson",
  },
  {
    label: "Cardiology Clinical Memo",
    author: "Dr. Alvarez, Cardiology",
    text: "Patient Roberta Bob reports persistent joint tenderness. Prescribing Ibuprofen 400mg BID morning and evening with food. Verify renal baseline and Lisinopril tolerability.",
    tag: "Clinical Confirmation",
    badgeClass: "cs-badge-cyan",
  }
];

export default function VoiceNoteRecorder({ doctorsNote, setDoctorsNote, onProcess, isLoading }) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handlePlayVoice = (textToSpeak) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingAudio(true);
      setTimeout(() => setIsPlayingAudio(false), 3500);
    }
  };

  const handleSelectSample = (sample) => {
    setDoctorsNote(sample.text);
    handlePlayVoice(sample.text);
  };

  return (
    <section className="cs-card" style={{ padding: '1.4rem', background: 'var(--surface-1)', border: '1px solid var(--border-default)' }} aria-label="Doctor Clinical Dictation Console">
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
            <Stethoscope size={16} color="#059669" />
          </div>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-pure)' }}>
              Doctor Voice Dictation Ingestion
            </h2>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Speech-to-text dictation input & automated clinical extraction
            </p>
          </div>
        </div>

        {/* Audio Waveform Simulator */}
        {isPlayingAudio && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
            <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>
              Synthesized Voice Note Playing...
            </span>
            <div className="waveform-bars">
              <div className="waveform-bar" style={{ animationDelay: '0.1s', background: '#059669' }}></div>
              <div className="waveform-bar" style={{ animationDelay: '0.3s', background: '#059669' }}></div>
              <div className="waveform-bar" style={{ animationDelay: '0.5s', background: '#059669' }}></div>
              <div className="waveform-bar" style={{ animationDelay: '0.2s', background: '#059669' }}></div>
              <div className="waveform-bar" style={{ animationDelay: '0.4s', background: '#059669' }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Preset Quick-Load Samples */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
        {SAMPLES.map((s, idx) => (
          <button
            key={idx}
            type="button"
            className="cs-btn cs-btn-secondary"
            onClick={() => handleSelectSample(s)}
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}
          >
            <Play size={13} color="#059669" />
            <span>{s.label}</span>
            <span className={`cs-badge ${s.badgeClass}`} style={{ fontSize: '0.64rem', padding: '0.1rem 0.35rem' }}>
              {s.tag}
            </span>
          </button>
        ))}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem' }}>
          {doctorsNote && (
            <button
              type="button"
              className="cs-btn cs-btn-secondary"
              onClick={() => handlePlayVoice(doctorsNote)}
              style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}
              title="Read current dictation aloud"
            >
              <Volume2 size={14} color="#0284c7" />
              <span>Hear Audio</span>
            </button>
          )}

          <button
            type="button"
            className="cs-btn cs-btn-secondary"
            onClick={() => setDoctorsNote('')}
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}
            title="Clear current clinical note"
          >
            <RotateCcw size={13} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Clinical Text Area */}
      <div style={{ position: 'relative' }}>
        <textarea
          rows={4}
          value={doctorsNote}
          onChange={(e) => setDoctorsNote(e.target.value)}
          placeholder="Paste or record doctor's clinical dictation note (e.g. 'Hi, this is Dr. Smith. I need Grandma Bob to start taking 400mg of Ibuprofen twice a day...')"
          style={{
            width: '100%',
            background: 'var(--surface-1)',
            border: '1px solid var(--border-default)',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
            color: 'var(--text-pure)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.92rem',
            lineHeight: 1.55,
            resize: 'vertical',
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--primary-light)';
            e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.15)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--border-default)';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Action Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          {doctorsNote.length} characters &bull; Clinical agent will parse medications and query DDI matrix
        </span>

        <button
          type="button"
          className="cs-btn cs-btn-primary"
          onClick={onProcess}
          disabled={isLoading || !doctorsNote.trim()}
          style={{ minWidth: '220px', justifyContent: 'center' }}
        >
          {isLoading ? (
            <>
              <div className="cs-pulse-dot" style={{ backgroundColor: '#fff', width: '8px', height: '8px' }}></div>
              <span>Analyzing Medication Regimen...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Process Note & Verify Interactions</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
}

