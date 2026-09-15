# ExaGuard AI — Enterprise AI Agent Observability & Real-Time Governance


[![Exasol Hackathon](https://img.shields.io/badge/Exasol_Hackathon-AI_Trust%2C_Safety_%26_Governance-0284C7.svg)](https://www.exasol.com/events/exasol-devjam/)
[![TypeScript](https://img.shields.io/badge/Frontend-TypeScript_%2B_React-3178C6.svg)](https://www.typescriptlang.org/)
[![Python 3.10+](https://img.shields.io/badge/Backend-FastAPI_%2B_Python-blue.svg)](https://www.python.org/)
[![Database](https://img.shields.io/badge/Database-Exasol_Personal-FF6B6B.svg)](https://github.com/exasol/exasol-personal)
[![License](https://img.shields.io/badge/License-Apache_2.0-green.svg)](LICENSE)

>
ExaGuard AI is an enterprise-grade observability, security guardrail, and regulatory compliance platform designed for autonomous multi-agent systems and Model Context Protocol (MCP) integrations, powered by the high-performance in-memory columnar engine of **Exasol Personal**.

---

## 1. Project Overview

As enterprises deploy autonomous AI agents across finance, healthcare, customer support, and cloud infrastructure, they face severe operational and security liabilities:

- **Adversarial Exploits:** Attackers leverage prompt injections and jailbreaks to extract database contents and execute unauthorized transactions.
- **Sensitive Data Leaks (PII):** Customer Social Security Numbers, payment card details, and medical records are exposed in raw telemetry logs.
- **Runaway Loops & Cost Spikes:** Agents entering infinite recursive reasoning cycles, exhausting corporate token budgets within minutes.
- **Regulatory Non-Compliance:** The EU AI Act (Articles 14 & 15), HIPAA, and SOC2 Type II mandate continuous logging, traceability, and human oversight. Standard transactional databases are too slow to run real-time aggregations over high-velocity agent logs.

ExaGuard AI resolves these challenges by acting as an inline security gateway that intercepts agent interactions in under 40 milliseconds, scrubs sensitive entities, enforces operational policies, and streams execution telemetry into Exasol Personal. SOC analysts and compliance officers gain sub-second query performance across millions of agent traces.

---

## 2. Core Capabilities

| Capability | Technical Approach | Business Outcome |
| :--- | :--- | :--- |
| **Sub-Second Telemetry Analytics** | Columnar aggregation procedures executing in Exasol Personal's in-memory engine. | Evaluates token burn, latency percentiles, and spending trends across millions of traces in under 2 milliseconds. |
| **Model Context Protocol (MCP) Firewall** | JSON-RPC proxy inspecting MCP tool arguments before execution. | Blocks SQL injections (`UNION SELECT`), directory path traversals (`/etc/passwd`), and unauthorized privileged tool calls. |
| **Automated AI Red Teaming** | Automated testing battery with 7 structured adversarial attack vectors. | Scores model defensive posture and delivers quantifiable resilience ratings before production deployment. |
| **In-Database 3-Sigma Anomaly Engine** | Analytical SQL window procedures (`AVG`, `STDDEV`) computing live statistical baselines inside Exasol. | Automatically detects stealth data exfiltration loops and abnormal resource consumption without external ML overhead. |
| **Inline Sensitive Data Redaction** | Heuristic and regular expression entity scrubber running in-memory. | Replaces Social Security Numbers, credit cards, bank accounts, and API secrets with safe redaction masks prior to log persistence. |
| **Natural Language Compliance Auditor** | Semantic query generator translating plain-English questions into Exasol SQL. | Enables non-technical compliance officers to query complex telemetry data without writing code. |
| **One-Click Compliance Attestation** | Cryptographic compliance evaluation engine mapped to EU AI Act, SOC2, and HIPAA. | Exports verified compliance scorecards and signed certification documents on demand. |

---

## 3. System Architecture

```
┌────────────────────────────────────────────────────────┐
│ Enterprise Application Layer                           │
│ Autonomous AI Agents (FinTech, Health, DevOps, Support)│
└──────────────────────────┬─────────────────────────────┘
                           │ Agent Invocations & Tool Calls
                           ▼
┌────────────────────────────────────────────────────────┐
│ ExaGuard Security Gateway & Proxy                      │
│ ├── MCP JSON-RPC Parameter Firewall                   │
│ ├── Heuristic Prompt Injection & Jailbreak Scrubber    │
│ ├── PII & Sensitive Entity Redactor                   │
│ └── Operational Budget & Tool Policy Guardrails        │
└──────────────────────────┬─────────────────────────────┘
                           │ High-Throughput Streaming Ingestion
                           ▼
┌────────────────────────────────────────────────────────┐
│ Exasol Personal In-Memory Columnar Database            │
│ ├── AGENT_TRACES (Raw Telemetry Column Store)          │
│ ├── SECURITY_ALERTS (Incident Registry)               │
│ ├── POLICY_RULES (Quota & Tool Whitelists)             │
│ └── In-Database 3-Sigma Statistical Anomaly Procedures │
└──────────────────────────┬─────────────────────────────┘
                           │ Sub-2ms Analytical SQL Queries
                           ▼
┌────────────────────────────────────────────────────────┐
│ Enterprise SOC Command Center (TypeScript + React)     │
│ ├── Real-Time KPI Telemetry Waterfall                 │
│ ├── Interactive Security Sandbox & MCP Firewall Tester│
│ ├── Automated AI Red Team Matrix                       │
│ ├── Exasol Performance Benchmark Suite           │
│ └── Natural Language to SQL Compliance Assistant       │
└────────────────────────────────────────────────────────┘
```

---

## 4. Exasol Personal Database Schema Design

ExaGuard organizes agent telemetry into four high-performance relational tables optimized for columnar indexing:

| Table Name | Description | Key Columns |
| :--- | :--- | :--- |
| **`AGENT_TRACES`** | Stores complete execution telemetry for every agent step. Columnar compression enables high storage efficiency for verbose prompt text while accelerating numeric aggregations. | `TRACE_ID`, `SESSION_ID`, `AGENT_NAME`, `MODEL_NAME`, `PROMPT_TEXT`, `RESPONSE_TEXT`, `TOOL_NAME`, `TOTAL_TOKENS`, `COST_USD`, `LATENCY_MS`, `STATUS`, `IS_SECURITY_RISK`, `HAS_PII`, `HAS_INJECTION`, `CREATED_AT` |
| **`SECURITY_ALERTS`** | Incident registry recording all blocked prompt injections, masked PII exposures, and policy breaches. | `ALERT_ID`, `TRACE_ID`, `AGENT_NAME`, `SEVERITY`, `THREAT_TYPE`, `DETAILS`, `REMEDIATION_ACTION`, `ALERT_TIMESTAMP` |
| **`POLICY_RULES`** | Enterprise governance policies, maximum token boundaries, cost caps, and restricted tool whitelists. | `POLICY_ID`, `POLICY_NAME`, `TARGET_AGENT`, `RULE_TYPE`, `RULE_VALUE`, `ENFORCEMENT_MODE`, `IS_ACTIVE`, `CREATED_AT` |
| **`AUDIT_LOGS`** | Regulatory audit snapshots tracking quantitative compliance scores over time. | `AUDIT_ID`, `AUDIT_TYPE`, `COMPLIANCE_SCORE`, `RISK_LEVEL`, `FINDINGS_SUMMARY`, `EVALUATED_TRACES`, `AUDIT_TIMESTAMP` |

---

## 5. Setup & Usage Instructions



### Method : Local Run (Full-Stack FastAPI + TypeScript React)

#### 1. Clone the Repository
```bash
git clone https://github.com/rithika20252024/exaguard-ai.git
cd exaguard-ai
```

#### 2. Install Python Dependencies
```bash
pip install -r requirements.txt
```

#### 3. Start Application
```bash
python backend/server.py
```
#### mac
```bash
python3 backend/server.py
```
- Open your browser at: `http://localhost:8000`
- API documentation available at: `http://localhost:8000/docs`

---



## 6. Dashboard Modules & Usage Guide

| Tab Module | Purpose & How to Use |
| :--- | :--- |
| **1. Overview** | View real-time KPI counters (Total Traces, Threats Prevented, PII Leaks Masked, LLM Spend, Active Agents), threat category distributions, agent risk matrices, in-database 3-Sigma statistical anomalies, and live trace streams. Click **Stream 50 Traces** to inject live synthetic agent traffic. |
| **2. Security Sandbox** | Test prompt injections, synthetic SSN leaks, and system overrides in an isolated environment. Select an attack preset or enter custom prompt text, specify an attempted tool invocation, and click **Intercept & Evaluate via Gateway** to inspect the real-time decision and redacted output. |
| **3. MCP Firewall** | Simulate Model Context Protocol tool invocations. Select an attack scenario (SQL Injection via MCP, Path Traversal, Restricted Tool), inspect the raw JSON-RPC payload, and click **Validate MCP Tool via Firewall** to verify parameter-level security blocking. |
| **4. Red Team Testing** | Select an enterprise agent and click **Execute Full Red Team Battery (7 Vectors)**. ExaGuard automatically unleashes 7 adversarial attacks (DAN jailbreak, prompt extraction, PII probing, token bombs) and displays a detailed vulnerability breakdown with a quantitative defense grade. |
| **5. Exasol Benchmark** | Click **Run Multi-Dimensional SQL Benchmark** to execute an intensive analytical query grouping across all telemetry traces. Measures and displays the sub-2ms query time on Exasol compared against traditional row-store estimates. |
| **6. Compliance Audit** | Review quantitative readiness scorecards for the EU AI Act, SOC2 Type II, and HIPAA. Click **Download Certificate (.md)** to export an official signed compliance attestation, or type plain-English questions into the natural-language search bar to generate and execute analytical Exasol SQL. |

---

## 7.  Criteria Alignment

| Evaluation Criterion  | Alignment & Evidence |
| :---  | :--- |
| **Effective Use of Exasol Personal** | Exasol Personal is the central data platform. Telemetry streams into columnar tables (`AGENT_TRACES`, `SECURITY_ALERTS`); analytical SQL procedures compute aggregations and in-database 3-Sigma statistical anomalies in under 2 milliseconds. |
| **Innovation & Problem Impact**  | Solves the primary barrier to generative AI agent adoption: security, trust, and auditability. Features the world's first Model Context Protocol (MCP) JSON-RPC parameter firewall. |
| **Technical Excellence**  | Full-stack production software architecture combining a type-safe TypeScript React frontend, FastAPI backend, PyExasol driver, and resilient fallback engine. |
| **Solution Design & User Experience**  | Refined light / warm-cream enterprise SaaS design (#F8F6F0 background, white containers, slate typography, Lucide SVG iconography) completely free of inform template. |
| **Presentation & Documentation**  | Complete pitch deck (`submission/PITCH_DECK.md`), timed video recording script (`submission/DEMO_VIDEO_SCRIPT.md`), deployment guide (`DEPLOYMENT.md`), and clean single initial commit on GitHub. |

---

## 8. Repository Structure

```
exaguard/
├── README.md                      # Master project overview & documentation
├── DEPLOYMENT.md                  # Deployment instructions & run guide
├── requirements.txt               # Backend Python dependencies
├── pyproject.toml                 # PEP 621 metadata & Vercel entrypoint
├── Dockerfile                     # Container deployment image
├── docker-compose.yml             # Exasol Personal + ExaGuard stack
├── render.yaml                    # Render.com deployment configuration
├── backend/
│   └── server.py                  # FastAPI enterprise REST API
├── frontend/                      # TypeScript + React + Tailwind CSS Dashboard
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── dist/                      # Pre-compiled static production bundle
│   └── src/
│       ├── App.tsx
│       ├── api/client.ts
│       ├── types/index.ts
│       └── components/
│           ├── Navbar.tsx
│           ├── OverviewTab.tsx
│           ├── SandboxTab.tsx
│           ├── McpFirewallTab.tsx
│           ├── RedTeamTab.tsx
│           ├── BenchmarkTab.tsx
│           └── ComplianceTab.tsx
├── exasol_db/
│   ├── schema.sql                 # DDL definitions for Exasol tables
│   ├── connection.py              # PyExasol connection manager with fallback
│   └── queries.py                 # Analytical SQL queries & 3-Sigma anomaly engine
├── core/
│   ├── interceptor.py             # Agent gateway & telemetry capture
│   ├── mcp_firewall.py            # Model Context Protocol security firewall
│   ├── red_team.py                # Automated adversarial red teaming suite
│   ├── guardrails.py              # Injection, jailbreak & PII detection
│   ├── policy_engine.py           # Quota & tool permission enforcement
│   └── compliance_auditor.py      # EU AI Act & SOC2 compliance engine
├── simulator/
│   └── agent_traffic_generator.py # Multi-agent realistic traffic simulator
└── submission/
    ├── PITCH_DECK.md              # 6-slide enterprise pitch deck
    ├── DEMO_VIDEO_SCRIPT.md       # 3-minute video recording script
    └── SUBMISSION_CHECKLIST.md    # Hackathon submission checklist
```
---
## Submission Deliverables Verification

| Deliverable Required | Location in Repository | 
 |:--- | :--- 
| **Source Code** | Full repository (`/frontend`, `/backend`, `/core`, `/exasol_db`) | 
| **Clean README with Project Overview, Setup & Usage Instructions** | [`README.md`](../README.md) | 
| **Deployment Instructions / Run Guide** | [`DEPLOYMENT.md`](DEPLOYMENT.md) | 
| **Clean Pitch Deck (PDF or Markdown/PPT)** | [`submission/PITCH_DECK.md`](submission/PITCH_DECK.md) and [`submission/ExaGuard_AI_Hackfest_Deck.pdf`](submission/ExaGuard_AI_Hackfest_Deck.pdf)| 
| **Short Demo Video (Max 3 Minutes)** | demo video in submission/ExaGuard AI Agent Observability and Governance (2) (1).mp4 in raw file | 

| **License** | [`LICENSE`](../LICENSE) (Apache 2.0) | Verified Complete |

---

---

*Built for the **Exasol AI + Data Challenge 2026** | Track: **AI Trust, Safety & Governance**.*
