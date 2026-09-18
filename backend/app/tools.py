"""CareSync Agent Tools for Strands SDK.

Implements clinical tools for patient history lookup, drug-drug interaction
checking, and daily chronotherapy schedule synthesis.
"""

import json
import os
import re
from strands import tool

MOCK_DB_PATH = os.path.join(os.path.dirname(__file__), "mock_db.json")


def _load_mock_db() -> dict:
    """Load mock database from mock_db.json."""
    try:
        with open(MOCK_DB_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        return {"patients": {}, "interactions": {}, "error": str(e)}


@tool
def fetch_patient_history(patient_id: str) -> dict:
    """Fetches existing medications and clinical profile for the patient from the mock database.

    Args:
        patient_id: The identifier of the patient (e.g. 'Grandma_Bob').

    Returns:
        A dictionary containing patient profile and current_medications list.
    """
    db = _load_mock_db()
    patients = db.get("patients", {})
    
    # Normalize ID matching
    target_id = patient_id.replace("Patient::", "").strip()
    
    if target_id in patients:
        record = patients[target_id]
        return {
            "patient_id": target_id,
            "name": record.get("name", target_id),
            "current_medications": record.get("current_medications", []),
            "allergies": record.get("allergies", []),
            "authorized_family": record.get("authorized_family", [])
        }
    
    # Case-insensitive search fallback
    for pid, data in patients.items():
        if pid.lower() == target_id.lower() or pid.lower().replace("_", "") == target_id.lower().replace(" ", ""):
            return {
                "patient_id": pid,
                "name": data.get("name", pid),
                "current_medications": data.get("current_medications", []),
                "allergies": data.get("allergies", []),
                "authorized_family": data.get("authorized_family", [])
            }

    return {
        "patient_id": target_id,
        "error": f"Patient '{target_id}' not found in database",
        "current_medications": []
    }


def _normalize_drug_name(drug_str: str) -> str:
    """Extract primary active drug stem (e.g. 'Ibuprofen 400mg' -> 'ibuprofen')."""
    if not drug_str:
        return ""
    # Strip dosages, units, and extra notes
    clean = re.sub(r"\d+(\.\d+)?\s*(mg|mcg|g|ml|tablets?|capsules?|pills?)", "", str(drug_str), flags=re.IGNORECASE)
    clean = clean.split()[0] if clean.split() else str(drug_str).split()[0]
    return clean.strip(" ,.-/()").lower()


@tool
def check_drug_interaction(new_meds: list, current_meds: list) -> dict:
    """Checks for adverse reactions between lists of medications.

    Cross-references medication pairs against the pharmacology conflict matrix.

    Args:
        new_meds: List of newly prescribed medications (e.g. ['Ibuprofen 400mg']).
        current_meds: List of existing medications (e.g. ['Lisinopril 10mg']).

    Returns:
        A dict: {"conflict_found": bool, "details": str, "severity": str, "warning": str, "conflicts": list}
    """
    db = _load_mock_db()
    interactions = db.get("interactions", {})
    conflicts_detected = []

    # Ensure inputs are lists
    if isinstance(new_meds, str):
        new_meds = [new_meds]
    if isinstance(current_meds, str):
        current_meds = [current_meds]

    for new_m in new_meds:
        # Handle dict or string
        new_med_text = new_m if isinstance(new_m, str) else new_m.get("name", "")
        new_stem = _normalize_drug_name(new_med_text)

        for cur_m in current_meds:
            cur_med_text = cur_m if isinstance(cur_m, str) else cur_m.get("name", "")
            cur_stem = _normalize_drug_name(cur_med_text)

            for rule_key, rule_data in interactions.items():
                rule_pair = [p.strip().lower() for p in rule_key.split("-")]
                if len(rule_pair) == 2:
                    p1, p2 = rule_pair[0], rule_pair[1]
                    # Check bidirectional match
                    if (new_stem in p1 and cur_stem in p2) or (new_stem in p2 and cur_stem in p1) or \
                       (p1 in new_med_text.lower() and p2 in cur_med_text.lower()) or \
                       (p2 in new_med_text.lower() and p1 in cur_med_text.lower()):
                        
                        warning_msg = rule_data.get("warning", "Potential adverse clinical drug interaction.")
                        conflicts_detected.append({
                            "pair": f"{cur_med_text} + {new_med_text}",
                            "rule": rule_key,
                            "severity": rule_data.get("severity", "High"),
                            "warning": warning_msg,
                            "clinical_guidance": rule_data.get("clinical_guidance", "")
                        })

    if conflicts_detected:
        primary = conflicts_detected[0]
        details_text = f"Interaction between {primary['pair']}: {primary['warning']}"
        return {
            "conflict_found": True,
            "severity": primary["severity"],
            "warning": primary["warning"],
            "details": details_text,
            "conflicts": conflicts_detected
        }

    return {
        "conflict_found": False,
        "severity": "None",
        "warning": "",
        "details": "No adverse interactions detected between current and new medications.",
        "conflicts": []
    }


@tool
def generate_daily_schedule(medications: list) -> dict:
    """Takes a validated list of medications and assigns them to
    Morning, Afternoon, and Evening slots based on instructions.

    Args:
        medications: List of medication strings or dictionaries containing name and instructions.

    Returns:
        Structured daily schedule dictionary with 'morning', 'afternoon', 'evening', and 'bedtime' slots.
    """
    schedule = {
        "morning": [],
        "afternoon": [],
        "evening": [],
        "bedtime": []
    }

    if not medications:
        return schedule

    for item in medications:
        if isinstance(item, str):
            med_name = item
            timing = []
            instructions = "Take with water"
        elif isinstance(item, dict):
            med_name = item.get("name", item.get("medication", "Medication"))
            timing = item.get("timing", [])
            instructions = item.get("instructions", "Take as directed")
        else:
            continue

        lower_text = (med_name + " " + instructions + " " + " ".join(timing)).lower()

        # Specific drug clinical chronotherapy heuristics
        if "lisinopril" in lower_text:
            instructions = "Take once daily in morning with water; monitor blood pressure"
            schedule["morning"].append({"medication": med_name, "instructions": instructions})
        elif "ibuprofen" in lower_text:
            # "twice a day... morning and evening"
            morning_inst = "Take with breakfast or food to avoid stomach upset"
            evening_inst = "Take with dinner or a glass of milk"
            schedule["morning"].append({"medication": med_name, "instructions": morning_inst})
            schedule["evening"].append({"medication": med_name, "instructions": evening_inst})
        elif "warfarin" in lower_text:
            schedule["evening"].append({"medication": med_name, "instructions": "Take at 6:00 PM consistently"})
        else:
            # General timing parsing
            assigned = False
            if "morning" in lower_text or "breakfast" in lower_text:
                schedule["morning"].append({"medication": med_name, "instructions": instructions})
                assigned = True
            if "afternoon" in lower_text or "lunch" in lower_text or "midday" in lower_text:
                schedule["afternoon"].append({"medication": med_name, "instructions": instructions})
                assigned = True
            if "evening" in lower_text or "dinner" in lower_text or "night" in lower_text:
                schedule["evening"].append({"medication": med_name, "instructions": instructions})
                assigned = True
            if "bedtime" in lower_text or "bed" in lower_text:
                schedule["bedtime"].append({"medication": med_name, "instructions": instructions})
                assigned = True

            if not assigned:
                schedule["morning"].append({"medication": med_name, "instructions": instructions})

    return schedule
