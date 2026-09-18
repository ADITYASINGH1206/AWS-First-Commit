"""CareSync Cedar Authorization Engine.

Integrates AWS Cedar Policy Engine via cedarpy to enforce Zero-Trust
access control on patient medication records.
"""

import json
import logging
import os
from cedarpy import is_authorized, Decision

logger = logging.getLogger("cedar_auth")
logger.setLevel(logging.INFO)

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
POLICIES_PATH = os.path.join(CURRENT_DIR, "policies.cedar")
MOCK_DB_PATH = os.path.join(CURRENT_DIR, "mock_db.json")


def load_cedar_policies() -> str:
    """Read the active Cedar policy file."""
    with open(POLICIES_PATH, "r", encoding="utf-8") as f:
        return f.read()


def load_mock_db() -> dict:
    """Read the mock database for patient entities."""
    with open(MOCK_DB_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def build_cedar_entities(patient_id: str) -> list:
    """Build the Cedar entity hierarchy including users, patients, and actions.

    In Cedar JSON schema, entity references inside attributes must be formatted
    as: {"__entity": {"type": "...", "id": "..."}}.
    """
    db = load_mock_db()
    patients = db.get("patients", {})
    clean_patient_id = patient_id.replace("Patient::", "").strip()
    
    patient_record = patients.get(clean_patient_id, {})
    authorized_family_list = patient_record.get("authorized_family", [])

    # Build entity references for authorized family members
    family_entity_refs = []
    user_entities = []
    seen_users = set()

    for user_str in authorized_family_list:
        clean_user_id = user_str.replace("User::", "").strip()
        seen_users.add(clean_user_id)
        family_entity_refs.append({
            "__entity": {
                "type": "User",
                "id": clean_user_id
            }
        })
        user_entities.append({
            "uid": {"type": "User", "id": clean_user_id},
            "attrs": {},
            "parents": []
        })

    # Always ensure test users exist in the entity store
    standard_users = ["Alice", "Charlie", "Eve", "David", "Dr_Smith"]
    for u in standard_users:
        if u not in seen_users:
            user_entities.append({
                "uid": {"type": "User", "id": u},
                "attrs": {},
                "parents": []
            })
            seen_users.add(u)

    entities = [
        *user_entities,
        {
            "uid": {"type": "Patient", "id": clean_patient_id},
            "attrs": {
                "authorized_family": family_entity_refs
            },
            "parents": []
        },
        {
            "uid": {"type": "Action", "id": "ViewPatientRecord"},
            "attrs": {},
            "parents": []
        }
    ]

    return entities


def evaluate_authorization(
    principal: str,
    patient_id: str,
    action: str = "ViewPatientRecord"
) -> dict:
    """Evaluate Cedar policy for incoming request.

    Args:
        principal: Entity string (e.g. 'User::Alice' or 'Alice')
        patient_id: Patient identifier (e.g. 'Grandma_Bob')
        action: Action identifier (e.g. 'Action::ViewPatientRecord' or 'ViewPatientRecord')

    Returns:
        Dict: {
            "authorized": bool,
            "decision": "Allow" | "Deny",
            "principal": str,
            "resource": str,
            "action": str,
            "diagnostics": list
        }
    """
    clean_user_id = principal.replace("User::", "").strip()
    clean_patient_id = patient_id.replace("Patient::", "").strip()
    clean_action_id = action.replace("Action::", "").strip()

    policies = load_cedar_policies()
    entities = build_cedar_entities(clean_patient_id)

    # If principal not in known entities, add it dynamically
    known_uids = [e["uid"]["id"] for e in entities if e["uid"]["type"] == "User"]
    if clean_user_id not in known_uids:
        entities.append({
            "uid": {"type": "User", "id": clean_user_id},
            "attrs": {},
            "parents": []
        })

    request = {
        "principal": {"type": "User", "id": clean_user_id},
        "action": {"type": "Action", "id": clean_action_id},
        "resource": {"type": "Patient", "id": clean_patient_id},
        "context": {}
    }

    result = is_authorized(request, policies, entities)
    is_allowed = (result.decision == Decision.Allow)

    diagnostics = []
    if hasattr(result, "diagnostics") and hasattr(result.diagnostics, "errors"):
        diagnostics = list(result.diagnostics.errors)

    audit_entry = {
        "authorized": is_allowed,
        "decision": "Allow" if is_allowed else "Deny",
        "principal": f"User::{clean_user_id}",
        "resource": f"Patient::{clean_patient_id}",
        "action": f"Action::{clean_action_id}",
        "diagnostics": diagnostics
    }

    logger.info("Cedar Authorization Evaluation: %s", audit_entry)
    return audit_entry
