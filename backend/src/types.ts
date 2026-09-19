/**
 * CareSync TypeScript Interfaces & Type Contracts.
 */

export interface PatientRecord {
  name: string;
  age: number;
  authorized_family: string[];
  current_medications: string[];
  allergies: string[];
  notes: string;
}

export interface DrugInteractionInfo {
  severity: string;
  warning: string;
  clinical_guidance: string;
}

export interface InteractionWarning {
  drugs: string[];
  severity: string;
  warning: string;
  clinical_guidance: string;
}

export interface MedicationSlotItem {
  medication: string;
  instructions: string;
}

export interface DailySchedule {
  morning: MedicationSlotItem[];
  afternoon: MedicationSlotItem[];
  evening: MedicationSlotItem[];
  bedtime: MedicationSlotItem[];
}

export interface ExtractedMedication {
  name: string;
  drug: string;
  dosage: string;
  frequency: string;
  timing: string[];
  reason: string;
}

export interface CedarAuthResult {
  authorized: boolean;
  decision: 'Allow' | 'Deny';
  principal: string;
  resource: string;
  action: string;
  diagnostics: string[];
}

export interface DispatchedAlert {
  alert_id: string;
  timestamp: string;
  topic_arn: string;
  patient_id: string;
  severity: string;
  drugs: string[];
  subject: string;
  message: string;
}

export interface AgentResult {
  status: string;
  patient_id: string;
  patient_name: string;
  doctor_note_processed: string;
  llm_engine: string;
  current_medications: string[];
  new_medications_detected: ExtractedMedication[];
  conflict_found: boolean;
  interaction_warnings: InteractionWarning[];
  daily_schedule: DailySchedule;
  agent_execution_summary: {
    tools_invoked: string[];
    conflicts_count: number;
  };
  authorization?: CedarAuthResult;
  dispatched_emergency_alerts?: DispatchedAlert[];
}

export interface LambdaEvent {
  httpMethod?: string;
  path?: string;
  headers?: Record<string, string>;
  queryStringParameters?: Record<string, string> | null;
  body?: string | null | Record<string, any>;
}

export interface LambdaResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}
