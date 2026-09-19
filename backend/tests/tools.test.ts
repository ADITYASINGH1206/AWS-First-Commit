import { describe, it, expect } from 'vitest';
import { fetchPatientHistory, checkDrugInteraction, generateDailySchedule } from '../src/tools.js';

describe('CareSync Clinical Agent Tools', () => {
  it('fetches patient history for Grandma_Bob with current medications', () => {
    const history = fetchPatientHistory('Grandma_Bob');
    expect(history.patient_id).toBe('Grandma_Bob');
    expect(history.current_medications).toContain('Lisinopril 10mg');
    expect(history.allergies).toContain('Penicillin');
  });

  it('detects high-severity interaction between Lisinopril and Ibuprofen', () => {
    const conflict = checkDrugInteraction(['Ibuprofen 400mg'], ['Lisinopril 10mg']);
    expect(conflict.conflict_found).toBe(true);
    expect(conflict.severity).toBe('High');
    expect(conflict.warning).toContain('decrease kidney function');
    expect(conflict.conflicts.length).toBeGreaterThan(0);
  });

  it('reports no conflict for safe medication pair', () => {
    const safeCheck = checkDrugInteraction(['Claritin 10mg'], ['Lisinopril 10mg']);
    expect(safeCheck.conflict_found).toBe(false);
    expect(safeCheck.severity).toBe('None');
    expect(safeCheck.conflicts.length).toBe(0);
  });

  it('generates daily schedule across 4 circadian slots', () => {
    const schedule = generateDailySchedule([
      { medication: 'Lisinopril 10mg', instructions: 'Take in morning' },
      { medication: 'Ibuprofen 400mg', instructions: 'Take morning and evening' },
    ]);

    expect(schedule.morning.length).toBe(2);
    expect(schedule.evening.length).toBe(1);
    expect(schedule.afternoon).toEqual([]);
    expect(schedule.bedtime).toEqual([]);
  });
});
