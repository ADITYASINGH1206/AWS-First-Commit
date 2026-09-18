# Frontend UI/UX Specification & Design System

**Component:** CareSync Web Dashboard (`caresync/frontend`)  
**Technology:** Vite + React + Vanilla CSS Tokens + Lucide Icons  
**Hackathon Track:** AWS First Commit — Build It (Local / AWS-Simulated)

---

## 1. Visual Aesthetics & Design Direction

CareSync's user interface is designed with a **premium, health-tech glassmorphism** aesthetic. Unlike standard boilerplate dashboards, CareSync uses:
- **Deep Navy & Slate Backgrounds:** `#0B0F19` with subtle gradient backdrops (`#111827`, `#0F172A`).
- **Clinical Accent Palette:**
  - Teal/Emerald (`#10B981`, `#14B8A6`) for authorized status, active pills, and success states.
  - Electric Amber (`#F59E0B`) for warnings and adherence prompts.
  - Radiant Crimson (`#EF4444`, `#DC2626`) for high-severity drug conflicts and 403 Forbidden security blocks.
  - Cyan (`#06B6D4`) for agent reasoning telemetry and tool executions.
- **Modern Typography:** Inter and Outfit typography for crisp clinical legibility.
- **Micro-Interactions & Animations:** Smooth pill checklist toggles, pulse badges for LocalStack / Cedar health, audio waveform animation, and glowing cards.

---

## 2. Core Dashboard Layout & Component Hierarchy

```
+-----------------------------------------------------------------------------------------+
| [Header] CareSync Eldercare AI Orchestrator   | [Pill: LocalStack 🟢] [Cedar Engine 🟢] |
+-----------------------------------------------------------------------------------------+
| [Row 1: Security Context & Audio Simulator]                                             |
|  +--------------------------------------------+  +------------------------------------+  |
|  | Cedar Zero-Trust Identity Selector         |  | Doctor Voice Memo Simulator        |  |
|  | - Principal: [User::Alice (Authorized) v]  |  | [Play Dr. Smith Audio] [Dictate]   |  |
|  | - Resource: Patient::Grandma_Bob           |  | Audio Waveform [||||||||||||||||]  |  |
|  +--------------------------------------------+  +------------------------------------+  |
+-----------------------------------------------------------------------------------------+
| [Row 2: Doctor's Note Ingestion & Processing]                                           |
|  +-----------------------------------------------------------------------------------+  |
|  | Textarea: "Hi, this is Dr. Smith. I need Grandma Bob to start taking 400mg..."    |  |
|  | [Button: Process Clinical Note via Strands Agent] [Quick Load Sample Note]        |  |
|  +-----------------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------------+
| [Row 3: Real-Time Results & Conflict Warnings]                                          |
|  +-----------------------------------------------------------------------------------+  |
|  | ⚠️ HIGH SEVERITY INTERACTION DETECTED: Lisinopril + Ibuprofen                     |  |
|  | Mechanism: NSAIDs decrease kidney function & blunt ACE inhibitor BP control.      |  |
|  +-----------------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------------+
| [Row 4: Chronotherapy Daily Pill Schedule & Adherence Tracker]                          |
|  +-------------------------+  +-------------------------+  +-------------------------+  |
|  | 🌅 MORNING (8:00 AM)    |  | ☀️ AFTERNOON (1:00 PM)  |  | 🌙 EVENING (7:00 PM)    |  |
|  | - Lisinopril 10mg [v]   |  | - No pills scheduled    |  | - Ibuprofen 400mg [v]   |  |
|  | - Ibuprofen 400mg [v]   |  |                         |  |                         |  |
|  +-------------------------+  +-------------------------+  +-------------------------+  |
+-----------------------------------------------------------------------------------------+
```
