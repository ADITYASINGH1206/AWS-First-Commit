"""Golden Path Integration Test for CareSync.

As specified in Section 7 of the Hackathon Blueprint:
Tests the exact note:
"Hi, this is Dr. Smith. I need Grandma Bob to start taking 400mg of Ibuprofen twice a day
for her knee pain, morning and evening. She should continue her other meds."
Verifies that the Lisinopril-Ibuprofen interaction is flagged.
"""

import json
import pytest
from app.main import lambda_handler


def test_golden_path_dr_smith_note():
    """Test the complete golden path Lambda execution for Dr. Smith's voice note."""
    event = {
        "httpMethod": "POST",
        "path": "/process-note",
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({
            "user_id": "User::Alice",
            "patient_id": "Grandma_Bob",
            "doctors_note": (
                "Hi, this is Dr. Smith. I need Grandma Bob to start taking 400mg of Ibuprofen "
                "twice a day for her knee pain, morning and evening. She should continue her other meds."
            )
        })
    }

    response = lambda_handler(event, None)
    assert response["statusCode"] == 200, f"Expected 200 OK, got {response['statusCode']}"

    body = json.loads(response["body"])
    assert body["status"] == "success"

    # 1. Verify Cedar Authorization
    auth = body.get("authorization", {})
    assert auth.get("authorized") is True
    assert auth.get("decision") == "Allow"
    assert auth.get("principal") == "User::Alice"

    # 2. Verify Drug Interaction Flagged
    assert body.get("conflict_found") is True
    warnings = body.get("interaction_warnings", [])
    assert len(warnings) > 0, "Expected at least one drug conflict warning!"

    has_lisinopril_ibuprofen_warning = False
    for w in warnings:
        all_text = (str(w.get("drugs", [])) + " " + w.get("warning", "") + " " + w.get("clinical_guidance", "")).lower()
        if "lisinopril" in all_text and "ibuprofen" in all_text:
            has_lisinopril_ibuprofen_warning = True
            assert w.get("severity") in ["High", "Critical"]
            assert "kidney" in all_text or "bp" in all_text

    assert has_lisinopril_ibuprofen_warning, "The Lisinopril-Ibuprofen interaction MUST be flagged!"

    # 3. Verify Daily Schedule Structure
    schedule = body.get("daily_schedule", {})
    assert "morning" in schedule
    assert "evening" in schedule
    assert len(schedule["morning"]) >= 2  # Lisinopril + Ibuprofen
    assert len(schedule["evening"]) >= 1  # Ibuprofen

    # 4. Verify Simulated Cloud Alerts
    dispatched = body.get("dispatched_emergency_alerts", [])
    assert len(dispatched) > 0, "Emergency alert must be dispatched on high-severity conflict!"
