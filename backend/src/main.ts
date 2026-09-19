/**
 * CareSync Main AWS Lambda Handler & API Entry Point in TypeScript.
 * 
 * Processes doctor clinical notes, enforces Cedar policy authorization,
 * returns structured medication schedules and adverse conflict warnings,
 * and manages adherence tracking.
 */

import { evaluateAuthorization } from './cedarAuth.js';
import { defaultAgent } from './agent.js';
import { dispatchMultiChannelEmergencyAlert } from './notifier.js';
import {
  getPatients,
  getPatient,
  savePatient,
  addMedication,
  removeMedication,
  getAdherence,
  setAdherence,
  getInteractions,
  addInteraction,
  getAlerts,
  addAlert,
  resetDb,
} from './db.js';
import type { LambdaEvent, LambdaResponse, DispatchedAlert } from './types.js';

function corsHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key',
    'Access-Control-Max-Age': '86400',
  };
}

function createResponse(statusCode: number, body: Record<string, any>): LambdaResponse {
  return {
    statusCode,
    headers: corsHeaders(),
    body: JSON.stringify(body, null, 2),
  };
}

export async function lambdaHandler(event: LambdaEvent): Promise<LambdaResponse> {
  const httpMethod = (event.httpMethod || 'POST').toUpperCase();

  // 0. Handle HTTP OPTIONS (CORS preflight)
  if (httpMethod === 'OPTIONS') {
    return createResponse(200, { message: 'CORS preflight OK' });
  }

  const path = event.path || '/process-note';

  // Route: Patient & Medication Management (Persistent DB)
  if (path.includes('/patients')) {
    if (httpMethod === 'GET') {
      const patientId = event.queryStringParameters?.patient_id;
      if (patientId) {
        const patient = getPatient(patientId);
        if (!patient) return createResponse(404, { error: 'Patient not found' });
        return createResponse(200, { patient_id: patientId, patient });
      }
      return createResponse(200, { patients: getPatients() });
    }

    if (httpMethod === 'POST') {
      let body: any = {};
      if (event.body) {
        body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
      }

      if (path.includes('/medications/remove') || body.action === 'remove_medication') {
        const patientId = body.patient_id || 'Grandma_Bob';
        const medication = body.medication;
        if (!medication) return createResponse(400, { error: 'Missing medication to remove' });
        const updated = removeMedication(patientId, medication);
        return createResponse(200, { status: 'success', patient: updated });
      }

      if (path.includes('/medications') || body.action === 'add_medication') {
        const patientId = body.patient_id || 'Grandma_Bob';
        const medication = body.medication;
        if (!medication) return createResponse(400, { error: 'Missing medication' });
        const updated = addMedication(patientId, medication);
        return createResponse(200, { status: 'success', patient: updated });
      }

      // Save/Create patient
      const patientId = body.patient_id || body.id || (body.name ? body.name.replace(/\s+/g, '_') : 'Patient_New');
      const updated = savePatient(patientId, body);
      return createResponse(200, { status: 'success', patient: updated, patient_id: patientId });
    }
  }

  // Route: Adherence endpoints (Simulated Amazon DynamoDB with file persistence)
  if (path.includes('/adherence')) {
    if (httpMethod === 'GET') {
      const patient = event.queryStringParameters?.patient_id || 'Grandma_Bob';
      const logs = getAdherence(patient);
      return createResponse(200, { patient_id: patient, adherence_logs: logs });
    }

    if (httpMethod === 'POST') {
      let body: any = {};
      if (event.body) {
        body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
      }
      const patient = body.patient_id || 'Grandma_Bob';
      const slot = body.slot || 'morning';
      const medication = body.medication || 'Lisinopril 10mg';
      const status = body.status || 'TAKEN';

      const record = setAdherence(patient, slot, medication, status);
      return createResponse(200, {
        status: 'success',
        message: `Updated adherence for ${medication} to ${status}`,
        record,
      });
    }
  }

  // Route: Alerts endpoint (Simulated Amazon SNS log with file persistence)
  if (path.includes('/alerts')) {
    return createResponse(200, { alerts: getAlerts().slice(0, 30) });
  }

  // Route: Interactions query and custom rule injection
  if (path.includes('/interactions')) {
    if (httpMethod === 'GET') {
      return createResponse(200, { interactions: getInteractions() });
    }
    if (httpMethod === 'POST') {
      let body: any = {};
      if (event.body) {
        body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
      }
      if (!body.pair_key || !body.warning) {
        return createResponse(400, { error: 'Missing pair_key or warning in interaction rule' });
      }
      const saved = addInteraction(body.pair_key, {
        severity: body.severity || 'High',
        warning: body.warning,
        clinical_guidance: body.clinical_guidance || '',
      });
      return createResponse(200, { status: 'success', interaction: saved });
    }
  }

  // Route: Reset Database to default state
  if (path.includes('/reset-db')) {
    const fresh = resetDb();
    return createResponse(200, { status: 'success', message: 'Database reset to default seed', database: fresh });
  }

  // Route: Direct Notify Endpoint
  if (path.includes('/notify')) {
    let body: any = {};
    if (event.body) {
      body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    }
    const patientId = body.patient_id || 'Grandma_Bob';
    const warning = body.warning || {
      severity: body.severity || 'High',
      warning: body.message || 'Adverse interaction detected',
      drugs: body.drugs || ['Prescription Conflict'],
    };
    const topic = body.topic || null;
    const phone = body.phone || null;

    const dispatchResult = await dispatchMultiChannelEmergencyAlert(patientId, warning, topic, phone);
    return createResponse(200, { status: 'success', dispatch: dispatchResult });
  }

  // Golden Path Route: POST /process-note
  try {
    let bodyData: any = {};
    if (event.body) {
      bodyData = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    }

    const userId = bodyData.user_id || 'User::Alice';
    const patientId = bodyData.patient_id || 'Grandma_Bob';
    const doctorsNote = bodyData.doctors_note || '';

    if (!doctorsNote) {
      return createResponse(400, {
        error: 'Missing required field: doctors_note',
        status: 'error',
      });
    }

    // 1. Authorize with Cedar Engine
    const authResult = evaluateAuthorization(userId, patientId, 'ViewPatientRecord');

    if (!authResult.authorized) {
      return createResponse(403, {
        status: 'forbidden',
        error: 'Access Denied by AWS Cedar Policy Engine',
        message: `Principal '${userId}' is not authorized to access records for '${patientId}'.`,
        cedar_authorization: authResult,
        policy_enforced: 'permit(...) when { principal in resource.authorized_family };',
      });
    }

    // 2. Execute Strands Agent Golden Path
    const agentResult = defaultAgent.runGoldenPath(patientId, doctorsNote);
    agentResult.authorization = authResult;

    // 3. Dispatch simulated SNS alert if high severity conflict detected
    const dispatchedAlerts: DispatchedAlert[] = [];
    if (agentResult.conflict_found) {
      for (const warning of agentResult.interaction_warnings) {
        if (warning.severity === 'High' || warning.severity === 'Critical') {
          const alertRecord: DispatchedAlert = {
            alert_id: `sns-${Date.now()}`,
            timestamp: new Date().toISOString(),
            topic_arn: 'arn:aws:sns:us-east-1:000000000000:caresync-emergency-alerts',
            patient_id: patientId,
            severity: warning.severity,
            drugs: warning.drugs,
            subject: `URGENT: Adverse Drug Conflict for ${patientId}`,
            message: `CareSync Safety Alert: High-risk drug interaction detected for ${patientId}. Warning: ${warning.warning}. Immediate clinical review advised.`,
          };
          addAlert(alertRecord);
          dispatchedAlerts.push(alertRecord);
        }
      }
    }

    agentResult.dispatched_emergency_alerts = dispatchedAlerts;
    return createResponse(200, agentResult);
  } catch (err: any) {
    return createResponse(500, {
      status: 'error',
      error: 'Internal Server Error',
      details: err?.message || String(err),
    });
  }
}
