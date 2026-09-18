# CareSync — System Architecture Overview

**Hackathon Track:** AWS First Commit — Build It (Local / AWS-Simulated)  
**Date:** September 2026  
**Target System:** CareSync Localized AI Medication Orchestrator for Eldercare

---

## 1. Executive Summary & Vision

CareSync is a localized, zero-trust AI medication management orchestrator designed to protect elderly patients and assist caregivers. In real-world geriatric care, prescribing errors and adverse drug-drug interactions (DDIs) represent one of the leading causes of preventable hospitalizations. Doctors often communicate treatment adjustments via unstructured voice memos, phone calls, or discharge summaries. 

CareSync solves this by creating an autonomous, policy-governed workflow:
1. **Intakes** messy, conversational, transcribed clinical dictation.
2. **Enforces Zero-Trust Security** using AWS's **Cedar Policy Engine**, guaranteeing that only authorized family members and clinicians can access or update patient medication profiles.
3. **Orchestrates Autonomous Reasoning** via the **Strands Agents SDK (Python)** running against a local LLM (**Ollama Llama-3**), utilizing schema-bound tools to cross-reference patient active medication regimens.
4. **Detects Adverse Drug Interactions** in real time via an embedded pharmacology conflict matrix.
5. **Constructs an Intelligent Daily Chronotherapy Schedule** dividing medications into clinically appropriate Morning, Afternoon, Evening, and Bedtime slots.
6. **Simulates AWS Cloud-Native Services Locally** via **AWS SAM CLI**, **LocalStack**, and **Docker**, proving that modern cloud architectures can be developed, tested, and validated completely offline.

---

## 2. High-Level Architecture Diagram

```mermaid
flowchart TB
    subgraph ClientLayer ["Client Layer (Frontend SPA)"]
        UI["CareSync Web Dashboard\n(Vite + React + CSS Tokens)"]
        VoiceSim["Audio Voice Memo\nSimulator"]
        CedarPlayground["Cedar Zero-Trust\nSecurity Inspector"]
    end

    subgraph AWSLocal ["Local AWS Serverless Cloud (LocalStack / SAM Local)"]
        APIGW["Amazon API Gateway (Mock / Local)\nPOST /process-note\nPOST /adherence\nGET /alerts"]
        
        subgraph ComputeLambda ["AWS Lambda (Python 3.11)"]
            Handler["main.lambda_handler"]
            CedarAuth["Cedar Policy Engine\n(cedarpy Evaluator)"]
            
            subgraph StrandsFramework ["Strands Agents SDK Runtime"]
                AgentCore["CareSync Autonomous Agent\n(Strands Agent Core)"]
                ToolHistory["@tool fetch_patient_history"]
                ToolDDI["@tool check_drug_interaction"]
                ToolSchedule["@tool generate_daily_schedule"]
            end
        end

        subgraph LocalCloudServices ["Simulated AWS Services"]
            SNS["Amazon SNS (LocalStack)\nEmergency Alert Dispatcher"]
            DDB["Amazon DynamoDB (LocalStack)\nMedication Adherence Store"]
            CW["Amazon CloudWatch (LocalStack)\nCedar Audit Trails & Logs"]
        end
    end

    subgraph LocalAI ["Local LLM Engine"]
        Ollama["Ollama Instance (localhost:11434)\nllama3 Model\n(With Deterministic Fallback)"]
    end

    subgraph LocalStorage ["Local Data & Policy Repository"]
        PoliciesCedar["policies.cedar\n(Cedar Policy Language)"]
        MockDB["mock_db.json\n(Patients, Meds, DDI Matrix)"]
    end

    %% Interactions
    UI -->|"POST /process-note (JSON Body)"| APIGW
    VoiceSim -->|"Transcribed Clinical Note"| UI
    APIGW -->|"Lambda Event Proxy"| Handler
    
    Handler -->|"1. Validate Principal & Action"| CedarAuth
    CedarAuth -->|"Read Policies"| PoliciesCedar
    CedarAuth -->|"Read Patient Entity Attributes"| MockDB
    
    CedarAuth -->|"If Denied: HTTP 403"| Handler
    CedarAuth -->|"If Permitted: HTTP 200 Proceed"| AgentCore
    
    AgentCore <-->|"Inference & Tool Calls"| Ollama
    AgentCore --> ToolHistory
    AgentCore --> ToolDDI
    AgentCore --> ToolSchedule
    
    ToolHistory -->|"Query Patient Current Meds"| MockDB
    ToolDDI -->|"Cross-Reference DDI Matrix"| MockDB
    
    Handler -->|"High Severity DDI Event"| SNS
    Handler -->|"Store Adherence State"| DDB
    Handler -->|"Record Access Decision"| CW
    
    Handler -->|"Structured JSON Result"| APIGW
    APIGW -->|"Response Payload"| UI
```

---

## 3. End-to-End Sequence Flow ("The Golden Path")

```mermaid
sequenceDiagram
    autonumber
    actor Caregiver as Family Member (Alice)
    participant UI as React Frontend SPA
    participant SAM as API Gateway (SAM Local)
    participant Lambda as Lambda Handler (main.py)
    participant Cedar as Cedar Auth (cedar_auth.py)
    participant Agent as Strands Agent (agent.py)
    participant Tools as Strands Tools (tools.py)
    participant DB as Mock DB (mock_db.json)
    participant SNS as Simulated SNS

    Caregiver->>UI: Enters Doctor Note: "Hi, this is Dr. Smith. I need Grandma Bob to start taking 400mg Ibuprofen twice a day..."
    UI->>SAM: POST /process-note { user_id: "User::Alice", patient_id: "Grandma_Bob", doctors_note: "..." }
    SAM->>Lambda: Invoke lambda_handler(event, context)
    
    Note over Lambda,Cedar: Step 1: Zero-Trust Cedar Authorization
    Lambda->>Cedar: is_authorized(principal="User::Alice", action="ViewPatientRecord", resource="Patient::Grandma_Bob")
    Cedar->>DB: Fetch patient authorized_family list
    DB-->>Cedar: ["User::Alice", "User::Charlie"]
    Cedar-->>Lambda: Decision::Allow (Permitted!)
    
    Note over Lambda,Agent: Step 2: Strands Agent Execution
    Lambda->>Agent: process_clinical_note(patient_id="Grandma_Bob", doctors_note="...")
    
    Agent->>Tools: Tool Call: fetch_patient_history("Grandma_Bob")
    Tools->>DB: Read patient profile
    DB-->>Tools: current_medications: ["Lisinopril 10mg"]
    Tools-->>Agent: { "patient_id": "Grandma_Bob", "current_medications": ["Lisinopril 10mg"] }
    
    Note over Agent: Agent parses new medication: Ibuprofen 400mg, 2x daily (morning & evening)
    
    Agent->>Tools: Tool Call: check_drug_interaction(new_meds=["Ibuprofen 400mg"], current_meds=["Lisinopril 10mg"])
    Tools->>DB: Cross-reference DDI matrix ("Lisinopril-Ibuprofen")
    DB-->>Tools: Severity: "High", Warning: "May decrease kidney function and reduce BP control."
    Tools-->>Agent: { "conflict_found": true, "details": "Lisinopril-Ibuprofen interaction: May decrease kidney function..." }
    
    Agent->>Tools: Tool Call: generate_daily_schedule(medications=[Lisinopril 10mg, Ibuprofen 400mg])
    Tools-->>Agent: { "morning": [...], "afternoon": [], "evening": [...] }
    
    Agent-->>Lambda: Complete structured payload
    
    opt Conflict Found (High Severity)
        Lambda->>SNS: Publish Alert to Family Topics
    end
    
    Lambda-->>SAM: HTTP 200 OK + Structured JSON Response
    SAM-->>UI: Deliver payload
    UI-->>Caregiver: Render Visual Pill Schedule + Red Alert Conflict Banner
```

---

## 4. Key Architectural Decisions

| Decision | Choice | Rationale |
| :--- | :--- | :--- |
| **Cloud Simulation** | AWS SAM CLI + LocalStack | Matches standard enterprise AWS architectures without incurring AWS cloud billing or requiring internet access during offline hackathon demos. |
| **Authorization** | Cedar Policy Engine (`cedarpy`) | Open-source, formally verifiable policy language created by AWS. Decouples permission logic entirely from application code. |
| **Agent Framework** | Strands Agents SDK (Python) | AWS's modern agent framework built explicitly for tool-use, multi-step reasoning, and deterministic structured returns. |
| **Local LLM** | Ollama (`llama3`) + Dual-Mode Fallback | True local AI execution on developer workstation. Robust fallback ensures 100% test passing even in CI/CD without GPU. |
| **Frontend Stack** | Vite + React + Vanilla CSS Tokens | Ultra-fast startup (<300ms), zero dependency bloat, dynamic glassmorphism design system. |
