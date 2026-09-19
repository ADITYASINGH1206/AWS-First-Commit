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
import type { LambdaEvent, LambdaResponse, DispatchedAlert } from './types.js';

// In-memory stores mirroring DynamoDB and SNS logs for local simulation
const ADHERENCE_STORE: Record<string, Record<string, any>> = {};
const ALERTS_LOG: DispatchedAlert[] = [];

function corsHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
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

  // Route: Adherence endpoints (Simulated Amazon DynamoDB)
  if (path.includes('/adherence')) {
    if (httpMethod === 'GET') {
      const patient = event.queryStringParameters?.patient_id || 'Grandma_Bob';
      const logs = ADHERENCE_STORE[patient] || {};
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

      if (!ADHERENCE_STORE[patient]) {
        ADHERENCE_STORE[patient] = {};
      }
      const key = `${slot}_${medication}`;
      ADHERENCE_STORE[patient][key] = {
        medication,
        slot,
        status,
        timestamp: new Date().toISOString(),
        dynamodb_table: 'caresync-adherence-tracker',
      };

      return createResponse(200, {
        status: 'success',
        message: `Updated adherence for ${medication} to ${status}`,
        record: ADHERENCE_STORE[patient][key],
      });
    }
  }

  // Route: Alerts endpoint (Simulated Amazon SNS log)
  if (path.includes('/alerts')) {
    return createResponse(200, { alerts: ALERTS_LOG.slice(-20) });
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
          ALERTS_LOG.push(alertRecord);
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
