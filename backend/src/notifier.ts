/**
 * CareSync Real Phone Notification Dispatcher in TypeScript.
 * 
 * Supports multi-channel real mobile alerts:
 * 1. Real Push Notifications to iOS/Android phones via ntfy.sh (instant, zero-setup)
 * 2. Simulated Amazon SNS fallback event logger
 */

export const DEFAULT_NTFY_TOPIC = process.env.CARESYNC_NTFY_TOPIC || 'caresync-eldercare-alerts';

export interface NtfyPushResult {
  channel: 'ntfy_push';
  status: 'delivered' | 'failed';
  topic: string;
  subscribe_url: string;
  message_id?: string;
  timestamp?: string;
  error?: string;
}

export async function sendNtfyPush(
  topic: string,
  title: string,
  message: string,
  priority: string = 'urgent',
  tags: string[] = ['warning', 'pill', 'hospital']
): Promise<NtfyPushResult> {
  const cleanTopic = (topic ? topic.trim().replace(/\s+/g, '-').toLowerCase() : DEFAULT_NTFY_TOPIC);
  const url = `https://ntfy.sh/${cleanTopic}`;

  const prioMap: Record<string, string> = {
    min: '1',
    low: '2',
    default: '3',
    high: '4',
    urgent: '5',
    Critical: '5',
    High: '4',
  };
  const prioVal = prioMap[priority] || '4';

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        Title: title,
        Priority: prioVal,
        Tags: tags.join(','),
      },
      body: message,
    });

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
    }

    const data = (await resp.json()) as { id?: string };
    return {
      channel: 'ntfy_push',
      status: 'delivered',
      topic: cleanTopic,
      subscribe_url: `https://ntfy.sh/${cleanTopic}`,
      message_id: data?.id || `ntfy-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    return {
      channel: 'ntfy_push',
      status: 'failed',
      error: err?.message || String(err),
      topic: cleanTopic,
      subscribe_url: `https://ntfy.sh/${cleanTopic}`,
    };
  }
}

export async function dispatchMultiChannelEmergencyAlert(
  patientId: string,
  conflictWarning: { severity?: string; warning?: string; drugs?: string[] },
  ntfyTopic?: string,
  phoneNumber?: string
) {
  const severity = conflictWarning.severity || 'High';
  const warningText = conflictWarning.warning || 'Adverse clinical interaction detected.';
  const drugs = conflictWarning.drugs || [];
  const drugsStr = drugs.length > 0 ? drugs.join(' + ') : 'Prescription Conflict';

  const title = `🚨 URGENT: Drug Clash Detected for ${patientId}`;
  const message = `CareSync Safety Alert: ${severity} severity interaction (${drugsStr}).\nWarning: ${warningText}\nImmediate clinical verification advised before administering.`;

  const activeTopic = ntfyTopic || DEFAULT_NTFY_TOPIC;
  const ntfyReceipt = await sendNtfyPush(activeTopic, title, message, severity, ['warning', 'pill', 'rotating_light']);

  const simulatedSnsReceipt = {
    alert_id: `sns-${Date.now()}`,
    timestamp: new Date().toISOString(),
    topic_arn: 'arn:aws:sns:us-east-1:000000000000:caresync-emergency-alerts',
    patient_id: patientId,
    severity,
    drugs,
    subject: title,
    message,
  };

  return {
    patient_id: patientId,
    severity,
    title,
    message,
    active_topic: activeTopic,
    receipts: {
      ntfy: ntfyReceipt,
      simulated_sns: simulatedSnsReceipt,
      ...(phoneNumber
        ? {
            sms: {
              channel: 'aws_sns_sms',
              status: 'simulated',
              recipient: phoneNumber,
              reason: 'Local simulation mode active',
            },
          }
        : {}),
    },
  };
}
