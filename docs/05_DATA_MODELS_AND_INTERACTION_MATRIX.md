# Data Models & Pharmacology Interaction Matrix

**Component:** Mock Database & Clinical Pharmacology Matrix (`backend/app/mock_db.json`)  
**Hackathon Track:** AWS First Commit — Build It (Local / AWS-Simulated)

---

## 1. Mock DB Schema (`mock_db.json`)

As specified in Section 5 of the Hackathon Blueprint, `mock_db.json` provides the authoritative mock store for patients, authorized family members, active medication regimens, and known drug-drug adverse interactions.

```json
{
  "patients": {
    "Grandma_Bob": {
      "name": "Roberta 'Grandma' Bob",
      "age": 78,
      "authorized_family": [
        "User::Alice",
        "User::Charlie"
      ],
      "current_medications": [
        "Lisinopril 10mg"
      ],
      "allergies": ["Penicillin"],
      "conditions": ["Hypertension", "Osteoarthritis"]
    },
    "Grandpa_Arthur": {
      "name": "Arthur Pendelton",
      "age": 82,
      "authorized_family": [
        "User::David"
      ],
      "current_medications": [
        "Warfarin 5mg"
      ],
      "allergies": [],
      "conditions": ["Atrial Fibrillation"]
    }
  },
  "interactions": {
    "Lisinopril-Ibuprofen": {
      "severity": "High",
      "warning": "May decrease kidney function and reduce BP control.",
      "mechanism": "NSAIDs inhibit renal prostaglandins, attenuating the hypotensive effect of ACE inhibitors and escalating the risk of acute renal failure."
    },
    "Warfarin-Aspirin": {
      "severity": "Critical",
      "warning": "Severe compounding hemorrhagic risk; major bleeding hazard.",
      "mechanism": "Synergistic anticoagulant and antiplatelet inhibition markedly increases incidence of gastrointestinal and intracranial hemorrhages."
    },
    "Metformin-Contrast": {
      "severity": "High",
      "warning": "Increased risk of fatal lactic acidosis.",
      "mechanism": "Iodinated radiocontrast media can impair renal filtration, causing metformin accumulation."
    },
    "Sertraline-Tramadol": {
      "severity": "High",
      "warning": "Potential life-threatening Serotonin Syndrome.",
      "mechanism": "Dual serotonergic reuptake and release leads to excessive CNS serotonin stimulation."
    }
  }
}
```

---

## 2. Drug-Drug Interaction Pharmacology Details

### Golden Path: Lisinopril + Ibuprofen
- **Class 1:** Lisinopril (ACE Inhibitor) — standard elder antihypertensive agent.
- **Class 2:** Ibuprofen (NSAID) — commonly requested over-the-counter pain reliever for osteoarthritis / knee pain.
- **Clinical Risk:** The combination blunts Lisinopril's blood pressure reduction and compromises renal hemodynamics. CareSync intercepts this combination and flags it immediately.
