import React, { useState, useEffect } from 'react';
import { useCareSync } from '../context/CareSyncContext';
import {
  ArrowRight,
  ShieldCheck,
  CalendarDays,
  Smartphone,
  Play,
  Pause,
  Sparkles,
  Activity,
} from 'lucide-react';

export default function HomePage() {
  const { navigateTo } = useCareSync();

  // Walkthrough Simulator state
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoStep, setVideoStep] = useState(0);

  const demoSteps = [
    {
      title: '1. Clinical Dictation & Speech Ingestion',
      desc: 'Doctor dictates "400mg Ibuprofen for Grandma Bob". The system transcribes the clinical note and extracts medication dosages and instructions.',
      badge: 'Clinical Ingestion',
      color: '#0891b2',
      route: 'intake',
    },
    {
      title: '2. Zero-Trust Access Authorization Gate',
      desc: 'Evaluates caller credentials against family healthcare proxy permissions. Explicitly isolates unauthorized callers.',
      badge: 'Access Control',
      color: '#059669',
      route: 'security',
    },
    {
      title: '3. Adverse Drug Interaction Detection',
      desc: 'Pharmacokinetic checks flag Lisinopril 10mg + Ibuprofen 400mg conflict (risk of acute kidney decompensation & hypertension spike).',
      badge: 'Hazard Detection',
      color: '#dc2626',
      route: 'alerts',
    },
    {
      title: '4. Chronotherapy Daily Schedule Optimization',
      desc: 'Organizes medications into a 4-slot circadian Bento grid (Morning, Afternoon, Evening, Bedtime) to maximize efficacy.',
      badge: 'Circadian Scheduler',
      color: '#d97706',
      route: 'schedule',
    },
    {
      title: '5. Instant Multi-Channel Caregiver Dispatch',
      desc: 'Broadcasts instant push alerts to family caregivers via mobile phone and logs carrier SMS dispatches for audit compliance.',
      badge: 'Emergency Alerts',
      color: '#059669',
      route: 'alerts',
    },
  ];

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setVideoStep((prev) => (prev + 1) % demoSteps.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="animate-fade-slide" style={{ padding: '2rem 1.75rem 4rem' }}>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', maxWidth: '1080px', margin: '0 auto 3.5rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: '999px',
            background: 'var(--primary-subtle)',
            border: '1px solid rgba(5, 150, 105, 0.25)',
            marginBottom: '1.5rem',
          }}
        >
          <Sparkles size={15} color="var(--primary)" />
          <span style={{ fontSize: '0.84rem', color: 'var(--primary)', fontWeight: 600 }}>
            Eldercare Medication Safety & Chronotherapy Platform
          </span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: '-0.035em',
            color: 'var(--text-pure)',
            marginBottom: '1.25rem',
          }}
        >
          Autonomous Eldercare Medication Orchestration with{' '}
          <span style={{ color: 'var(--primary)' }}>
            Zero-Trust Safety
          </span>
        </h1>

        <p
          style={{
            fontSize: '1.15rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            maxWidth: '820px',
            margin: '0 auto 2.25rem',
          }}
        >
          CareSync continuously safeguards seniors by analyzing doctor dictations, catching hazardous drug-drug interactions, organizing circadian dosage schedules, and alerting family caregivers in real-time.
        </p>

        {/* Hero CTAs */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
          <button
            type="button"
            onClick={() => navigateTo('schedule')}
            className="cs-btn cs-btn-primary"
            style={{ fontSize: '1.05rem', padding: '0.85rem 1.85rem' }}
          >
            <span>Open Application Dashboard</span>
            <ArrowRight size={18} />
          </button>

          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('walkthrough-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="cs-btn cs-btn-secondary"
            style={{ fontSize: '1.05rem', padding: '0.85rem 1.5rem' }}
          >
            <Play size={16} />
            <span>Interactive Walkthrough</span>
          </button>
        </div>

        {/* Hero Visual Card */}
        <div
          className="cs-card"
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '20px',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <img
            src="/assets/hero_dashboard.jpg"
            alt="CareSync Medication Dashboard"
            style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '560px', objectFit: 'cover' }}
          />

          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(255, 255, 255, 0.96) 0%, rgba(255, 255, 255, 0.85) 60%, transparent 100%)',
              padding: '2rem 1.75rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <Activity size={18} color="var(--primary)" />
                <strong style={{ fontSize: '1.1rem', color: 'var(--text-pure)' }}>Eldercare Real-Time Monitoring Dashboard</strong>
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0 }}>
                Intelligent interaction checks, circadian slots, and family access control
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigateTo('schedule')}
              className="cs-btn cs-btn-primary"
              style={{ fontSize: '0.88rem' }}
            >
              <span>Explore Dashboard</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* Live System Metrics Bar */}
      <section
        className="cs-card animate-stagger-1"
        style={{
          maxWidth: '1200px',
          margin: '0 auto 4.5rem',
          padding: '1.75rem 2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          textAlign: 'center',
          background: '#ffffff',
        }}
      >
        <div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>
            &lt; 1 ms
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Zero-Trust Policy Verification
          </div>
        </div>

        <div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--cyan)', fontFamily: 'var(--font-display)' }}>
            100%
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Adverse Interaction Detection
          </div>
        </div>

        <div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--warning)', fontFamily: 'var(--font-display)' }}>
            4 Slots
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Circadian Chronotherapy Matrix
          </div>
        </div>

        <div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>
            Real-Time
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Mobile Phone Push Alerts
          </div>
        </div>
      </section>

      {/* Interactive System Walkthrough Simulator */}
      <section id="walkthrough-section" style={{ maxWidth: '1200px', margin: '0 auto 4.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-pure)' }}>
            System Walkthrough & Clinical Workflow
          </h2>
          <p style={{ fontSize: '0.94rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Step through the end-to-end clinical safety journey.
          </p>
        </div>

        <div
          className="cs-card"
          style={{
            padding: '2rem',
            background: '#ffffff',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {/* Simulator Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="cs-btn cs-btn-secondary"
                style={{ padding: '0.5rem 0.85rem' }}
              >
                {isPlaying ? <Pause size={15} /> : <Play size={15} />}
                <span>{isPlaying ? 'Pause Simulator' : 'Play Simulator'}</span>
              </button>
              <span className="cs-badge cs-badge-cyan" style={{ fontSize: '0.74rem' }}>
                Stage {videoStep + 1} of {demoSteps.length}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {demoSteps.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setVideoStep(idx);
                    setIsPlaying(false);
                  }}
                  style={{
                    width: '32px',
                    height: '8px',
                    borderRadius: '4px',
                    border: 'none',
                    background: videoStep === idx ? 'var(--primary)' : 'var(--border-default)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  title={`Jump to stage ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Active Step Showcase Display */}
          <div
            style={{
              padding: '2rem',
              background: 'var(--surface-2)',
              borderRadius: '14px',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div>
              <span
                className="cs-badge"
                style={{
                  background: '#ffffff',
                  color: demoSteps[videoStep].color,
                  border: `1px solid ${demoSteps[videoStep].color}`,
                  fontSize: '0.8rem',
                }}
              >
                {demoSteps[videoStep].badge}
              </span>
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-pure)' }}>
              {demoSteps[videoStep].title}
            </h3>

            <p style={{ fontSize: '1.02rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {demoSteps[videoStep].desc}
            </p>

            <div style={{ marginTop: '0.75rem' }}>
              <button
                type="button"
                onClick={() => navigateTo(demoSteps[videoStep].route)}
                className="cs-btn cs-btn-primary"
                style={{ fontSize: '0.86rem' }}
              >
                <span>Try this feature in dashboard</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Deep Dive Grid with Generated AI Visuals */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 4.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-pure)' }}>
            Core Safety Architecture
          </h2>
          <p style={{ fontSize: '0.94rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Built specifically to prevent medication errors and adverse reactions in elderly care.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Card 1: Zero-Trust Security */}
          <div className="cs-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '1.25rem', border: '1px solid var(--border-subtle)' }}>
              <img
                src="/assets/cedar_shield.jpg"
                alt="Zero-Trust Access Control"
                style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <ShieldCheck size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-pure)' }}>
                Zero-Trust Family Permissions
              </h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '1.25rem', flex: 1 }}>
              Strictly verifies healthcare proxy relationships before granting access to patient records. Unauthorized entities are halted before any sensitive health data is accessed.
            </p>
            <button
              type="button"
              onClick={() => navigateTo('security')}
              className="cs-btn cs-btn-secondary"
              style={{ fontSize: '0.84rem', width: '100%', justifyContent: 'center' }}
            >
              <span>View Access Control</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Card 2: Circadian Chronotherapy */}
          <div className="cs-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '1.25rem', border: '1px solid var(--border-subtle)' }}>
              <img
                src="/assets/smart_schedule.jpg"
                alt="Smart Chronotherapy Medication Schedule"
                style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <CalendarDays size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-pure)' }}>
                Circadian Chronotherapy Schedule
              </h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '1.25rem', flex: 1 }}>
              Optimizes pill administration across 4 daily slots (Morning, Afternoon, Evening, Bedtime) based on pharmacokinetic absorption and meal requirements.
            </p>
            <button
              type="button"
              onClick={() => navigateTo('schedule')}
              className="cs-btn cs-btn-secondary"
              style={{ fontSize: '0.84rem', width: '100%', justifyContent: 'center' }}
            >
              <span>View Daily Schedule</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Card 3: Real-Time Mobile Dispatch */}
          <div className="cs-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '1.25rem', border: '1px solid var(--border-subtle)' }}>
              <img
                src="/assets/mobile_alerts.jpg"
                alt="Real-time Mobile Phone Alerts"
                style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Smartphone size={20} color="var(--danger)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-pure)' }}>
                Emergency Caregiver Alerts
              </h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '1.25rem', flex: 1 }}>
              Sends instant push notifications directly to family members' mobile phones when high-risk drug interactions are identified.
            </p>
            <button
              type="button"
              onClick={() => navigateTo('alerts')}
              className="cs-btn cs-btn-secondary"
              style={{ fontSize: '0.84rem', width: '100%', justifyContent: 'center' }}
            >
              <span>Test Phone Alerts</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* Bottom Launch Application Banner */}
      <section
        className="cs-card"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '3rem 2rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdfa 100%)',
          border: '1px solid #a7f3d0',
          borderRadius: '20px',
        }}
      >
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-pure)', marginBottom: '0.75rem' }}>
          Ready to Test the Medication Dashboard?
        </h2>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto 2rem' }}>
          Enter the live interactive dashboard to manage patient schedules, record doctor notes, and evaluate medication safety.
        </p>

        <button
          type="button"
          onClick={() => navigateTo('schedule')}
          className="cs-btn cs-btn-primary"
          style={{ fontSize: '1.05rem', padding: '0.9rem 2rem' }}
        >
          <span>Open Application Dashboard</span>
          <ArrowRight size={18} />
        </button>
      </section>
    </div>
  );
}
