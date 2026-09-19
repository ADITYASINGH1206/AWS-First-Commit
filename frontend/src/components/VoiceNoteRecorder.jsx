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
    <section className="cs-card" style={{ padding: '1.4rem' }} aria-label="Doctor Clinical Dictation Console">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--primary-subtle)',
              border: '1px solid rgba(5, 150, 105, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Stethoscope size={16} color="#10b981" />
          </div>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-pure)' }}>
              Doctor Voice Dictation Ingestion
            </h2>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Raw conversational speech-to-text input (Amazon Transcribe simulation)
            </p>
          </div>
        </div>

        {/* Audio Waveform Simulator */}
        {isPlayingAudio && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(8, 145, 178, 0.15)', padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--cyan-light)', fontWeight: 600 }}>
              Synthesized Voice Note Playing...
            </span>
            <div className="waveform-bars">
              <div className="waveform-bar" style={{ animationDelay: '0.1s' }}></div>
              <div className="waveform-bar" style={{ animationDelay: '0.3s' }}></div>
              <div className="waveform-bar" style={{ animationDelay: '0.5s' }}></div>
              <div className="waveform-bar" style={{ animationDelay: '0.2s' }}></div>
              <div className="waveform-bar" style={{ animationDelay: '0.4s' }}></div>
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
            className="btn-secondary"
            onClick={() => handleSelectSample(s)}
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}
          >
            <Play size={13} color="#10b981" />
            <span>{s.label}</span>
            <span className={`cs-badge ${s.badgeClass}`} style={{ fontSize: '0.64rem', padding: '0.1rem 0.35rem' }}>
              {s.tag}
            </span>
          </button>
        ))}

        {doctorsNote && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => handlePlayVoice(doctorsNote)}
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem', marginLeft: 'auto' }}
            title="Read current dictation aloud"
          >
            <Volume2 size={14} color="#06b6d4" />
            <span>Hear Audio</span>
          </button>
        )}
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
            background: 'rgba(0, 0, 0, 0.45)',
            border: '1px solid var(--border-default)',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
            color: '#ffffff',
            fontFamily: 'var(--font-body)',
            fontSize: '0.92rem',
            lineHeight: 1.55,
            resize: 'vertical',
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--cyan)';
            e.target.style.boxShadow = '0 0 0 3px rgba(8, 145, 178, 0.25)';
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
          {doctorsNote.length} characters &bull; Strands Agent will parse medications and query DDI matrix
        </span>

        <button
          type="button"
          className="btn-primary"
          onClick={onProcess}
          disabled={isLoading || !doctorsNote.trim()}
          style={{ minWidth: '220px', justifyContent: 'center' }}
        >
          {isLoading ? (
            <>
              <div className="cs-pulse-dot" style={{ backgroundColor: '#fff', width: '8px', height: '8px' }}></div>
              <span>Executing Strands Agent...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Process Note & Verify DDIs</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
}
