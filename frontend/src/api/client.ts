import {
  KPIs,
  TraceRecord,
  ThreatCategory,
  AgentRisk,
  StatisticalAnomaly,
  AgentConfig,
  ComplianceScorecard,
  RedTeamReport
} from '../types';

const API_BASE = '/api';

export const apiClient = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  async getKPIs(): Promise<KPIs> {
    const res = await fetch(`${API_BASE}/kpis`);
    return res.json();
  },

  async getThreatDistribution(): Promise<ThreatCategory[]> {
    const res = await fetch(`${API_BASE}/threats/distribution`);
    return res.json();
  },

  async getAgentRiskBreakdown(): Promise<AgentRisk[]> {
    const res = await fetch(`${API_BASE}/agents/risk-breakdown`);
    return res.json();
  },

  async getRecentTraces(limit: number = 15): Promise<TraceRecord[]> {
    const res = await fetch(`${API_BASE}/traces/recent?limit=${limit}`);
    return res.json();
  },

  async getStatisticalAnomalies(): Promise<StatisticalAnomaly[]> {
    const res = await fetch(`${API_BASE}/anomalies/statistical`);
    return res.json();
  },

  async getAgentsList(): Promise<AgentConfig[]> {
    const res = await fetch(`${API_BASE}/agents/list`);
    return res.json();
  },

  async inspectAgentCall(payload: {
    agent_name: string;
    agent_role: string;
    model_name: string;
    prompt: string;
    tool_name?: string;
  }) {
    const res = await fetch(`${API_BASE}/guardrails/inspect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async inspectMCPCall(payload: {
    server_name: string;
    method: string;
    tool_name?: string;
    arguments?: Record<string, any>;
  }) {
    const res = await fetch(`${API_BASE}/mcp/inspect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async runRedTeam(target_agent: string): Promise<RedTeamReport> {
    const res = await fetch(`${API_BASE}/red-team/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_agent }),
    });
    return res.json();
  },

  async runBenchmark() {
    const res = await fetch(`${API_BASE}/benchmark/run`);
    return res.json();
  },

  async getComplianceScorecard(): Promise<ComplianceScorecard> {
    const res = await fetch(`${API_BASE}/compliance/scorecard`);
    return res.json();
  },

  async queryComplianceSQL(question: string) {
    const res = await fetch(`${API_BASE}/compliance/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    return res.json();
  },

  async seedTraces(count: number = 50) {
    const res = await fetch(`${API_BASE}/simulator/seed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count }),
    });
    return res.json();
  }
};
