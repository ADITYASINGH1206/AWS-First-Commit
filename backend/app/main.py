"""CareSync Main AWS Lambda Handler & API Entry Point.

Processes doctor clinical notes, enforces Cedar policy authorization,
and returns structured medication schedules and adverse conflict warnings.
Also provides mock endpoints for SNS alerts and DynamoDB adherence state.
"""

import json
import logging
import os
import time
from typing import Any, Dict, List, Optional

try:
    from app.cedar_auth import evaluate_authorization
    from app.agent import default_agent
    from app.notifier import dispatch_multi_channel_emergency_alert, send_ntfy_push
except ImportError:
    from cedar_auth import evaluate_authorization
    from agent import default_agent
    from notifier import dispatch_multi_channel_emergency_alert, send_ntfy_push

logger = logging.getLogger("caresync_lambda")
logger.setLevel(logging.INFO)

# In-memory adherence store for local simulation (mirrors DynamoDB table)
ADHERENCE_STORE: Dict[str, Dict[str, Any]] = {}
ALERTS_LOG: list = []


def _cors_headers() -> Dict[str, str]:
    """Standard CORS response headers for API Gateway."""
    return {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Amz-Date,X-Api-Key",
        "Access-Control-Max-Age": "86400"
    }


def _create_response(status_code: int, body_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Build API Gateway Proxy compatible response."""
    return {
        "statusCode": status_code,
        "headers": _cors_headers(),
        "body": json.dumps(body_dict, indent=2)
    }


def _dispatch_sns_emergency_alert(
    patient_id: str,
    conflict_warning: Dict[str, Any],
    ntfy_topic: Optional[str] = None,
    phone_number: Optional[str] = None
) -> Dict[str, Any]:
    """Dispatch emergency alert across both simulated SNS and real mobile push/SMS channels."""
    dispatch_result = dispatch_multi_channel_emergency_alert(
        patient_id=patient_id,
        conflict_warning=conflict_warning,
        ntfy_topic=ntfy_topic,
        phone_number=phone_number
    )
    simulated_receipt = dispatch_result["receipts"].get("simulated_sns", {})

    # Combine receipts with backward-compatible format
    alert_event = {
        "alert_id": simulated_receipt.get("alert_id", f"sns-{int(time.time() * 1000)}"),
        "timestamp": simulated_receipt.get("timestamp", time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())),
        "topic_arn": simulated_receipt.get("topic_arn", "arn:aws:sns:us-east-1:000000000000:caresync-emergency-alerts"),
        "patient_id": patient_id,
        "severity": conflict_warning.get("severity", "High"),
        "drugs": conflict_warning.get("drugs", []),
        "subject": simulated_receipt.get("subject", f"URGENT: Adverse Drug Conflict for {patient_id}"),
        "message": simulated_receipt.get("message", f"CareSync Safety Alert: High-risk drug interaction detected for {patient_id}."),
        "real_delivery": {
            "ntfy": dispatch_result["receipts"].get("ntfy"),
            "sms": dispatch_result["receipts"].get("sms")
        }
    }
    ALERTS_LOG.append(alert_event)
    logger.info(f"[EMERGENCY ALERT] Published to SNS & Real Phone: {alert_event['message']}")
    return alert_event


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Main AWS Lambda Handler function."""
    logger.info("Received Lambda invocation event: %s", event)

    # 0. Handle HTTP OPTIONS (CORS preflight)
    http_method = event.get("httpMethod", "POST").upper()
    if http_method == "OPTIONS":
        return _create_response(200, {"message": "CORS preflight OK"})

    # Normalize path
    path = event.get("path", "/process-note")

    # Route: Adherence endpoints (Simulated Amazon DynamoDB)
    if "/adherence" in path:
        if http_method == "GET":
            patient = event.get("queryStringParameters", {}).get("patient_id", "Grandma_Bob") if event.get("queryStringParameters") else "Grandma_Bob"
            logs = ADHERENCE_STORE.get(patient, {})
            return _create_response(200, {"patient_id": patient, "adherence_logs": logs})

        elif http_method == "POST":
            body = {}
            if event.get("body"):
                body = json.loads(event["body"]) if isinstance(event["body"], str) else event["body"]
            patient = body.get("patient_id", "Grandma_Bob")
            slot = body.get("slot", "morning")
            medication = body.get("medication", "Lisinopril 10mg")
            status = body.get("status", "TAKEN")

            if patient not in ADHERENCE_STORE:
                ADHERENCE_STORE[patient] = {}
            key = f"{slot}_{medication}"
            ADHERENCE_STORE[patient][key] = {
                "medication": medication,
                "slot": slot,
                "status": status,
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "dynamodb_table": "caresync-adherence-tracker"
            }
            return _create_response(200, {
                "status": "success",
                "message": f"Updated adherence for {medication} to {status}",
                "record": ADHERENCE_STORE[patient][key]
            })

    # Route: Alerts endpoint (Simulated Amazon SNS log)
    if "/alerts" in path:
        return _create_response(200, {"alerts": ALERTS_LOG[-20:]})

    # Route: Real Phone Notification Endpoint
    if "/notify" in path:
        body = {}
        if event.get("body"):
            body = json.loads(event["body"]) if isinstance(event["body"], str) else event["body"]
        
        topic = body.get("topic", "caresync-eldercare-alerts")
        title = body.get("title", "CareSync Test Notification")
        message = body.get("message", "Test alert delivered to your phone from CareSync!")
        priority = body.get("priority", "urgent")
        phone_number = body.get("phone_number", "")

        push_receipt = send_ntfy_push(
            topic=topic,
            title=title,
            message=message,
            priority=priority,
            tags=["bell", "iphone", "robot"]
        )

        sms_receipt = None
        if phone_number:
            from app.notifier import send_aws_sns_sms
            sms_receipt = send_aws_sns_sms(phone_number, f"{title}: {message}")

        return _create_response(200, {
            "status": "success",
            "message": "Real phone alert dispatched",
            "ntfy_receipt": push_receipt,
            "sms_receipt": sms_receipt,
            "how_to_receive": f"Open https://ntfy.sh/{topic} on your phone or install the free ntfy app."
        })

    # Golden Path Route: POST /process-note
    try:
        raw_body = event.get("body", "{}")
        body_data = json.loads(raw_body) if isinstance(raw_body, str) else (raw_body or {})

        # 1. Extract: Parse user_id, patient_id, and doctors_note from the event body
        user_id = body_data.get("user_id", "User::Alice")
        patient_id = body_data.get("patient_id", "Grandma_Bob")
        doctors_note = body_data.get("doctors_note", "")
        ntfy_topic = body_data.get("ntfy_topic") or body_data.get("topic")
        phone_number = body_data.get("phone_number")

        if not doctors_note:
            return _create_response(400, {
                "error": "Missing required field: doctors_note",
                "status": "error"
            })

        # 2. Authorize: Call cedar_auth.py. If Deny, return 403 Forbidden.
        auth_result = evaluate_authorization(
            principal=user_id,
            patient_id=patient_id,
            action="ViewPatientRecord"
        )

        if not auth_result.get("authorized", False):
            logger.warning(f"Access Denied by Cedar Policy: {auth_result}")
            return _create_response(403, {
                "status": "forbidden",
                "error": "Access Denied by AWS Cedar Policy Engine",
                "message": f"Principal '{user_id}' is not authorized to access records for '{patient_id}'.",
                "cedar_authorization": auth_result,
                "policy_enforced": "permit(...) when { principal in resource.authorized_family };"
            })

        # 3. Invoke Strands: Pass the doctors_note to the Strands Agent
        # 4. Agent Loop:
        #    • Agent uses fetch_patient_history
        #    • Agent parses the new meds from the note
        #    • Agent uses check_drug_interaction
        #    • If conflict, Agent notes the warning
        #    • Agent uses generate_daily_schedule
        agent_result = default_agent.run_golden_path(
            patient_id=patient_id,
            doctors_note=doctors_note
        )

        # Attach Cedar authorization metadata to output
        agent_result["authorization"] = auth_result

        # Value-Add: Trigger multi-channel alert (SNS + Real Phone Push) if high-severity conflict found
        dispatched_alerts = []
        if agent_result.get("conflict_found"):
            for warning in agent_result.get("interaction_warnings", []):
                if warning.get("severity") in ["High", "Critical"]:
                    sns_receipt = _dispatch_sns_emergency_alert(
                        patient_id=patient_id,
                        conflict_warning=warning,
                        ntfy_topic=ntfy_topic,
                        phone_number=phone_number
                    )
                    dispatched_alerts.append(sns_receipt)

        agent_result["dispatched_emergency_alerts"] = dispatched_alerts

        # 5. Response: Return a structured JSON containing the schedule and warnings to the UI
        return _create_response(200, agent_result)

    except Exception as exc:
        logger.exception("Error executing lambda handler")
        return _create_response(500, {
            "status": "error",
            "error": "Internal Server Error",
            "details": str(exc)
        })


if __name__ == "__main__":
    # Local CLI invocation test
    sample_event = {
        "httpMethod": "POST",
        "path": "/process-note",
        "body": json.dumps({
            "user_id": "User::Alice",
            "patient_id": "Grandma_Bob",
            "doctors_note": "Hi, this is Dr. Smith. I need Grandma Bob to start taking 400mg of Ibuprofen twice a day for her knee pain, morning and evening. She should continue her other meds."
        })
    }
    resp = lambda_handler(sample_event, None)
    print("Direct Execution Status:", resp["statusCode"])
    print(resp["body"])
