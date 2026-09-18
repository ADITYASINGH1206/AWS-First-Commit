import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Sparkles, FileText, Play, RotateCcw } from 'lucide-react';

const SAMPLES = [
  {
    label: "Dr. Smith's Dictation (Golden Path)",
    author: "Dr. Smith, Primary Care",
    text: "Hi, this is Dr. Smith. I need Grandma Bob to start taking 400mg of Ibuprofen twice a day for her knee pain, morning and evening. She should continue her other meds.",
    tag: "High DDI Hazard",
  },
  {
    label: "Dr. Alvarez Cardiology Memo",
    author: "Dr. Alvarez, Cardiology",
    text: "Patient Roberta Bob reports persistent joint tenderness. Recommending Ibuprofen 400mg BID morning and evening with food. Verify renal baseline and Lisinopril tolerability.",
    tag: "Clinical Confirmation",
  }
];

export default function VoiceNoteRecorder({ doctorsNote, setDoctorsNote, onProcess, isLoading }) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isRecordingMic, setIsRecordingMic] = useState(false);

  // Synthesize speech or simulate audio playback
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
      setTimeout(() => setIsPlayingAudio(false), 4000);
    }
  };

  const handleSelectSample = (sample) => {
    setDoctorsNote(sample.text);
    handlePlayVoice(sample.text);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={18} color="#06b6d4" />
          <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f1f5f9' }}>
            Doctor Voice Note Ingestion (Unstructured Clinical Memo)
          </h2>
        </div>

        {/* Audio Waveform Simulator */}
        {isPlayingAudio && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--teal)', fontWeight: 600 }}>
              Audio Dictation Playing...
            </span>
            <div className="waveform-container">
              <div className="wave-bar" style={{ animationDelay: '0.1s' }}></div>
              <div className="wave-bar" style={{ animationDelay: '0.3s' }}></div>
              <div className="wave-bar" style={{ animationDelay: '0.5s' }}></div>
              <div className="wave-bar" style={{ animationDelay: '0.2s' }}></div>
              <div className="wave-bar" style={{ animationDelay: '0.4s' }}></div>
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
            style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem' }}
          >
            <Play size={12} color="#10b981" />
            <span>{s.label}</span>
            <span style={{
              fontSize: '0.65rem',
              padding: '0.1rem 0.35rem',
              borderRadius: '4px',
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#f87171'
            }}>
              {s.tag}
            </span>
          </button>
        ))}

        {doctorsNote && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => handlePlayVoice(doctorsNote)}
            style={{ fontSize: '0.78rem', padding: '0.45rem 0.75rem', marginLeft: 'auto' }}
            title="Read note aloud"
          >
            <Volume2 size={14} color="#06b6d4" />
            <span>Speak Note</span>
          </button>
        )}
      </div>

      {/* Clinical Text Input Box */}
      <div style={{ position: 'relative' }}>
        <textarea
          rows={4}
          value={doctorsNote}
          onChange={(e) => setDoctorsNote(e.target.value)}
          placeholder="Paste or dictate doctor's transcribed voice memo here (e.g. 'Hi, this is Dr. Smith. I need Grandma Bob to start taking 400mg of Ibuprofen twice a day...')"
          style={{
            width: '100%',
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid var(--border-card)',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
            color: '#f8fafc',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.9rem',
            lineHeight: 1.5,
            resize: 'vertical',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--teal)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border-card)')}
        />
      </div>

      {/* Action Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          Tip: Test with <strong>Eve</strong> to verify Cedar blocks unauthorized access, or with <strong>Alice</strong> to run the Golden Path.
        </span>

        <button
          type="button"
          className="btn-primary"
          onClick={onProcess}
          disabled={isLoading || !doctorsNote.trim()}
        >
          {isLoading ? (
            <>
              <div className="pulse-dot" style={{ width: '10px', height: '10px', backgroundColor: '#fff' }}></div>
              <span>Executing Strands Agent Loop...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Process Note with Strands Agent</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
