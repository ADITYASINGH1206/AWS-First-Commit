"""CareSync Real Phone Notification Dispatcher.

Supports multi-channel real mobile alerts:
1. Real Push Notifications to iOS/Android phones via ntfy.sh (instant, zero-setup)
2. Real SMS via Amazon SNS (boto3) when real AWS credentials & phone are provided
3. LocalStack / Simulated SNS fallback event logger
"""

import json
import logging
import os
import time
import urllib.request
import urllib.error
from typing import Any, Dict, List, Optional

logger = logging.getLogger("caresync_notifier")
logger.setLevel(logging.INFO)

# Default public topic for CareSync mobile alerts
DEFAULT_NTFY_TOPIC = os.environ.get("CARESYNC_NTFY_TOPIC", "caresync-eldercare-alerts")


def send_ntfy_push(
    topic: str,
    title: str,
    message: str,
    priority: str = "urgent",
    tags: Optional[List[str]] = None,
    click_url: Optional[str] = None
) -> Dict[str, Any]:
    """Send real push notification to any phone subscribed to https://ntfy.sh/<topic>.

    Free, open-source, works with the official ntfy app on iOS (App Store)
    and Android (Google Play) or mobile browsers with zero authentication needed.
    """
    clean_topic = topic.strip().replace(" ", "-").lower() if topic else DEFAULT_NTFY_TOPIC
    url = f"https://ntfy.sh/{clean_topic}"

    # Map priority string to ntfy priority (1 to 5)
    prio_map = {
        "min": "1",
        "low": "2",
        "default": "3",
        "high": "4",
        "urgent": "5",
        "Critical": "5",
        "High": "4"
    }
    prio_val = prio_map.get(priority, "4")

    headers = {
        "Title": title.encode("utf-8").decode("latin-1", "ignore"),
        "Priority": prio_val,
        "Tags": ",".join(tags or ["warning", "pill", "hospital"]),
    }
    if click_url:
        headers["Click"] = click_url

    try:
        req = urllib.request.Request(
            url,
            data=message.encode("utf-8"),
            headers=headers,
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=5.0) as resp:
            resp_data = json.loads(resp.read().decode("utf-8"))
            logger.info(f"Successfully dispatched real mobile push to ntfy.sh/{clean_topic}: {resp_data.get('id')}")
            return {
                "channel": "ntfy_push",
                "status": "delivered",
                "topic": clean_topic,
                "subscribe_url": f"https://ntfy.sh/{clean_topic}",
                "message_id": resp_data.get("id"),
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            }
    except Exception as exc:
        logger.warning(f"Failed to dispatch real mobile push to ntfy.sh/{clean_topic}: {exc}")
        return {
            "channel": "ntfy_push",
            "status": "failed",
            "error": str(exc),
            "topic": clean_topic,
            "subscribe_url": f"https://ntfy.sh/{clean_topic}"
        }


def send_aws_sns_sms(
    phone_number: str,
    message: str
) -> Dict[str, Any]:
    """Send real SMS via Amazon SNS if real AWS credentials are present."""
    if not phone_number:
        return {"channel": "aws_sns_sms", "status": "skipped", "reason": "No phone number provided"}

    # Check for non-dummy AWS credentials
    aws_key = os.environ.get("AWS_ACCESS_KEY_ID", "")
    aws_secret = os.environ.get("AWS_SECRET_ACCESS_KEY", "")

    if not aws_key or aws_key in ["test", "mock", "dummy"]:
        return {
            "channel": "aws_sns_sms",
            "status": "simulated",
            "recipient": phone_number,
            "reason": "Running in local simulation mode (set real AWS_ACCESS_KEY_ID to send live carrier SMS)"
        }

    try:
        import boto3
        region = os.environ.get("AWS_DEFAULT_REGION", "us-east-1")
        sns = boto3.client("sns", region_name=region)
        resp = sns.publish(
            PhoneNumber=phone_number,
            Message=message,
            MessageAttributes={
                "AWS.SNS.SMS.SMSType": {
                    "DataType": "String",
                    "StringValue": "Transactional"
                }
            }
        )
        logger.info(f"Successfully sent live AWS SNS SMS to {phone_number}: {resp.get('MessageId')}")
        return {
            "channel": "aws_sns_sms",
            "status": "delivered",
            "recipient": phone_number,
            "message_id": resp.get("MessageId"),
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }
    except Exception as exc:
        logger.warning(f"AWS SNS live SMS failed: {exc}")
        return {
            "channel": "aws_sns_sms",
            "status": "failed",
            "error": str(exc),
            "recipient": phone_number
        }


def dispatch_multi_channel_emergency_alert(
    patient_id: str,
    conflict_warning: Dict[str, Any],
    ntfy_topic: Optional[str] = None,
    phone_number: Optional[str] = None
) -> Dict[str, Any]:
    """Dispatch emergency drug clash alerts across all real and simulated channels.

    Returns a comprehensive receipt dictionary with results from each channel.
    """
    severity = conflict_warning.get("severity", "High")
    warning_text = conflict_warning.get("warning", "Adverse clinical interaction detected.")
    drugs = conflict_warning.get("drugs", [])
    drugs_str = " + ".join(drugs) if drugs else "Prescription Conflict"

    title = f"🚨 URGENT: Drug Clash Detected for {patient_id}"
    message = (
        f"CareSync Safety Alert: {severity} severity interaction ({drugs_str}).\n"
        f"Warning: {warning_text}\n"
        f"Immediate clinical verification advised before administering."
    )

    receipts = {}

    # Channel 1: Real phone push via ntfy.sh
    active_topic = ntfy_topic or DEFAULT_NTFY_TOPIC
    receipts["ntfy"] = send_ntfy_push(
        topic=active_topic,
        title=title,
        message=message,
        priority=severity,
        tags=["warning", "pill", "rotating_light"]
    )

    # Channel 2: Real AWS SNS SMS (if credentials + phone provided)
    if phone_number:
        receipts["sms"] = send_aws_sns_sms(phone_number, message)

    # Channel 3: Local Simulated SNS Topic Log
    receipts["simulated_sns"] = {
        "alert_id": f"sns-{int(time.time() * 1000)}",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "topic_arn": "arn:aws:sns:us-east-1:000000000000:caresync-emergency-alerts",
        "patient_id": patient_id,
        "severity": severity,
        "drugs": drugs,
        "subject": title,
        "message": message
    }

    return {
        "patient_id": patient_id,
        "severity": severity,
        "title": title,
        "message": message,
        "active_topic": active_topic,
        "receipts": receipts
    }
