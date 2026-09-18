# CareSync — AI-Driven Localized Medication Orchestrator for Eldercare

> **AWS First Commit Hackathon**  
> **Track:** Build It (Local / AWS-Simulated)  
> **Date:** September 2026  
> **Stack:** AWS SAM CLI, LocalStack, Cedar Policy Engine, Strands Agents SDK (Python), Ollama (Llama 3), Vite + React

---

## 🌟 Executive Overview

CareSync is an autonomous, policy-governed clinical medication orchestrator that transforms messy, unstructured doctor dictation into safe, structured daily pill schedules while actively intercepting life-threatening drug-drug interactions (DDIs).

Built specifically for the **AWS First Commit ("Build It: Local / AWS-Simulated") Track**, CareSync proves that cloud-native architectures can be developed, tested, and validated completely on a local workstation without incurring cloud bills or requiring live internet connections.

---

## 🚀 Key Features

### 1. The Golden Path Doctor Note Processing Engine
- Parses messy clinical voice memos (e.g. Dr. Smith prescribing Ibuprofen for Grandma Bob's knee pain).
- Queries existing patient medications (`Lisinopril 10mg`).
- Automatically intercepts the **High Severity Lisinopril + Ibuprofen drug clash** (kidney damage & blood pressure spike risk).
- Synthesizes a chronotherapy daily pill schedule (Morning, Afternoon, Evening).

### 2. Zero-Trust Security via AWS Cedar Policy Engine
- Implements formal RBAC/ABAC using AWS's **Cedar language** (`policies.cedar`).
- Evaluated locally using Rust-backed `cedarpy`.
- Blocks unauthorized intruders (`User::Eve`) with **HTTP 403 Forbidden** before any clinical data is accessed.

### 3. Strands Agents SDK Orchestration
- Utilizes AWS's open-source **Strands Agents SDK** with schema-bound `@tool` decorators:
  - `@tool fetch_patient_history`
  - `@tool check_drug_interaction`
  - `@tool generate_daily_schedule`
- Connects to local **Ollama** (`llama3`) with a zero-latency fallback engine for guaranteed demo reliability.

### 4. Innovation Feature Suite (Built by CareSync Team)
- 🎙️ **Multimodal Doctor Audio Note Simulator**: Speech-to-text dictation simulation.
- 🚨 **Real-Time Emergency Caregiver Alert Dispatcher**: Simulates Amazon SNS SMS alerts on severe drug clashes.
- 💊 **Medication Adherence & Pill Tracker**: Simulates Amazon DynamoDB for real-time dose checklist & tracking.
- 🛡️ **Cedar Zero-Trust Governance Playground**: Interactive UI security inspector for live permission auditing.

---

## 📁 Repository Structure

```
.
├── docs/                                  # Comprehensive architectural and operational documentation
│   ├── 01_ARCHITECTURE_OVERVIEW.md        # System architecture, data flow & component design
│   ├── 02_AWS_LOCAL_SETUP_GUIDE.md        # Step-by-step AWS on machine (LocalStack, SAM CLI, Docker)
│   ├── 03_CEDAR_AUTHORIZATION_ENGINE.md   # Cedar policy specs, RBAC/ABAC schemas, zero-trust validation
│   ├── 04_STRANDS_AGENT_AND_TOOLS.md      # Strands SDK agent loops, tool signatures, prompt design
│   ├── 05_DATA_MODELS_AND_INTERACTION_MATRIX.md # Mock DB schema & extended drug clash pharmacology rules
│   ├── 06_EXTENDED_FEATURES_INNOVATION.md # 4 value-add features (Audio note, SNS alerts, Adherence, Cedar GUI)
│   ├── 07_FRONTEND_UI_SPECIFICATION.md    # UI/UX design tokens, glassmorphic layout, component hierarchy
│   └── 08_TESTING_AND_VERIFICATION_PROTOCOL.md # Pytest protocol, golden path verification, judge demo script
├── backend/
│   ├── template.yaml                      # AWS SAM serverless definition (API Gateway + Lambda)
│   ├── requirements.txt                   # strands-agents, cedarpy, pytest, requests, boto3
│   ├── run_local_api.py                   # Local server runner on port 3001
│   ├── app/
│   │   ├── main.py                        # AWS Lambda handler & API router (/process-note, /adherence, /alerts)
│   │   ├── agent.py                       # Strands SDK Agent initialization & LLM orchestration
│   │   ├── tools.py                       # Strands @tool definitions (fetch_history, check_clash, schedule)
│   │   ├── cedar_auth.py                  # Cedar authorization wrapper using cedarpy
│   │   ├── policies.cedar                 # Cedar policy definitions (permit principal in authorized_family)
│   │   └── mock_db.json                   # Patients, authorized family, meds, interaction pharmacology matrix
│   └── tests/
│       ├── test_golden_path.py            # Golden path Dr. Smith note verification
│       ├── test_cedar_auth.py             # Cedar allow/deny unit tests
│       └── test_agent_tools.py            # Strands tool isolation unit tests
├── frontend/
│   ├── package.json                       # Vite + React + Lucide Icons
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx                        # Main CareSync dashboard
│       ├── index.css                      # Modern health-tech glassmorphism CSS
│       └── components/                    # Specialized UI components
└── README.md
```

---

## ⚡ Quick Start: Running CareSync Locally

### 1. Set Up Backend Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
```

### 2. Run Automated Pytest Suite
```bash
PYTHONPATH=backend pytest backend/tests/ -v
```

### 3. Launch Backend with AWS SAM Local (or Local Python Runner)
```bash
# Option A: Local API Runner (zero Docker prerequisite)
PYTHONPATH=backend python backend/run_local_api.py

# Option B: AWS SAM Local API
cd backend
sam local start-api --port 3001
```

### 4. Launch Frontend Web Dashboard
```bash
cd frontend
npm install
npm run dev
```
Open **http://localhost:5173** in your browser.
