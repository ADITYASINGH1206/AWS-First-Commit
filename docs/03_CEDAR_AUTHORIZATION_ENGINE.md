# Cedar Policy Engine: Zero-Trust Eldercare Authorization

**Component:** Authorization Engine (`cedar_auth.py` + `policies.cedar`)  
**Underlying Engine:** AWS Cedar Policy Engine (`cedarpy` Python bindings)  
**Hackathon Track:** AWS First Commit — Build It (Local / AWS-Simulated)

---

## 1. Overview & Security Motivation

In eldercare medication workflows, medical records, prescription histories, and interaction alerts are protected health information (PHI). In modern Zero-Trust architectures:
- Application business logic **MUST NOT** directly contain hardcoded permission rules (e.g. `if user == 'Alice': ...`).
- Permissions must be evaluated by a decoupled, formally verifiable authorization engine.
- Every incoming request must be **Denied by Default** until an explicit, active policy permits the exact principal, action, and resource tuple.

AWS designed **Cedar** specifically for this purpose. Cedar policies are concise, safe against infinite recursion, and support rapid sub-millisecond evaluation.

---

## 2. The Cedar Policy Specification (`policies.cedar`)

As mandated by Section 4.1 of the Hackathon Specification:

```cedar
// CareSync Zero-Trust Elder Policy
// Only authorized family members designated on the patient resource may view records

permit(
    principal,
    action == Action::"ViewPatientRecord",
    resource
)
when {
    principal in resource.authorized_family
};
```

### Policy Anatomy:
1. **Effect:** `permit` — grants authorization only if the when-clause evaluates to true.
2. **Principal Scope:** `principal` — accepts any entity of type `User` (e.g. `User::"Alice"`, `User::"Eve"`).
3. **Action Scope:** `action == Action::"ViewPatientRecord"` — applies strictly when accessing or reading patient medication profiles.
4. **Resource Scope:** `resource` — targets an entity of type `Patient` (e.g. `Patient::"Grandma_Bob"`).
5. **Condition Clause:** `when { principal in resource.authorized_family }` — verifies set membership in the patient's authorized family list.

---

## 3. Entity Schema & Modeling

Cedar evaluates policies in the context of an **Entity Graph**:

```json
[
  {
    "uid": { "type": "User", "id": "Alice" },
    "attrs": { "role": "FamilyMember", "relationship": "Daughter" },
    "parents": []
  },
  {
    "uid": { "type": "User", "id": "Charlie" },
    "attrs": { "role": "FamilyMember", "relationship": "Son" },
    "parents": []
  },
  {
    "uid": { "type": "User", "id": "Eve" },
    "attrs": { "role": "Stranger", "relationship": "None" },
    "parents": []
  },
  {
    "uid": { "type": "Patient", "id": "Grandma_Bob" },
    "attrs": {
      "name": "Roberta Bob",
      "authorized_family": [
        { "type": "User", "id": "Alice" },
        { "type": "User", "id": "Charlie" }
      ]
    },
    "parents": []
  },
  {
    "uid": { "type": "Action", "id": "ViewPatientRecord" },
    "attrs": {},
    "parents": []
  }
]
```

---

## 4. Evaluation Engine Implementation (`cedar_auth.py`)

Using `cedarpy` (Rust-compiled high performance bindings):

```python
import json
import os
from cedarpy import is_authorized, Decision

POLICY_PATH = os.path.join(os.path.dirname(__file__), "policies.cedar")
MOCK_DB_PATH = os.path.join(os.path.dirname(__file__), "mock_db.json")

def load_policy() -> str:
    with open(POLICY_PATH, "r") as f:
        return f.read()

def build_entities(patient_id: str) -> list:
    with open(MOCK_DB_PATH, "r") as f:
        db = json.load(f)
    
    patient_info = db.get("patients", {}).get(patient_id, {})
    authorized_family_uids = []
    
    for member_str in patient_info.get("authorized_family", []):
        # Format: "User::Alice" -> id="Alice"
        user_name = member_str.split("::")[-1]
        authorized_family_uids.append({"type": "User", "id": user_name})
        
    entities = [
        {"uid": {"type": "User", "id": "Alice"}, "attrs": {}, "parents": []},
        {"uid": {"type": "User", "id": "Charlie"}, "attrs": {}, "parents": []},
        {"uid": {"type": "User", "id": "Eve"}, "attrs": {}, "parents": []},
        {
            "uid": {"type": "Patient", "id": patient_id},
            "attrs": {
                "authorized_family": authorized_family_uids
            },
            "parents": []
        },
        {"uid": {"type": "Action", "id": "ViewPatientRecord"}, "attrs": {}, "parents": []}
    ]
    return entities

def evaluate_cedar_auth(principal_str: str, patient_id: str, action_str: str = "ViewPatientRecord") -> dict:
    principal_id = principal_str.split("::")[-1]
    policies = load_policy()
    entities = build_entities(patient_id)
    
    request = {
        "principal": {"type": "User", "id": principal_id},
        "action": {"type": "Action", "id": action_str},
        "resource": {"type": "Patient", "id": patient_id},
        "context": {}
    }
    
    result = is_authorized(request, policies, entities)
    is_allowed = (result.decision == Decision.Allow)
    
    return {
        "authorized": is_allowed,
        "decision": "Allow" if is_allowed else "Deny",
        "principal": principal_str,
        "resource": f"Patient::{patient_id}",
        "action": f"Action::{action_str}",
        "diagnostics": result.diagnostics.errors if hasattr(result, 'diagnostics') else []
    }
```

---

## 5. Security Test Cases

| Principal | Resource | Action | Expected Decision | HTTP Status Code |
| :--- | :--- | :--- | :--- | :--- |
| `User::Alice` | `Patient::Grandma_Bob` | `ViewPatientRecord` | `Allow` | `200 OK` |
| `User::Charlie` | `Patient::Grandma_Bob` | `ViewPatientRecord` | `Allow` | `200 OK` |
| `User::Eve` | `Patient::Grandma_Bob` | `ViewPatientRecord` | `Deny` | `403 Forbidden` |
| `User::Mallory` | `Patient::Grandma_Bob` | `ViewPatientRecord` | `Deny` | `403 Forbidden` |
