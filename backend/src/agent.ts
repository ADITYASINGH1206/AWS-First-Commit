/**
 * CareSync Strands Agent Core in TypeScript.
 * 
 * Orchestrates medication extraction, history lookup, drug conflict checking,
 * and daily chronotherapy schedule generation.
 */

import { fetchPatientHistory, checkDrugInteraction, generateDailySchedule } from './tools.js';
import type { AgentResult, ExtractedMedication, InteractionWarning } from './types.js';

export const CARESYNC_SYSTEM_PROMPT = `You are CareSync, an expert geriatric clinical AI assistant for elderly care.
Your duty is to assist families by processing unstructured doctor dictation notes, cross-referencing
active medications for the patient, catching adverse drug-drug interactions, and formatting
a clean, safe daily pill schedule.

You MUST use your registered tools:
1. fetch_patient_history(patient_id): Look up current medications on file.
2. check_drug_interaction(new_meds, current_meds): Evaluate potential adverse reactions.
3. generate_daily_schedule(medications): Organize pills into morning, afternoon, and evening slots.

Always emphasize safety and flag any severe drug conflicts.`;

/**
 * Extracts medication details from clinical text using regex and heuristics.
 */
export function extractMedicationsFromNote(doctorsNote: string): ExtractedMedication[] {
  const medsFound: ExtractedMedication[] = [];

  const drugCatalog = [
    'ibuprofen',
    'lisinopril',
    'warfarin',
    'aspirin',
    'metformin',
    'atorvastatin',
    'amlodipine',
    'omeprazole',
    'levothyroxine',
    'tramadol',
    'sertraline',
    'gabapentin',
    'furosemide',
  ];

  const noteLower = doctorsNote.toLowerCase();

  for (const drug of drugCatalog) {
    if (noteLower.includes(drug)) {
      // Extract dosage
      let dosage = 'Standard dose';
      const dosageMatch = noteLower.match(new RegExp(`${drug}\\s+(\\d+\\s*(?:mg|mcg|g|ml))`, 'i')) ||
        noteLower.match(new RegExp(`(\\d+\\s*(?:mg|mcg|g|ml))\\s+(?:of\\s+)?${drug}`, 'i'));
      if (dosageMatch) {
        dosage = dosageMatch[1].replace(/\s+/g, '');
      }

      // Extract frequency & timing
      let frequency = 'as needed';
      const timing: string[] = [];

      if (noteLower.includes('twice a day') || noteLower.includes('2x daily') || noteLower.includes('bid')) {
        frequency = 'twice a day';
      } else if (noteLower.includes('once a day') || noteLower.includes('daily') || noteLower.includes('qd')) {
        frequency = 'once a day';
      } else if (noteLower.includes('three times a day') || noteLower.includes('tid')) {
        frequency = 'three times a day';
      }

      if (noteLower.includes('morning')) timing.push('morning');
      if (noteLower.includes('afternoon')) timing.push('afternoon');
      if (noteLower.includes('evening') || noteLower.includes('night')) timing.push('evening');

      // Extract indication/reason
      const reasonMatch = noteLower.match(/for (?:her|his|their)?\s*([a-zA-Z\s]+?)(?:,|\.|\bmorning\b|\bevening\b)/i);
      const reason = reasonMatch ? reasonMatch[1].trim() : 'prescribed symptom relief';

      const capitalizedDrug = drug.charAt(0).toUpperCase() + drug.slice(1);
      medsFound.push({
        name: `${capitalizedDrug} ${dosage}`.trim(),
        drug: capitalizedDrug,
        dosage,
        frequency,
        timing: timing.length > 0 ? timing : ['morning'],
        reason,
      });
    }
  }

  // Fallback if no catalog matches
  if (medsFound.length === 0) {
    const genericMatch = doctorsNote.matchAll(/(\d+\s*mg)\s+(?:of\s+)?([A-Za-z]+)/gi);
    for (const match of genericMatch) {
      const dose = match[1];
      const name = match[2].charAt(0).toUpperCase() + match[2].slice(1).toLowerCase();
      medsFound.push({
        name: `${name} ${dose}`.trim(),
        drug: name,
        dosage: dose,
        frequency: 'as directed',
        timing: ['morning'],
        reason: 'clinical indication',
      });
    }
  }

  return medsFound;
}

export class CareSyncStrandsAgent {
  /**
   * Execute the complete Strands Agent execution loop.
   */
  public runGoldenPath(patientId: string, doctorsNote: string): AgentResult {
    // Step 1: Agent uses fetch_patient_history
    const historyResult = fetchPatientHistory(patientId);
    const currentMeds = historyResult.current_medications || [];
    const patientName = historyResult.name || patientId;

    // Step 2: Agent parses the new meds from note
    const newMedsParsed = extractMedicationsFromNote(doctorsNote);
    const newMedsNames = newMedsParsed.map((m) => m.name);

    // Step 3: Agent uses check_drug_interaction
    const interactionResult = checkDrugInteraction(newMedsNames, currentMeds);

    const interactionWarnings: InteractionWarning[] = [];
    if (interactionResult.conflict_found) {
      if (interactionResult.conflicts && interactionResult.conflicts.length > 0) {
        for (const c of interactionResult.conflicts) {
          interactionWarnings.push({
            drugs: c.drugs,
            severity: c.severity || 'High',
            warning: c.warning,
            clinical_guidance: c.clinical_guidance || 'Exercise clinical caution.',
          });
        }
      } else {
        interactionWarnings.push({
          drugs: [currentMeds[0] || 'Current', newMedsNames[0] || 'New'],
          severity: interactionResult.severity || 'High',
          warning: interactionResult.warning || interactionResult.details,
          clinical_guidance: 'Consult prescribing clinician immediately.',
        });
      }
    }

    // Step 4: Agent uses generate_daily_schedule
    const combinedMedsForSchedule: Array<{ medication: string; name: string; timing: string[]; instructions: string }> = [];

    for (const cm of currentMeds) {
      combinedMedsForSchedule.push({
        medication: cm,
        name: cm,
        timing: ['morning'],
        instructions: 'Existing maintenance regimen. Take with water.',
      });
    }

    for (const nm of newMedsParsed) {
      combinedMedsForSchedule.push({
        medication: nm.name,
        name: nm.name,
        timing: nm.timing || ['morning'],
        instructions: `New prescription for ${nm.reason}. ${nm.frequency}.`,
      });
    }

    const scheduleResult = generateDailySchedule(combinedMedsForSchedule);

    return {
      status: 'success',
      patient_id: patientId,
      patient_name: patientName,
      doctor_note_processed: doctorsNote,
      llm_engine: 'Strands Agent Runtime (TypeScript Edition)',
      current_medications: currentMeds,
      new_medications_detected: newMedsParsed,
      conflict_found: interactionResult.conflict_found,
      interaction_warnings: interactionWarnings,
      daily_schedule: scheduleResult,
      agent_execution_summary: {
        tools_invoked: [
          'fetch_patient_history',
          'check_drug_interaction',
          'generate_daily_schedule',
        ],
        conflicts_count: interactionWarnings.length,
      },
    };
  }
}

export const defaultAgent = new CareSyncStrandsAgent();
