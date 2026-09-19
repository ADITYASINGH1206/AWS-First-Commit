/**
 * CareSync Cedar Authorization Engine in TypeScript.
 * 
 * Implements Zero-Trust policy evaluation matching AWS Cedar specification:
 * permit(principal, action == Action::"ViewPatientRecord", resource)
 * when { principal in resource.authorized_family };
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CedarAuthResult, PatientRecord } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MOCK_DB_PATH = path.join(__dirname, 'mockDb.json');
const POLICIES_PATH = path.join(__dirname, 'policies.cedar');

export function loadCedarPolicies(): string {
  try {
    if (fs.existsSync(POLICIES_PATH)) {
      return fs.readFileSync(POLICIES_PATH, 'utf-8');
    }
  } catch (err) {
    console.warn('Could not read policies.cedar directly, using embedded contract');
  }
  return `// CareSync Zero-Trust Medication Access Policy
permit(
    principal,
    action == Action::"ViewPatientRecord",
    resource
)
when {
    principal in resource.authorized_family
};`;
}

export function loadMockDb(): { patients: Record<string, PatientRecord>; interactions: Record<string, any> } {
  const content = fs.readFileSync(MOCK_DB_PATH, 'utf-8');
  return JSON.parse(content);
}

/**
 * Evaluates Cedar policy for incoming principal, action, and resource.
 */
export function evaluateAuthorization(
  principal: string,
  patientId: string,
  action: string = 'ViewPatientRecord'
): CedarAuthResult {
  const cleanUserId = principal.replace('User::', '').trim();
  const cleanPatientId = patientId.replace('Patient::', '').trim();
  const cleanActionId = action.replace('Action::', '').trim();

  const db = loadMockDb();
  const patient = db.patients[cleanPatientId];

  const canonicalPrincipal = `User::${cleanUserId}`;
  const canonicalResource = `Patient::${cleanPatientId}`;
  const canonicalAction = `Action::${cleanActionId}`;

  // Action check
  if (cleanActionId !== 'ViewPatientRecord') {
    return {
      authorized: false,
      decision: 'Deny',
      principal: canonicalPrincipal,
      resource: canonicalResource,
      action: canonicalAction,
      diagnostics: [`Action '${canonicalAction}' not permitted by policy`],
    };
  }

  // Patient resource check
  if (!patient) {
    return {
      authorized: false,
      decision: 'Deny',
      principal: canonicalPrincipal,
      resource: canonicalResource,
      action: canonicalAction,
      diagnostics: [`Resource '${canonicalResource}' not found in Cedar entity store`],
    };
  }

  // Zero-Trust Rule: principal in resource.authorized_family
  const authorizedFamily = patient.authorized_family.map((f: string) => f.replace('User::', '').trim());
  const isAuthorized = authorizedFamily.includes(cleanUserId);

  const diagnostics: string[] = [];
  if (!isAuthorized) {
    diagnostics.push(
      `Zero-Trust Interception: Principal '${canonicalPrincipal}' not in ${canonicalResource}.authorized_family`
    );
  }

  return {
    authorized: isAuthorized,
    decision: isAuthorized ? 'Allow' : 'Deny',
    principal: canonicalPrincipal,
    resource: canonicalResource,
    action: canonicalAction,
    diagnostics,
  };
}
