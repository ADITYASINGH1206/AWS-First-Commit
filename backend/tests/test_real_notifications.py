"""Tests for Real Phone Notification Dispatcher.

Verifies ntfy.sh real push dispatch, SNS SMS simulation/live wrapper,
and /notify API route.
"""

import json
import pytest
from app.main import lambda_handler
from app.notifier import send_ntfy_push, dispatch_multi_channel_emergency_alert


def test_send_ntfy_push_delivery():
    """Verify that send_ntfy_push sends live push to ntfy.sh topic."""
    receipt = send_ntfy_push(
        topic="caresync-pytest-delivery",
        title="CareSync Pytest Alert",
        message="Automated unit test notification delivery",
        priority="high"
    )
    assert receipt["channel"] == "ntfy_push"
    assert receipt["status"] == "delivered"
    assert "message_id" in receipt


def test_dispatch_multi_channel_emergency_alert():
    """Verify that multi-channel dispatch returns both real push and SNS receipt."""
    conflict = {
        "severity": "High",
        "drugs": ["Lisinopril 10mg", "Ibuprofen 400mg"],
        "warning": "May decrease kidney function and reduce BP control."
    }
    result = dispatch_multi_channel_emergency_alert(
        patient_id="Grandma_Bob",
        conflict_warning=conflict,
        ntfy_topic="caresync-pytest-multichannel"
    )
    assert result["patient_id"] == "Grandma_Bob"
    assert "ntfy" in result["receipts"]
    assert result["receipts"]["ntfy"]["status"] == "delivered"
    assert "simulated_sns" in result["receipts"]


def test_notify_endpoint_via_lambda_handler():
    """Verify that POST /notify endpoint dispatches real notification."""
    event = {
        "httpMethod": "POST",
        "path": "/notify",
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({
            "topic": "caresync-pytest-endpoint",
            "title": "CareSync Endpoint Probe",
            "message": "Testing /notify route via Lambda event"
        })
    }
    response = lambda_handler(event, None)
    assert response["statusCode"] == 200
    body = json.loads(response["body"])
    assert body["status"] == "success"
    assert body["ntfy_receipt"]["status"] == "delivered"
