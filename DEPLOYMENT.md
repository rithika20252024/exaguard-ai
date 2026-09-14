# ExaGuard AI — Deployment Instructions & Run Guide

This document provides complete instructions for running, testing, and deploying the ExaGuard AI enterprise platform.

---

## Live Production Deployment


- **Hosting Platform:** kuberns (Edge Network + Serverless Python 3.12 Runtime)
- **Frontend Bundle:** React 18, TypeScript, Tailwind CSS, Vite
- **Backend API:** FastAPI REST Gateway with PyExasol integration
- **Deployment Status:** Active, Continuous Deployment via GitHub `main` branch

---

## Deployment Architecture

```
Internet / Client Browser
            │
            ▼
[ kuberns Edge CDN & Routing ]
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

## Deployment Options

### Option 1: Access Live Deployment (Recommended but it might not work if free trail end  don't have premium so recommend to use localhost if not working)
No setup required. Access the live production instance directly:
- **Production Dashboard:** [https://exaguard-ai-main-8851f2b.kuberns.cloud/](https://exaguard-ai-main-8851f2b.kuberns.cloud/)
---
### Docker Configuration Files(port 8000)
```bash
# ExaGuard AI — FastAPI + React Full-Stack Application
# Multi-stage build: install dependencies, then slim runtime image

# ── Stage 1: builder ─────────────────────────────────────────────────────────
FROM python:3.12-slim-bookworm AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency manifest first for layer caching
COPY requirements.txt .

# Install all Python dependencies into a prefix directory
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Also install gunicorn (production ASGI server)
RUN pip install --no-cache-dir --prefix=/install "gunicorn>=21" "uvicorn[standard]>=0.27"

# ── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM python:3.12-slim-bookworm AS runtime

WORKDIR /app

# Runtime system packages: curl for health probes
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Copy application source
COPY . .

# Create writable data directory for SQLite fallback DB
RUN mkdir -p /app/data && chmod 777 /app/data

# Runtime constants — no user secrets here
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
# Force embedded SQLite mode: skip pyexasol connection attempt entirely
# (users who want native Exasol can override EXASOL_HOST and set AUTO_FALLBACK_SQLITE=False at runtime)
ENV AUTO_FALLBACK_SQLITE=True

EXPOSE 8000

CMD ["gunicorn", "backend.server:app", \
     "--worker-class", "uvicorn.workers.UvicornWorker", \
     "--bind", "0.0.0.0:8000", \
     "--workers", "2", \
     "--timeout", "120"] ```
### Option 2: Local Deployment (Python + FastAPI Backend)

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

### Option 3: Docker Deployment (Containerized Exasol + Dashboard)

To deploy both the native Exasol Personal database and ExaGuard in isolated containers:

#### 1. Prerequisites
- Docker & Docker Compose

#### 2. Launch Containers
```bash
docker compose up -d
```

#### 3. Service Allocation
| Service Name | Port | Description |
| :--- | :--- | :--- |
| `exasoldb` | `8563` | Exasol Personal In-Memory Columnar Database Engine |
| `exaguard-dashboard` | `8000` | ExaGuard Full-Stack Dashboard & API Gateway |

To shut down the containers:
```bash
docker compose down
```

---

### Option 4: Deploying Your Own Instance on Kubern

If you wish to deploy a private instance to your own Kubern account:

1. Fork or import the repository `https://github.com/rithika20252024/exaguard-ai` on Kubern.
2. Kubern automatically detects `pyproject.toml` with the PEP 621 table and entrypoint:
   ```toml

   entrypoint = "backend.server:app"
   ```
3. Click **Deploy**. The build completes in under 45 seconds.

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
