# ExaGuard AI —  Run Guide

This document provides complete instructions for running, testing, and deploying the ExaGuard AI enterprise platform.

---





- **Frontend Bundle:** React 18, TypeScript, Tailwind CSS, Vite
- **Backend API:** FastAPI REST Gateway with PyExasol integration
- **Deployment Status:** Active, Continuous Deployment via GitHub `main` branch

---

## Deployment Architecture

```
Internet / Client Browser
            │
            ▼

   ├── Static Asset Delivery (`/assets/*`, compiled TypeScript React SPA)
   └── Serverless Function Invocation (`/api/*` -> `backend.server:app`)
            │
            ▼
[ ExaGuard Core Platform ]
   ├── Inline Security Gateway & Guardrails
   ├── Model Context Protocol (MCP) Parameter Firewall
   ├── Automated AI Red Team Engine
   └── Exasol Analytical Engine (Native / Embedded In-Memory Store)
```

---

## Deployment 

### Docker Deployment (Recommended)

Run ExaGuard AI as an isolated, production-ready containerized service using Docker and Docker Compose.

#### Prerequisites
- [Docker Engine](https://docs.docker.com/engine/install/) (v20.10+)
- [Docker Compose](https://docs.docker.com/compose/) (v2.0+)

#### Option A: One-Command Start with Docker Compose
To build the image and start the application in the background:
```bash
docker compose up -d --build
```

View live logs:
```bash
docker compose logs -f
```

Stop the containers:
```bash
docker compose down
```

#### Option B: Standalone Docker Run
To build the image manually:
```bash
docker build -t exaguard-ai .
```

To run the container:
```bash
docker run -d \
  -p 8000:8000 \
  --name exaguard-ai \
  exaguard-ai
```

Once started, the application is accessible at:
- **Web UI & Dashboard:** `http://localhost:8000`
- **Interactive Swagger Docs:** `http://localhost:8000/docs`
- **Health Check:** `http://localhost:8000/api/health`

---

### Local Deployment (Python + FastAPI Backend)

To run the full-stack platform locally on macOS, Linux, or Windows (WSL):

#### 1. Prerequisites
- Python 3.10, 3.11, 3.12, or 3.13
- Git

#### 2. Clone Repository
```bash
git clone https://github.com/rithika20252024/exaguard-ai.git
cd exaguard-ai
```

#### 3. Install Python Dependencies
```bash
pip install -r requirements.txt
```

#### 4. Launch Backend Server
```bash
python backend/server.py
```
The FastAPI backend boots and automatically serves the pre-compiled TypeScript React application at:
- **Local Application:** `http://localhost:8000`
- **Interactive API Documentation (Swagger):** `http://localhost:8000/docs`

---



## Environment Variables & Configuration

The application is designed with resilient defaults and runs zero-config out of the box. The following optional environment variables can be configured in `.env` or cloud dashboard settings:

| Variable Name | Default Value | Description |
| :--- | :--- | :--- |
| `EXASOL_HOST` | `localhost` | Hostname or IP address of the target Exasol Personal instance |
| `EXASOL_PORT` | `8563` | Exasol JDBC/WebSocket communication port |
| `EXASOL_USER` | `sys` | Exasol database user |
| `EXASOL_PASSWORD` | `exasol` | Exasol database password |
| `EXASOL_SCHEMA` | `EXAGUARD` | Default database schema for agent telemetry tables |
| `EXASOL_ENCRYPTION` | `False` | Enable TLS encryption for Exasol connection |
| `MAX_COST_PER_CALL_USD` | `0.25` | Maximum allowable cost threshold per agent step |
| `MAX_PROMPT_TOKENS` | `4096` | Upper token boundary before policy rate limiting triggers |

---

## Verification & Health Check Commands

To verify that the deployment is operating correctly:

#### Check API Health Endpoint
```bash
curl http://localhost:8000/api/health
```
Expected response:
```json
{
  "status": "healthy",
  "engine": "Exasol Personal (Native @ localhost:8563)" or "Exasol Simulator (Embedded Zero-Config Mode)",
  "is_connected_to_exasol": true
}
```

#### Check Telemetry KPI Endpoint
```bash
curl http://localhost:8000/api/kpis
```
Expected response: Returns aggregated trace counts, token totals, spend metrics, and sub-2ms query execution speed.
