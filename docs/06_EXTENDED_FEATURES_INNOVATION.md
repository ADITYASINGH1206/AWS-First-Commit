# CareSync: Extended Features & Innovation Suite

**Hackathon Track:** AWS First Commit — Build It (Local / AWS-Simulated)  
**Authors:** CareSync Engineering Team

---

## Overview

To demonstrate technical mastery of cloud architecture and deliver exceptional value during hackathon judging, CareSync includes **Four Self-Engineered Innovation Features** that build upon the core Golden Path:

```
+-----------------------------------------------------------------------------+
|                      CareSync Innovation Feature Suite                      |
|                                                                             |
|  [Feature 1] Multimodal Audio Doctor Note Ingestion (Whisper/Transcribe)    |
|  [Feature 2] Real-Time Emergency Caregiver Alert Dispatcher (Amazon SNS)    |
|  [Feature 3] Daily Medication Adherence & Pill Tracker (Amazon DynamoDB)    |
|  [Feature 4] Cedar Zero-Trust Governance Playground (CloudWatch & AVP)      |
+-----------------------------------------------------------------------------+
```

---

## Feature 1: Multimodal Audio Doctor Note Ingestion Simulator
- **AWS Service Emulated:** Amazon Transcribe / Whisper Speech Processing.
- **Description:** Doctors on clinical rounds rarely sit at keyboards; they dictate voice memos. CareSync provides a simulated voice recorder widget on the dashboard.
- **Interactive Capabilities:**
  - One-click trigger for Dr. Smith's voice note with live audio waveform visualization.
  - Generates synchronized speech-to-text transcription directly into the doctor note pipeline.

---

## Feature 2: Real-Time Emergency Caregiver Alert System (Real Mobile Push + AWS SNS)
- **AWS Service Emulated & Real Integration:** Amazon Simple Notification Service (SNS) + Live Mobile Push via ntfy.sh.
- **Description:** When an adverse drug interaction of `High` or `Critical` severity is detected, CareSync immediately dispatches real notifications directly to caregiver mobile phones in addition to simulated SNS topic logs.
- **Interactive Capabilities:**
  - **Live Phone Push (iOS & Android):** Zero-configuration push notifications via ntfy.sh. Caregivers subscribe to `https://ntfy.sh/<topic>` on their phone (via free app or web) to receive audible alerts and vibrations.
  - **Live Carrier SMS (Optional AWS Mode):** When live AWS credentials and a verified phone number are provided, dispatches live SMS messages through Amazon SNS (`boto3.client('sns')`).
  - **Simulated AWS SNS Drawer:** Interactive UI drawer displaying simulated SMS payloads, message timestamps, and LocalStack SNS topic ARNs.
  - **Immediate Test Dispatch:** "Send Live Test Alert to My Phone" button allowing judges to verify real-time phone alerts instantly.

---

## Feature 3: Medication Adherence & Pill Tracker (Simulated Amazon DynamoDB)
- **AWS Service Emulated:** Amazon DynamoDB.
- **Description:** Translating a doctor's note into a schedule is step one; ensuring the patient takes the pills daily is step two.
- **Interactive Capabilities:**
  - Interactive pill checklist cards for Morning, Afternoon, and Evening doses.
  - "Mark as Taken" action updates local DynamoDB table `caresync-adherence-tracker`.
  - Calculates daily adherence percentage metric (e.g., "100% On-Track").

---

## Feature 4: Cedar Zero-Trust Governance Playground
- **AWS Service Emulated:** Amazon Verified Permissions & Amazon CloudWatch Logs.
- **Description:** Allows hackathon judges to interactively test unauthorized security access in real-time.
- **Interactive Capabilities:**
  - Toggle between `Alice` (Authorized Daughter, 200 OK) and `Eve` (Unauthorized Stranger, 403 Forbidden).
  - Displays Cedar policy syntax and evaluation execution metrics.

---

## 5. Architectural Analysis: Mock vs. Real Subsystems

| Subsystem / Feature | Current Implementation Status | Real vs. Mock Mechanism |
| :--- | :--- | :--- |
| **Cedar Policy Engine** | **REAL / LIVE** | Uses real AWS Cedar open-source engine via `cedarpy` (Rust-compiled). Formally parses and evaluates `policies.cedar`. |
| **Strands Agents SDK** | **REAL / LIVE** | Uses AWS's official `strands-agents` package with `@tool` schema decorators and execution loops. |
| **Local LLM Engine** | **REAL (Dual-Mode)** | Directly connects to local **Ollama** (`llama3`) on `localhost:11434`, with deterministic parser fallback when offline. |
| **Serverless Lambda & API** | **REAL AWS SAM CONTRACT** | Handled by `backend/app/main.py` matching standard API Gateway proxy integration. |
| **Mobile Phone Notifications** | **REAL / LIVE** | Dispatches live push alerts to phones via **ntfy.sh** + optional real AWS SNS SMS via `boto3`. |
| **Patient & Prescription DB** | **MOCK (File-backed)** | Stored in `mock_db.json` simulating Amazon DynamoDB / EHR database per hackathon specifications. |
| **Adherence State Store** | **MOCK (In-memory)** | Emulates DynamoDB table `caresync-adherence-tracker` with slot timestamps. |
| **Doctor Audio Memo** | **SIMULATED (Speech API)** | Browser SpeechSynthesis API & audio player simulating Amazon Transcribe / Whisper. |
