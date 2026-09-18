"""Unit tests for Strands Agent Tools.

Verifies fetch_patient_history, check_drug_interaction, and generate_daily_schedule.
"""

import pytest
from app.tools import (
    fetch_patient_history,
    check_drug_interaction,
    generate_daily_schedule,
)


def test_fetch_patient_history_grandma_bob():
    """Verify tool fetches existing medications for Grandma_Bob."""
    result = fetch_patient_history("Grandma_Bob")
    assert result["patient_id"] == "Grandma_Bob"
    assert "Lisinopril 10mg" in result["current_medications"]


def test_check_drug_interaction_flags_lisinopril_ibuprofen():
    """Verify tool flags Lisinopril-Ibuprofen conflict."""
    res = check_drug_interaction(
        new_meds=["Ibuprofen 400mg"],
        current_meds=["Lisinopril 10mg"]
    )
    assert res["conflict_found"] is True
    assert res["severity"] == "High"
    assert "kidney function" in res["details"].lower()


def test_check_drug_interaction_safe_pair():
    """Verify tool returns no conflict for benign pairs."""
    res = check_drug_interaction(
        new_meds=["Vitamin D3 1000IU"],
        current_meds=["Lisinopril 10mg"]
    )
    assert res["conflict_found"] is False


def test_generate_daily_schedule_slots():
    """Verify tool organizes medication slots properly."""
    meds = [
        {"name": "Lisinopril 10mg", "timing": ["morning"], "instructions": "Take with water"},
        {"name": "Ibuprofen 400mg", "timing": ["morning", "evening"], "instructions": "Take with food"}
    ]
    schedule = generate_daily_schedule(meds)
    assert len(schedule["morning"]) == 2
    assert len(schedule["evening"]) == 1
