"""Cedar Authorization Engine Security Tests.

Tests Zero-Trust RBAC/ABAC enforcement using Cedar policy rules.
"""

import json
import pytest
from app.cedar_auth import evaluate_authorization
from app.main import lambda_handler


def test_cedar_authorized_family_allow():
    """Verify that authorized family member (Alice) receives Allow."""
    result = evaluate_authorization(
        principal="User::Alice",
        patient_id="Grandma_Bob",
        action="Action::ViewPatientRecord"
    )
    assert result["authorized"] is True
    assert result["decision"] == "Allow"


def test_cedar_another_authorized_family_member():
    """Verify that second authorized family member (Charlie) receives Allow."""
    result = evaluate_authorization(
        principal="User::Charlie",
        patient_id="Grandma_Bob",
        action="Action::ViewPatientRecord"
    )
    assert result["authorized"] is True
    assert result["decision"] == "Allow"


def test_cedar_unauthorized_stranger_denied():
    """Verify that unauthorized stranger (Eve) is denied access."""
    result = evaluate_authorization(
        principal="User::Eve",
        patient_id="Grandma_Bob",
        action="Action::ViewPatientRecord"
    )
    assert result["authorized"] is False
    assert result["decision"] == "Deny"


def test_lambda_handler_returns_403_on_unauthorized_request():
    """Verify that Lambda handler returns HTTP 403 Forbidden when Cedar denies access."""
    event = {
        "httpMethod": "POST",
        "path": "/process-note",
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({
            "user_id": "User::Eve",
            "patient_id": "Grandma_Bob",
            "doctors_note": "I want to see patient records."
        })
    }

    response = lambda_handler(event, None)
    assert response["statusCode"] == 403
    body = json.loads(response["body"])
    assert body["status"] == "forbidden"
    assert "Access Denied" in body["error"]
