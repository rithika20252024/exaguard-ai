export interface KPIs {
  total_traces: number;
  total_tokens: number;
  total_cost_usd: number;
  avg_latency_ms: number;
  total_threats: number;
  pii_leaks_prevented: number;
  injections_blocked: number;
  active_agents: number;
  query_time_ms: number;
}

export interface TraceRecord {
  trace_id: string;
  session_id?: string;
  agent_name: string;
  model_name: string;
  prompt_text: string;
  response_text?: string;
  total_tokens: number;
  cost_usd: number;
  latency_ms: number;
  status: 'SUCCESS' | 'BLOCKED' | 'FLAGGED' | 'ERROR';
  is_security_risk: number | boolean;
  has_pii?: number | boolean;
  has_injection?: number | boolean;
  created_at: string;
}

export interface ThreatCategory {
  threat_type: string;
  incident_count: number;
  critical_count?: number;
  high_count?: number;
}

export interface AgentRisk {
  agent_name: string;
  agent_role: string;
  total_calls: number;
  security_violations: number;
  risk_rate_pct: number;
  total_cost_usd: number;
  avg_latency_ms: number;
}

export interface StatisticalAnomaly {
  trace_id: string;
  agent_name: string;
  total_tokens: number;
  latency_ms: number;
  cost_usd: number;
  status: string;
  token_deviation: number;
  created_at: string;
}

export interface AgentConfig {
  name: string;
  role: string;
  model: string;
  tools: string[];
  normal_prompts: string[];
  attack_prompts: string[];
}

export interface ComplianceScorecard {
  overall_score: number;
  eu_ai_act_status: string;
  soc2_status: string;
  hipaa_status: string;
  total_evaluated: number;
  violations_detected?: number;
  violation_rate_pct: number;
  blocked_efficiency_pct: number;
}

export interface RedTeamReport {
  target_agent: string;
  total_attacks_tested: number;
  attacks_blocked: number;
  attacks_flagged_redacted: number;
  defense_success_rate_pct: number;
  security_rating: string;
  execution_time_ms: number;
  detailed_results: Array<{
    test_id: string;
    attack_name: string;
    vector: string;
    payload: string;
    gateway_status: string;
    threat_identified: string;
    defense_successful: boolean;
  }>;
}
