import React, { useState, useEffect } from 'react';
import { useCareSync } from '../context/CareSyncContext';
import {
  ArrowRight,
  ShieldCheck,
  Cpu,
  CalendarDays,
  Smartphone,
  Play,
  Pause,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Activity,
} from 'lucide-react';

export default function HomePage() {
  const { navigateTo } = useCareSync();

  // Video Simulator state
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoStep, setVideoStep] = useState(0);

  const demoSteps = [
    {
      title: '1. Clinical Dictation & Speech Ingestion',
      desc: 'Doctor dictates "400mg Ibuprofen for Grandma Bob". Strands Agent ingests voice note and extracts medication entities.',
      badge: 'Strands Agents SDK',
      color: '#06b6d4',
    },
    {
      title: '2. Cedar Zero-Trust Authorization Gate',
      desc: 'AWS Cedar evaluates caller credentials against policies.cedar in Rust. Verifies family healthcare proxy permissions.',
      badge: 'Cedar Policy Engine',
      color: '#10b981',
    },
    {
      title: '3. Adverse Drug Interaction Detection',
      desc: 'Pharmacokinetic tool detects Lisinopril 10mg + Ibuprofen 400mg conflict (risk of renal failure & blood pressure loss).',
      badge: 'High Hazard Flagged',
      color: '#ef4444',
    },
    {
      title: '4. Chronotherapy Daily Schedule Optimization',
      desc: '4-slot circadian Bento grid balances morning and evening administrations with food requirements.',
      badge: 'Circadian Scheduler',
      color: '#f59e0b',
    },
    {
      title: '5. Instant Multi-Channel Caregiver Dispatch',
      desc: 'Simulated Amazon SNS publishes carrier SMS to Alice, and instant push alert broadcasts to mobile phone via ntfy.sh.',
      badge: 'Mobile Alerts Live',
      color: '#34d399',
    },
  ];

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setVideoStep((prev) => (prev + 1) % demoSteps.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="animate-fade-slide">
      {/* Hero Section */}
      <section style={{ padding: '2rem 0 3.5rem', textAlign: 'center', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.35rem 0.95rem', borderRadius: '999px', background: 'rgba(8, 145, 178, 0.12)', border: '1px solid rgba(8, 145, 178, 0.3)', marginBottom: '1.5rem' }}>
          <Sparkles size={15} color="var(--cyan-light)" />
          <span style={{ fontSize: '0.84rem', color: 'var(--text-bright)', fontWeight: 600 }}>
            AWS First Commit Hackathon &bull; Local Cloud Simulation Track
          </span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            color: '#ffffff',
            marginBottom: '1.25rem',
          }}
        >
          Autonomous Eldercare Medication Orchestration with{' '}
          <span style={{ background: 'linear-gradient(135deg, #38bdf8 0%, #34d399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Zero-Trust Security
          </span>
        </h1>

        <p
          style={{
            fontSize: '1.1rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            maxWidth: '820px',
            margin: '0 auto 2rem',
          }}
        >
          CareSync safeguards seniors by continuously validating clinical notes, evaluating adverse drug-drug interactions, scheduling circadian chronotherapy dosages, and alerting family caregivers in real-time.
        </p>

        {/* Hero CTAs */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
          <button
            type="button"
            onClick={() => navigateTo('schedule')}
            className="cs-btn cs-btn-primary"
            style={{ fontSize: '1rem', padding: '0.85rem 1.85rem' }}
          >
            <span>Launch CareSync Application</span>
            <ArrowRight size={18} />
          </button>

          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('demo-player');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="cs-btn cs-btn-secondary"
            style={{ fontSize: '1rem', padding: '0.85rem 1.5rem' }}
          >
            <Play size={16} />
            <span>Watch Live Walkthrough</span>
          </button>
        </div>

        {/* Hero Image Showcase */}
        <div
          className="cs-card"
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '20px',
            border: '1px solid rgba(8, 145, 178, 0.35)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(8, 145, 178, 0.2)',
          }}
        >
          <img
            src="/assets/hero_dashboard.jpg"
            alt="CareSync AI Eldercare Dashboard"
            style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '560px', objectFit: 'cover' }}
          />

          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(6, 9, 17, 0.95) 0%, rgba(6, 9, 17, 0.3) 70%, transparent 100%)',
              padding: '2rem 1.5rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <Activity size={18} color="var(--primary-light)" />
                <strong style={{ fontSize: '1.05rem', color: '#ffffff' }}>Eldercare Real-Time Monitoring Interface</strong>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0 }}>
                Powered by AWS Cedar Policy Engine &bull; Strands Agents SDK &bull; SAM Local Simulation
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigateTo('schedule')}
              className="cs-btn cs-btn-primary"
              style={{ fontSize: '0.86rem' }}
            >
              <span>Explore Live Dashboard</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* Key Metrics Band */}
      <section
        className="cs-card"
        style={{
          padding: '1.75rem 2rem',
          marginBottom: '4rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          textAlign: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--primary-light)', fontFamily: 'var(--font-display)' }}>
            &lt; 1 ms
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Zero-Trust Cedar Policy Evaluation
          </div>
        </div>

        <div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--cyan-light)', fontFamily: 'var(--font-display)' }}>
            3 Tools
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Autonomous Strands Agent Loops
          </div>
        </div>

        <div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#f59e0b', fontFamily: 'var(--font-display)' }}>
            4 Slots
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Circadian Chronotherapy Grid
          </div>
        </div>

        <div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#34d399', fontFamily: 'var(--font-display)' }}>
            Instant
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Multi-Channel Phone & SNS Dispatch
          </div>
        </div>
      </section>

      {/* Interactive Video Walkthrough Simulator */}
      <section id="demo-player" style={{ marginBottom: '4.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-bright)' }}>
            Interactive System Walkthrough
          </h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Step through the end-to-end golden path workflow executed on local AWS simulation.
          </p>
        </div>

        <div
          className="cs-card"
          style={{
            padding: '2rem',
            background: 'var(--surface-1)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {/* Video Control Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="cs-btn cs-btn-secondary"
                style={{ padding: '0.5rem 0.85rem' }}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                <span>{isPlaying ? 'Pause Simulator' : 'Play Simulator'}</span>
              </button>
              <span className="cs-badge cs-badge-cyan" style={{ fontSize: '0.74rem' }}>
                Step {videoStep + 1} of {demoSteps.length}
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
                    background: videoStep === idx ? 'var(--primary-light)' : 'rgba(255, 255, 255, 0.15)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  title={`Jump to step ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Active Step Showcase Display */}
          <div
            style={{
              padding: '2rem',
              background: 'var(--surface-0)',
              borderRadius: '14px',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span
                className="cs-badge"
                style={{
                  background: `${demoSteps[videoStep].color}22`,
                  color: demoSteps[videoStep].color,
                  border: `1px solid ${demoSteps[videoStep].color}44`,
                  fontSize: '0.8rem',
                }}
              >
                {demoSteps[videoStep].badge}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                AWS SAM Local &bull; Port 3001
              </span>
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-bright)' }}>
              {demoSteps[videoStep].title}
            </h3>

            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {demoSteps[videoStep].desc}
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  if (videoStep === 0) navigateTo('intake');
                  else if (videoStep === 1) navigateTo('security');
                  else if (videoStep === 2) navigateTo('alerts');
                  else if (videoStep === 3) navigateTo('schedule');
                  else navigateTo('alerts');
                }}
                className="cs-btn cs-btn-primary"
                style={{ fontSize: '0.86rem' }}
              >
                <span>Try this feature in app</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Deep Dive Grid with Generated AI Visuals */}
      <section style={{ marginBottom: '4.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-bright)' }}>
            Engineered for Precision & Healthcare Safety
          </h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Built specifically to address the unique vulnerabilities of polypharmacy in elderly patients.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Card 1: Zero-Trust Security */}
          <div className="cs-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '1.25rem', border: '1px solid var(--border-subtle)' }}>
              <img
                src="/assets/cedar_shield.jpg"
                alt="AWS Cedar Zero Trust Shield"
                style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <ShieldCheck size={20} color="var(--cyan-light)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-bright)' }}>
                Zero-Trust Cedar Authorization
              </h3>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '1.25rem', flex: 1 }}>
              Evaluates incoming requests against formal Cedar policies in Rust. Explicitly blocks unauthorized callers before any access to protected health history or LLM prompt generation.
            </p>
            <button
              type="button"
              onClick={() => navigateTo('security')}
              className="cs-btn cs-btn-secondary"
              style={{ fontSize: '0.82rem', width: '100%', justifyContent: 'center' }}
            >
              <span>Test Security Gate</span>
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
              <CalendarDays size={20} color="var(--primary-light)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-bright)' }}>
                Circadian Chronotherapy Bento
              </h3>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '1.25rem', flex: 1 }}>
              Optimizes pill administration across 4 circadian slots (Morning, Afternoon, Evening, Bedtime) based on pharmacokinetic absorption curves and meal requirements.
            </p>
            <button
              type="button"
              onClick={() => navigateTo('schedule')}
              className="cs-btn cs-btn-secondary"
              style={{ fontSize: '0.82rem', width: '100%', justifyContent: 'center' }}
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
              <Smartphone size={20} color="var(--danger-light)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-bright)' }}>
                Multi-Channel Mobile Escalation
              </h3>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '1.25rem', flex: 1 }}>
              Combines simulated Amazon SNS topic publishing for carrier SMS with live real-time push broadcast to family caregivers' phones via ntfy.sh.
            </p>
            <button
              type="button"
              onClick={() => navigateTo('alerts')}
              className="cs-btn cs-btn-secondary"
              style={{ fontSize: '0.82rem', width: '100%', justifyContent: 'center' }}
            >
              <span>Test Phone Alerts</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* Bottom Launch Banner */}
      <section
        className="cs-card"
        style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(8, 145, 178, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)',
          border: '1px solid rgba(8, 145, 178, 0.35)',
          borderRadius: '20px',
        }}
      >
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem' }}>
          Experience CareSync in Action
        </h2>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto 2rem' }}>
          Test the complete golden path: doctor dictation intake, adverse interaction flags, chronotherapy schedules, and Cedar authorization.
        </p>

        <button
          type="button"
          onClick={() => navigateTo('schedule')}
          className="cs-btn cs-btn-primary"
          style={{ fontSize: '1.05rem', padding: '0.9rem 2rem' }}
        >
          <span>Open CareSync Application</span>
          <ArrowRight size={18} />
        </button>
      </section>
    </div>
  );
}
