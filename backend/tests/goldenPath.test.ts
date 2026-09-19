import { describe, it, expect } from 'vitest';
import { lambdaHandler } from '../src/main.js';

describe('CareSync Golden Path End-to-End Orchestration', () => {
  it('processes Dr. Smith clinical note and detects conflict for Grandma_Bob', async () => {
    const doctorsNote = (
      'Hi, this is Dr. Smith. I need Grandma Bob to start taking 400mg of Ibuprofen ' +
      'twice a day for her knee pain, morning and evening. She should continue her other meds.'
    );

    const event = {
      httpMethod: 'POST',
      path: '/process-note',
      body: JSON.stringify({
        user_id: 'User::Alice',
        patient_id: 'Grandma_Bob',
        doctors_note: doctorsNote,
      }),
    };

    const response = await lambdaHandler(event);
    expect(response.statusCode).toBe(200);

    const data = JSON.parse(response.body);

    // Verify Cedar authorization
    expect(data.authorization.authorized).toBe(true);
    expect(data.authorization.decision).toBe('Allow');

    // Verify patient profile
    expect(data.patient_name).toContain('Bob');
    expect(data.current_medications).toContain('Lisinopril 10mg');

    // Verify entity extraction
    expect(data.new_medications_detected.length).toBeGreaterThan(0);
    expect(data.new_medications_detected[0].drug).toBe('Ibuprofen');
    expect(data.new_medications_detected[0].dosage).toBe('400mg');

    // Verify drug conflict detection
    expect(data.conflict_found).toBe(true);
    expect(data.interaction_warnings.length).toBeGreaterThan(0);
    expect(data.interaction_warnings[0].severity).toBe('High');

    // Verify daily chronotherapy schedule
    expect(data.daily_schedule.morning.length).toBeGreaterThan(0);
    expect(data.daily_schedule.evening.length).toBeGreaterThan(0);

    // Verify simulated SNS alert dispatch
    expect(data.dispatched_emergency_alerts.length).toBeGreaterThan(0);
    expect(data.dispatched_emergency_alerts[0].severity).toBe('High');
  });
});
