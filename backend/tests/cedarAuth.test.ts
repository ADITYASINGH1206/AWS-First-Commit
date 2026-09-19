import { describe, it, expect } from 'vitest';
import { evaluateAuthorization } from '../src/cedarAuth.js';
import { lambdaHandler } from '../src/main.js';

describe('CareSync Cedar Zero-Trust Authorization Engine', () => {
  it('allows Alice (authorized daughter) access to Grandma_Bob', () => {
    const result = evaluateAuthorization('User::Alice', 'Grandma_Bob', 'ViewPatientRecord');
    expect(result.authorized).toBe(true);
    expect(result.decision).toBe('Allow');
    expect(result.principal).toBe('User::Alice');
    expect(result.resource).toBe('Patient::Grandma_Bob');
  });

  it('allows Charlie (authorized son) access to Grandma_Bob', () => {
    const result = evaluateAuthorization('User::Charlie', 'Grandma_Bob', 'ViewPatientRecord');
    expect(result.authorized).toBe(true);
    expect(result.decision).toBe('Allow');
  });

  it('denies Eve (unauthorized attacker) access to Grandma_Bob', () => {
    const result = evaluateAuthorization('User::Eve', 'Grandma_Bob', 'ViewPatientRecord');
    expect(result.authorized).toBe(false);
    expect(result.decision).toBe('Deny');
    expect(result.diagnostics.length).toBeGreaterThan(0);
    expect(result.diagnostics[0]).toContain('Zero-Trust Interception');
  });

  it('returns HTTP 403 Forbidden via lambdaHandler when Eve attempts access', async () => {
    const event = {
      httpMethod: 'POST',
      path: '/process-note',
      body: JSON.stringify({
        user_id: 'User::Eve',
        patient_id: 'Grandma_Bob',
        doctors_note: 'Prescribe Ibuprofen 400mg twice a day.',
      }),
    };

    const response = await lambdaHandler(event);
    expect(response.statusCode).toBe(403);

    const body = JSON.parse(response.body);
    expect(body.status).toBe('forbidden');
    expect(body.error).toContain('Access Denied');
    expect(body.cedar_authorization.authorized).toBe(false);
    expect(body.cedar_authorization.decision).toBe('Deny');
  });
});
