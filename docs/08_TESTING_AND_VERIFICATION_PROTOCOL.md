# CareSync: Testing Protocol & Verification Suite

**Component:** Automated Testing & Quality Gates (`backend/tests/`)  
**Hackathon Track:** AWS First Commit — Build It (Local / AWS-Simulated)

---

## 1. Automated Test Plan

CareSync provides three test suites:
1. `test_golden_path.py`: End-to-end integration test validating the exact Dr. Smith clinical voice note from Section 7 of the specification.
2. `test_cedar_auth.py`: Comprehensive security tests verifying that Cedar authorization permits authorized family (`Alice`, `Charlie`) and denies unauthorized entities (`Eve`).
3. `test_agent_tools.py`: Unit tests for each of the Strands `@tool` functions (`fetch_patient_history`, `check_drug_interaction`, `generate_daily_schedule`).

---

## 2. Running the Tests Locally

```bash
# Activate Python 3.11 virtual environment
source venv/bin/activate

# Execute all tests with detailed verbosity
pytest caresync/backend/tests/ -v
```

---

## 3. Test Assertions & Expected Outputs

### Golden Path Ingestion Note:
> *"Hi, this is Dr. Smith. I need Grandma Bob to start taking 400mg of Ibuprofen twice a day for her knee pain, morning and evening. She should continue her other meds."*

### Verified Outcomes:
- **Authorization Result:** `decision == "Allow"`
- **Extracted Med:** `Ibuprofen 400mg` twice a day
- **Current Med Found:** `Lisinopril 10mg`
- **Adverse Interaction Flagged:** `Lisinopril-Ibuprofen` flagged with `severity: "High"` and kidney function warning.
- **Pill Schedule Built:**
  - `Morning`: Lisinopril 10mg + Ibuprofen 400mg
  - `Evening`: Ibuprofen 400mg
