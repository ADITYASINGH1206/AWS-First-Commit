import { describe, it, expect } from 'vitest';
import { queryOpenFdaDrugLabel, performClinicalRagCheck, extractBaseMolecule } from '../src/fdaRag.js';

describe('CareSync Clinical RAG & FDA Safety Engine', () => {
  it('extracts base molecule from prescription string', () => {
    expect(extractBaseMolecule('Lisinopril 10mg')).toBe('lisinopril');
    expect(extractBaseMolecule('Ibuprofen 400mg Oral Tablet')).toBe('ibuprofen');
    expect(extractBaseMolecule('Warfarin Sodium 5mg')).toBe('warfarin sodium');
  });

  it('queries FDA drug label with boxed warnings and geriatric guidance', async () => {
    const label = await queryOpenFdaDrugLabel('Lisinopril');
    expect(label.generic_name.toLowerCase()).toContain('lisinopril');
    expect(label.boxed_warning).toBeDefined();
    expect(label.geriatric_use).toBeDefined();
    expect(label.dailymed_url).toContain('dailymed.nlm.nih.gov');
  });

  it('performs Clinical RAG check detecting conflict between Lisinopril and Ibuprofen', async () => {
    const report = await performClinicalRagCheck('Ibuprofen 400mg', ['Lisinopril 10mg']);
    expect(report.target_drug).toBe('Ibuprofen 400mg');
    expect(report.conflicts_detected.length).toBeGreaterThan(0);
    expect(report.conflicts_detected[0].severity).toBe('High');
    expect(report.conflicts_detected[0].fda_warning_excerpt).toContain('FDA');
    expect(report.conflicts_detected[0].source_citation).toContain('FDA');
    expect(report.geriatric_risk_level).toBeDefined();
  });

  it('returns low risk and no conflicts for non-interacting regimen', async () => {
    const report = await performClinicalRagCheck('Claritin 10mg', ['Metformin 500mg']);
    expect(report.conflicts_detected.length).toBe(0);
    expect(report.is_contraindicated).toBe(false);
  });
});
