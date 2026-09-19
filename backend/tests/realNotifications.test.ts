import { describe, it, expect } from 'vitest';
import { dispatchMultiChannelEmergencyAlert, sendNtfyPush } from '../src/notifier.js';
import { lambdaHandler } from '../src/main.js';

describe('CareSync Real Mobile Notifications & Alerts', () => {
  it('dispatches ntfy.sh push notification structure', async () => {
    const receipt = await sendNtfyPush('caresync-test-unit', 'Test Alert', 'Medication check required', 'high');
    expect(receipt.channel).toBe('ntfy_push');
    expect(receipt.topic).toBe('caresync-test-unit');
    expect(receipt.subscribe_url).toContain('ntfy.sh/caresync-test-unit');
  });

  it('dispatches multi-channel emergency alert', async () => {
    const warning = {
      severity: 'High',
      warning: 'Lisinopril + Ibuprofen may cause renal decompensation',
      drugs: ['Lisinopril 10mg', 'Ibuprofen 400mg'],
    };

    const result = await dispatchMultiChannelEmergencyAlert('Grandma_Bob', warning, 'caresync-test-alert', '+15550192834');
    expect(result.patient_id).toBe('Grandma_Bob');
    expect(result.severity).toBe('High');
    expect(result.receipts.ntfy).toBeDefined();
    expect(result.receipts.simulated_sns).toBeDefined();
    expect(result.receipts.sms).toBeDefined();
  });

  it('handles /notify route via lambdaHandler', async () => {
    const event = {
      httpMethod: 'POST',
      path: '/notify',
      body: JSON.stringify({
        patient_id: 'Grandma_Bob',
        severity: 'High',
        message: 'Direct test alert delivery',
        drugs: ['Lisinopril 10mg', 'Ibuprofen 400mg'],
      }),
    };

    const response = await lambdaHandler(event);
    expect(response.statusCode).toBe(200);

    const body = JSON.parse(response.body);
    expect(body.status).toBe('success');
    expect(body.dispatch.patient_id).toBe('Grandma_Bob');
  });
});
