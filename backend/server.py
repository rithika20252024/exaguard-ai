"""
ExaGuard AI - FastAPI Enterprise Backend & API Gateway
Provides REST endpoints for telemetry ingestion, security analysis, MCP firewall inspection,
and Exasol analytical queries.
"""

import os
import sys

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import time

from exasol_db.connection import db_manager
from exasol_db.queries import AnalyticsQueries
from core.interceptor import AgentInterceptor
from core.guardrails import GuardrailsEngine
from core.policy_engine import PolicyEngine
from core.compliance_auditor import ComplianceAuditor
from core.mcp_firewall import MCPFirewall
from core.red_team import RedTeamRunner
from simulator.agent_traffic_generator import AgentTrafficSimulator, AGENTS

app = FastAPI(
    title="ExaGuard AI Enterprise API",
    description="Backend API for AI Agent Observability & Real-Time Governance powered by Exasol",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware to route requests arriving with or without /api prefix (supports Vercel serverless rewrites)
@app.middleware("http")
async def normalize_api_path(request: Request, call_next):
    path = request.scope.get("path", "")
    if not path.startswith("/api") and not path.startswith("/assets") and path not in ("/", "/docs", "/openapi.json", "/redoc"):
        api_path = f"/api{path}"
        for route in app.routes:
            if getattr(route, "path", None) == api_path:
                request.scope["path"] = api_path
                break
    return await call_next(request)

# Auto-seed initial traces if empty
kpis = AnalyticsQueries.get_executive_kpis()
if kpis.get("total_traces", 0) < 15:
    AgentTrafficSimulator.seed_historical_telemetry(count=35)


# --- Request Models ---
class InterceptRequest(BaseModel):
    agent_name: str
    agent_role: str
    model_name: str
    prompt: str
    tool_name: Optional[str] = None
    input_tokens: Optional[int] = 100
    output_tokens: Optional[int] = 50

class MCPRequest(BaseModel):
    server_name: str
    method: str
    tool_name: Optional[str] = None
    arguments: Optional[Dict[str, Any]] = None
    client_agent: Optional[str] = "EnterpriseAgent"

class ComplianceQueryRequest(BaseModel):
    question: str

class RedTeamRequest(BaseModel):
    target_agent: str

class SeedRequest(BaseModel):
    count: int = 50


# --- REST Endpoints ---
@app.get("/api")
def get_api_root():
    return {
        "status": "healthy",
        "message": "ExaGuard AI Enterprise API Gateway",
        "engine": db_manager.db_engine_name,
        "is_connected_to_exasol": db_manager.is_connected_to_exasol
    }

@app.get("/api/health")
def get_health():
    return {
        "status": "healthy",
        "engine": db_manager.db_engine_name,
        "is_connected_to_exasol": db_manager.is_connected_to_exasol
    }

@app.get("/api/kpis")
def get_kpis():
    return AnalyticsQueries.get_executive_kpis()

@app.get("/api/threats/distribution")
def get_threat_distribution():
    df = AnalyticsQueries.get_threat_distribution()
    return df.to_dict(orient="records")

@app.get("/api/agents/risk-breakdown")
def get_agent_risk_breakdown():
    df = AnalyticsQueries.get_agent_risk_breakdown()
    return df.to_dict(orient="records")

@app.get("/api/traces/recent")
def get_recent_traces(limit: int = 20):
    df = AnalyticsQueries.get_recent_traces(limit=limit)
    return df.to_dict(orient="records")

@app.get("/api/anomalies/statistical")
def get_statistical_anomalies():
    df = AnalyticsQueries.detect_statistical_anomalies()
    return df.to_dict(orient="records")

@app.get("/api/agents/list")
def get_agents_list():
    return AGENTS

@app.post("/api/guardrails/inspect")
def inspect_agent_call(req: InterceptRequest):
    start_t = time.perf_counter()
    result = AgentInterceptor.process_agent_step(
        agent_name=req.agent_name,
        agent_role=req.agent_role,
        model_name=req.model_name,
        prompt=req.prompt,
        response="Simulated completion response from target LLM.",
        tool_name=req.tool_name,
        input_tokens=req.input_tokens or len(req.prompt.split()) * 2,
        output_tokens=req.output_tokens or 50,
        latency_ms=(time.perf_counter() - start_t) * 1000 + 40.0
    )
    return result

@app.post("/api/mcp/inspect")
def inspect_mcp_call(req: MCPRequest):
    decision = MCPFirewall.evaluate_mcp_request(
        server_name=req.server_name,
        method=req.method,
        tool_name=req.tool_name,
        arguments=req.arguments or {},
        client_agent=req.client_agent or "EnterpriseAgent"
    )
    return decision

@app.post("/api/red-team/run")
def run_red_team_suite(req: RedTeamRequest):
    return RedTeamRunner.run_full_suite(target_agent=req.target_agent)

@app.get("/api/benchmark/run")
def run_benchmark():
    res = AnalyticsQueries.run_benchmark_comparison()
    return {
        "elapsed_ms": res["elapsed_ms"],
        "rows_analyzed": res["rows_analyzed"],
        "data": res["data"].to_dict(orient="records")
    }

@app.get("/api/compliance/scorecard")
def get_compliance_scorecard():
    return ComplianceAuditor.evaluate_compliance_score()

@app.post("/api/compliance/query")
def query_compliance_sql(req: ComplianceQueryRequest):
    res = ComplianceAuditor.query_natural_language_audit(req.question)
    return {
        "sql_query": res["sql_query"],
        "explanation": res["explanation"],
        "row_count": res["row_count"],
        "query_time_ms": res["query_time_ms"],
        "results": res["results"].to_dict(orient="records")
    }

@app.post("/api/simulator/seed")
def seed_traces(req: SeedRequest):
    AgentTrafficSimulator.seed_historical_telemetry(count=req.count)
    return {"status": "success", "seeded_count": req.count}


# Serve compiled React / TypeScript frontend if dist folder exists
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"message": "ExaGuard Backend API Running. Frontend build in progress."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
