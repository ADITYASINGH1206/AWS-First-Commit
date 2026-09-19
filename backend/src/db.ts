/**
 * CareSync Persistent Database Engine in TypeScript.
 * 
 * Provides file-backed persistence for patients, custom medications,
 * circadian adherence logs, emergency alerts, and drug interaction rules.
 * All mutations write directly to disk so state survives restarts and refreshes.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PatientRecord, DrugInteractionInfo, DispatchedAlert } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In dev/src or compiled dist, find the persistent JSON file
function resolveDbPath(): string {
  // If running in dist, check if src/mockDb.json exists (source tree), else dist/mockDb.json
  const srcPath = path.resolve(__dirname, '../src/mockDb.json');
  if (fs.existsSync(srcPath)) {
    return srcPath;
  }
  const localPath = path.join(__dirname, 'mockDb.json');
  return localPath;
}

const DB_PATH = resolveDbPath();

export interface CareSyncDatabase {
  patients: Record<string, PatientRecord>;
  interactions: Record<string, DrugInteractionInfo>;
  adherence: Record<string, Record<string, any>>;
  alerts: DispatchedAlert[];
}

const INITIAL_DEFAULTS: CareSyncDatabase = {
  patients: {
    Grandma_Bob: {
      name: "Roberta 'Grandma' Bob",
      age: 78,
      authorized_family: ["User::Alice", "User::Charlie"],
      current_medications: ["Lisinopril 10mg"],
      allergies: ["Penicillin"],
      notes: "Mild hypertension, chronic knee osteoarthritis",
    },
    Grandpa_Arthur: {
      name: "Arthur Pendelton",
      age: 82,
      authorized_family: ["User::David"],
      current_medications: ["Warfarin 5mg"],
      allergies: ["Sulfa"],
      notes: "Atrial fibrillation, fall risk",
    },
  },
  interactions: {
    "Lisinopril-Ibuprofen": {
      severity: "High",
      warning: "May decrease kidney function and reduce BP control.",
      clinical_guidance: "NSAIDs inhibit renal prostaglandins, attenuating the hypotensive effect of ACE inhibitors and escalating the risk of acute renal failure.",
    },
    "Warfarin-Aspirin": {
      severity: "Critical",
      warning: "Severe compounding hemorrhagic risk; major bleeding hazard.",
      clinical_guidance: "Synergistic anticoagulant and antiplatelet inhibition markedly increases incidence of gastrointestinal and intracranial hemorrhages.",
    },
    "Metformin-Contrast": {
      severity: "High",
      warning: "Increased risk of fatal lactic acidosis.",
      clinical_guidance: "Iodinated radiocontrast media can impair renal filtration, causing metformin accumulation.",
    },
    "Sertraline-Tramadol": {
      severity: "High",
      warning: "Potential life-threatening Serotonin Syndrome.",
      clinical_guidance: "Dual serotonergic reuptake and release leads to excessive CNS serotonin stimulation.",
    },
  },
  adherence: {},
  alerts: [],
};

export function getDb(): CareSyncDatabase {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        patients: parsed.patients || INITIAL_DEFAULTS.patients,
        interactions: parsed.interactions || INITIAL_DEFAULTS.interactions,
        adherence: parsed.adherence || {},
        alerts: parsed.alerts || [],
      };
    }
  } catch (err) {
    console.error('[CareSync DB] Failed to read DB from', DB_PATH, err);
  }
  return { ...INITIAL_DEFAULTS };
}

export function saveDb(data: CareSyncDatabase): void {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[CareSync DB] Failed to write DB to', DB_PATH, err);
  }
}

// Patients CRUD
export function getPatients(): Record<string, PatientRecord> {
  const db = getDb();
  return db.patients;
}

export function getPatient(patientId: string): PatientRecord | null {
  const db = getDb();
  const cleanId = patientId.replace('Patient::', '').trim();
  if (db.patients[cleanId]) return db.patients[cleanId];

  // Case-insensitive fallback
  for (const [key, p] of Object.entries(db.patients)) {
    if (key.toLowerCase() === cleanId.toLowerCase()) {
      return p;
    }
  }
  return null;
}

export function savePatient(patientId: string, record: Partial<PatientRecord>): PatientRecord {
  const db = getDb();
  const cleanId = patientId.replace('Patient::', '').trim();
  const existing = db.patients[cleanId] || {
    name: cleanId,
    age: 75,
    authorized_family: ["User::Alice"],
    current_medications: [],
    allergies: [],
    notes: "",
  };

  const updated: PatientRecord = {
    ...existing,
    ...record,
    name: record.name || existing.name || cleanId,
    current_medications: record.current_medications || existing.current_medications || [],
  };

  db.patients[cleanId] = updated;
  saveDb(db);
  return updated;
}

export function addMedication(patientId: string, medication: string): PatientRecord {
  const db = getDb();
  const cleanId = patientId.replace('Patient::', '').trim();
  const p = getPatient(cleanId);
  const patient = p || {
    name: cleanId,
    age: 75,
    authorized_family: ["User::Alice"],
    current_medications: [],
    allergies: [],
    notes: "",
  };

  const current = patient.current_medications || [];
  if (!current.some((m) => m.toLowerCase() === medication.toLowerCase())) {
    current.push(medication);
  }
  patient.current_medications = current;
  db.patients[cleanId] = patient;
  saveDb(db);
  return patient;
}

export function removeMedication(patientId: string, medication: string): PatientRecord {
  const db = getDb();
  const cleanId = patientId.replace('Patient::', '').trim();
  const patient = getPatient(cleanId);
  if (patient) {
    patient.current_medications = (patient.current_medications || []).filter(
      (m) => m.toLowerCase() !== medication.toLowerCase()
    );
    db.patients[cleanId] = patient;
    saveDb(db);
    return patient;
  }
  throw new Error(`Patient ${cleanId} not found`);
}

// Adherence Logs
export function getAdherence(patientId: string): Record<string, any> {
  const db = getDb();
  const cleanId = patientId.replace('Patient::', '').trim();
  return db.adherence[cleanId] || {};
}

export function setAdherence(
  patientId: string,
  slot: string,
  medication: string,
  status: 'TAKEN' | 'PENDING'
): Record<string, any> {
  const db = getDb();
  const cleanId = patientId.replace('Patient::', '').trim();
  if (!db.adherence[cleanId]) {
    db.adherence[cleanId] = {};
  }
  const key = `${slot}_${medication}`;
  const record = {
    medication,
    slot,
    status,
    timestamp: new Date().toISOString(),
    dynamodb_table: 'caresync-adherence-tracker',
  };
  db.adherence[cleanId][key] = record;
  saveDb(db);
  return record;
}

// Drug Interactions
export function getInteractions(): Record<string, DrugInteractionInfo> {
  const db = getDb();
  return db.interactions;
}

export function addInteraction(
  pairKey: string,
  info: DrugInteractionInfo
): DrugInteractionInfo {
  const db = getDb();
  db.interactions[pairKey] = info;
  saveDb(db);
  return info;
}

// Emergency Alerts
export function getAlerts(): DispatchedAlert[] {
  const db = getDb();
  return db.alerts;
}

export function addAlert(alert: DispatchedAlert): void {
  const db = getDb();
  if (!db.alerts) db.alerts = [];
  db.alerts.unshift(alert);
  if (db.alerts.length > 50) {
    db.alerts = db.alerts.slice(0, 50);
  }
  saveDb(db);
}

// Reset Database
export function resetDb(): CareSyncDatabase {
  saveDb(INITIAL_DEFAULTS);
  return INITIAL_DEFAULTS;
}
