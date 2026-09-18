# Strands Agent & Tools Specification

**Component:** Autonomous Agent Core (`backend/app/agent.py` & `backend/app/tools.py`)  
**Framework:** Strands Agents SDK (Python)  
**LLM Engine:** Ollama running `llama3` with Deterministic Dual-Mode Fallback  
**Hackathon Track:** AWS First Commit — Build It (Local / AWS-Simulated)

---

## 1. Strands Agent Framework Architecture

AWS created the **Strands Agents SDK** to provide a minimalist, highly efficient Pythonic interface for autonomous reasoning and tool use. Unlike monolithic agent frameworks, Strands relies on clean Python type hints and the `@tool` decorator to convert standard functions into schema-validated LLM tools.

```
+-------------------------------------------------------------------------+
|                        Strands Agent Execution Loop                     |
|                                                                         |
|  1. Ingest Clinical Dictation: "Hi, this is Dr. Smith..."               |
|                              |                                          |
|                              v                                          |
|  2. Agent Tool Invocation: fetch_patient_history("Grandma_Bob")         |
|     -> Returns: ["Lisinopril 10mg"]                                     |
|                              |                                          |
|                              v                                          |
|  3. Clinical Entity Extraction & Normalization                          |
|     -> Extracted: Ibuprofen 400mg, twice a day, morning/evening        |
|                              |                                          |
|                              v                                          |
|  4. Agent Tool Invocation: check_drug_interaction(...)                  |
|     -> Evaluates: Lisinopril 10mg vs Ibuprofen 400mg                    |
|     -> Returns: Conflict Found (Severity: High, Kidney Function Risk)   |
|                              |                                          |
|                              v                                          |
|  5. Agent Tool Invocation: generate_daily_schedule(...)                 |
|     -> Chronotherapy slot allocation with food/liquid directives        |
|                              |                                          |
|                              v                                          |
|  6. Structured Response Assembly                                        |
+-------------------------------------------------------------------------+
```

---

## 2. Tool Definitions (`backend/app/tools.py`)

Every tool is decorated with `@tool` from `strands`:

```python
import json
import os
from strands import tool

MOCK_DB_PATH = os.path.join(os.path.dirname(__file__), "mock_db.json")

def _load_db() -> dict:
    with open(MOCK_DB_PATH, "r") as f:
        return json.load(f)

@tool
def fetch_patient_history(patient_id: str) -> dict:
    """Fetches existing medications for the patient from the mock database.
    
    Args:
        patient_id: Identifier of the patient (e.g. Grandma_Bob)
    Returns:
        Dictionary containing patient record and list of active current medications.
    """
    db = _load_db()
    patients = db.get("patients", {})
    if patient_id not in patients:
        return {"error": f"Patient '{patient_id}' not found", "current_medications": []}
    return {
        "patient_id": patient_id,
        "current_medications": patients[patient_id].get("current_medications", [])
    }

@tool
def check_drug_interaction(new_meds: list, current_meds: list) -> dict:
    """Checks for adverse reactions between lists of medications.
    
    Args:
        new_meds: List of newly prescribed medications (e.g. ['Ibuprofen 400mg'])
        current_meds: List of existing patient medications (e.g. ['Lisinopril 10mg'])
    Returns:
        {"conflict_found": bool, "severity": str, "details": str, "drugs": list}
    """
    db = _load_db()
    interactions = db.get("interactions", {})
    
    def normalize_name(med: str) -> str:
        # Extract base drug name: 'Ibuprofen 400mg' -> 'ibuprofen'
        return med.split()[0].strip().lower()

    for new_med in new_meds:
        n_name = normalize_name(new_med)
        for cur_med in current_meds:
            c_name = normalize_name(cur_med)
            
            # Check both directional keys: 'Lisinopril-Ibuprofen' and 'Ibuprofen-Lisinopril'
            for key, val in interactions.items():
                k_parts = [p.strip().lower() for p in key.split("-")]
                if (n_name in k_parts[0] and c_name in k_parts[1]) or \
                   (c_name in k_parts[0] and n_name in k_parts[1]):
                    return {
                        "conflict_found": True,
                        "severity": val.get("severity", "High"),
                        "details": f"{key} interaction: {val.get('warning', '')}",
                        "drugs": [cur_med, new_med],
                        "warning": val.get("warning", "")
                    }
                    
    return {
        "conflict_found": False,
        "severity": "None",
        "details": "No known adverse interactions detected."
    }

@tool
def generate_daily_schedule(medications: list) -> dict:
    """Takes a validated list of medications and assigns them to
    Morning, Afternoon, and Evening slots based on instructions.
    
    Args:
        medications: List of medication dictionaries or strings with timing hints.
    Returns:
        Dictionary with keys 'morning', 'afternoon', 'evening', and 'bedtime'.
    """
    schedule = {
        "morning": [],
        "afternoon": [],
        "evening": [],
        "bedtime": []
    }
    
    # Chronotherapy slotting logic...
    return schedule
```

---

## 3. Agent Prompts & Deterministic Safety Guardrails

The Strands Agent system prompt enforces clinical safety:
- Never assume an unknown medication is safe without checking the interaction matrix.
- Parse dosages with unit precision (`400mg`, `10mg`).
- Highlight NSAID warnings when combined with ACE inhibitors.
