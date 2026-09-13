# ExaGuard AI — 3-Minute Demo Video Script
**Target Duration:** 2:45 – 3:00 Minutes  
**Contest:** Exasol AI + Data Challenge 2026 | **Track:** AI Trust, Safety & Governance  

---

### 0:00 – 0:35 | The Problem & Context
- **Screen:** Show Slide 1 (ExaGuard Title), then switch to architecture diagram.
- **Voiceover:**
  > "Welcome to ExaGuard AI, the enterprise AI Agent Observability and Real-Time Governance platform powered by Exasol Personal.
  >
  > As enterprises deploy autonomous AI agents and Model Context Protocol tools across finance, healthcare, and infrastructure, they face four critical risks: prompt injection attacks, sensitive PII data leaks, runaway token spend, and regulatory compliance under the EU AI Act and SOC2.
  >
  > To govern these agents, enterprises need sub-second real-time telemetry analytics at massive scale. That is why we built ExaGuard on top of Exasol."

---

### 0:35 – 1:15 | Architecture & Executive SOC Command Center
- **Screen:** Switch to the live TypeScript React Dashboard (**Overview Tab**).
- **Voiceover:**
  > "Here is the ExaGuard Executive Command Center, built with React and TypeScript. Every single agent interaction across the enterprise is intercepted and streamed directly into Exasol's in-memory columnar database.
  >
  > At the top, we see real-time KPIs: thousands of traces analyzed, threats prevented, PII leaks redacted, and total token spend. Notice our query time on Exasol: under 2 milliseconds.
  >
  > Below, our security threat breakdown charts and spend heatmaps give SOC teams instant visibility into which agents have the highest risk profile, alongside our in-database 3-Sigma statistical anomaly engine."
- **Action:** Scroll down smoothly to show the live telemetry waterfall table updating with clean status badges.

---

### 1:15 – 1:45 | Security Sandbox & MCP Firewall
- **Screen:** Click on the **Security Sandbox** and **MCP Firewall** tabs.
- **Voiceover:**
  > "In the Security Sandbox, we can test prompt injection attacks and sensitive data leaks in real-time against our gateway.
  >
  > Furthermore, with our Model Context Protocol Firewall, ExaGuard inspects JSON-RPC tool parameters before execution, blocking SQL injections and path traversal exploits before they can compromise internal databases."
- **Action:** Select the SQL Injection scenario in the MCP Firewall tab, click Validate, and show the blocked decision.

---

### 1:45 – 2:20 | Automated AI Red Teaming & Exasol Benchmark
- **Screen:** Click on **Red Team Testing** and **Exasol Benchmark** tabs.
- **Voiceover:**
  > "ExaGuard features an automated AI Red Teaming suite that unleashes 7 adversarial vectors—including DAN jailbreaks, system prompt extraction, and token bombs—to score agent defense posture.
  >
  > In our benchmark tab, running multi-dimensional aggregations over high-volume traces executes in just 1.8 milliseconds on Exasol, demonstrating over 90% latency reduction compared to traditional row-based databases."
- **Action:** Click Execute Full Red Team Battery, show the vulnerability matrix, then switch to Benchmark and run the query timer.

---

### 2:20 – 2:50 | Compliance Auditor & Closing
- **Screen:** Click on **Compliance Audit** tab.
- **Voiceover:**
  > "Finally, compliance officers can ask plain-English questions to evaluate EU AI Act and SOC2 readiness. ExaGuard translates inquiries into analytical Exasol SQL on the fly, and exports cryptographically verified audit certificates with one click.
  >
  > ExaGuard makes enterprise AI agents secure, observable, and compliant—powered by Exasol Personal. Thank you."
- **Action:** Click Download Certificate, and show the natural language SQL query output.
