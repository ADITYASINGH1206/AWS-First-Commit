/**
 * CareSync Agent Tools in TypeScript.
 * 
 * Implements clinical tools for patient history lookup, drug-drug interaction
 * checking, and daily chronotherapy schedule synthesis.
 */

import { getPatient, getPatients, getInteractions } from './db.js';
import type { DailySchedule, DrugInteractionInfo, InteractionWarning, PatientRecord } from './types.js';

/**
 * Fetches existing medications and clinical profile for the patient.
 */
export function fetchPatientHistory(patientId: string): {
  patient_id: string;
  name: string;
  current_medications: string[];
  allergies?: string[];
  authorized_family?: string[];
  error?: string;
} {
  const targetId = patientId.replace('Patient::', '').trim();
  const record = getPatient(targetId);

  if (record) {
    return {
      patient_id: targetId,
      name: record.name || targetId,
      current_medications: record.current_medications || [],
      allergies: record.allergies || [],
      authorized_family: record.authorized_family || [],
    };
  }

  const patients = getPatients();

  // Case-insensitive lookup fallback
  for (const [pid, data] of Object.entries(patients)) {
    if (
      pid.toLowerCase() === targetId.toLowerCase() ||
      pid.toLowerCase().replace(/_/g, '') === targetId.toLowerCase().replace(/\s/g, '')
    ) {
      return {
        patient_id: pid,
        name: data.name || pid,
        current_medications: data.current_medications || [],
        allergies: data.allergies || [],
        authorized_family: data.authorized_family || [],
      };
    }
  }

  return {
    patient_id: targetId,
    error: `Patient '${targetId}' not found in database`,
    current_medications: [],
    name: targetId,
  };
}

export function normalizeDrugName(drugStr: string): string {
  if (!drugStr) return '';
  const clean = drugStr.replace(/\d+(\.\d+)?\s*(mg|mcg|g|ml|tablets?|capsules?|pills?)/gi, '');
  const parts = clean.trim().split(/\s+/);
  return (parts[0] || drugStr).replace(/[^a-zA-Z]/g, '').toLowerCase();
}

/**
 * Checks for adverse reactions between lists of medications.
 */
export function checkDrugInteraction(
  newMeds: Array<string | { name: string }>,
  currentMeds: Array<string | { name: string }>
): {
  conflict_found: boolean;
  severity: string;
  warning: string;
  details: string;
  conflicts: InteractionWarning[];
} {
  const interactions = getInteractions() || {};
  const conflictsDetected: InteractionWarning[] = [];

  const newMedsList = Array.isArray(newMeds) ? newMeds : [newMeds];
  const currentMedsList = Array.isArray(currentMeds) ? currentMeds : [currentMeds];

  for (const newM of newMedsList) {
    const newMedText = typeof newM === 'string' ? newM : newM.name || '';
    const newStem = normalizeDrugName(newMedText);

    for (const curM of currentMedsList) {
      const curMedText = typeof curM === 'string' ? curM : curM.name || '';
      const curStem = normalizeDrugName(curMedText);

      for (const [ruleKey, ruleData] of Object.entries(interactions)) {
        const rulePair = ruleKey.split('-').map((p) => p.trim().toLowerCase());
        if (rulePair.length === 2) {
          const [p1, p2] = rulePair;
          // Check bidirectional matching
          const match1 = (newStem.includes(p1) && curStem.includes(p2)) || (newStem.includes(p2) && curStem.includes(p1));
          const match2 =
            (newMedText.toLowerCase().includes(p1) && curMedText.toLowerCase().includes(p2)) ||
            (newMedText.toLowerCase().includes(p2) && curMedText.toLowerCase().includes(p1));

          if (match1 || match2) {
            const warningMsg = ruleData.warning || 'Potential adverse clinical drug interaction.';
            conflictsDetected.push({
              drugs: [curMedText, newMedText],
              severity: ruleData.severity || 'High',
              warning: warningMsg,
              clinical_guidance: ruleData.clinical_guidance || '',
            });
          }
        }
      }
    }
  }

  if (conflictsDetected.length > 0) {
    const primary = conflictsDetected[0];
    const detailsText = `Interaction between ${primary.drugs.join(' + ')}: ${primary.warning}`;
    return {
      conflict_found: true,
      severity: primary.severity,
      warning: primary.warning,
      details: detailsText,
      conflicts: conflictsDetected,
    };
  }

  return {
    conflict_found: false,
    severity: 'None',
    warning: '',
    details: 'No adverse interactions detected between current and new medications.',
    conflicts: [],
  };
}

/**
 * Assigns medications to Morning, Afternoon, Evening, and Bedtime slots based on instructions.
 */
export function generateDailySchedule(medications: Array<string | { name?: string; medication?: string; instructions?: string; timing?: string[] }>): DailySchedule {
  const schedule: DailySchedule = {
    morning: [],
    afternoon: [],
    evening: [],
    bedtime: [],
  };

  if (!medications || medications.length === 0) {
    return schedule;
  }

  for (const item of medications) {
    let medName = '';
    let timing: string[] = [];
    let instructions = 'Take with water';

    if (typeof item === 'string') {
      medName = item;
    } else if (typeof item === 'object' && item !== null) {
      medName = item.name || item.medication || 'Medication';
      timing = item.timing || [];
      instructions = item.instructions || 'Take as directed';
    } else {
      continue;
    }

    const lowerText = `${medName} ${instructions} ${timing.join(' ')}`.toLowerCase();

    // Specific drug chronotherapy rules
    if (lowerText.includes('lisinopril')) {
      instructions = 'Take once daily in morning with water; monitor blood pressure';
      schedule.morning.push({ medication: medName, instructions });
    } else if (lowerText.includes('ibuprofen')) {
      // Twice a day: morning and evening
      schedule.morning.push({
        medication: medName,
        instructions: 'Take with breakfast or food to avoid stomach upset',
      });
      schedule.evening.push({
        medication: medName,
        instructions: 'Take with dinner or a glass of milk',
      });
    } else if (lowerText.includes('warfarin')) {
      schedule.evening.push({
        medication: medName,
        instructions: 'Take at 6:00 PM consistently',
      });
    } else {
      let assigned = false;
      if (lowerText.includes('morning') || lowerText.includes('breakfast')) {
        schedule.morning.push({ medication: medName, instructions });
        assigned = true;
      }
      if (lowerText.includes('afternoon') || lowerText.includes('lunch') || lowerText.includes('midday')) {
        schedule.afternoon.push({ medication: medName, instructions });
        assigned = true;
      }
      if (lowerText.includes('evening') || lowerText.includes('dinner') || lowerText.includes('night')) {
        schedule.evening.push({ medication: medName, instructions });
        assigned = true;
      }
      if (lowerText.includes('bedtime') || lowerText.includes('bed')) {
        schedule.bedtime.push({ medication: medName, instructions });
        assigned = true;
      }

      if (!assigned) {
        schedule.morning.push({ medication: medName, instructions });
      }
    }
  }

  return schedule;
}
