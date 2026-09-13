import React from 'react';
import { KPIs, TraceRecord, ThreatCategory, AgentRisk, StatisticalAnomaly } from '../types';
import { ShieldAlert, Lock, Activity, DollarSign, Users, AlertTriangle, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface OverviewTabProps {
  kpis: KPIs | null;
  threats: ThreatCategory[];
  agents: AgentRisk[];
  traces: TraceRecord[];
  anomalies: StatisticalAnomaly[];
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  kpis,
  threats,
  agents,
  traces,
  anomalies,
}) => {
  return (
    <div className="space-y-6">
      
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="bg-white border border-stone-200/90 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Traces</span>
            <Activity className="h-4 w-4 text-sky-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">
            {kpis?.total_traces?.toLocaleString() || '0'}
          </div>
          <div className="mt-1 text-xs text-slate-500">Streamed into Exasol</div>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Threats Intercepted</span>
            <ShieldAlert className="h-4 w-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600 tracking-tight">
            {kpis?.total_threats?.toLocaleString() || '0'}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {kpis?.injections_blocked || 0} Injections Blocked
          </div>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>PII Leaks Masked</span>
            <Lock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600 tracking-tight">
            {kpis?.pii_leaks_prevented?.toLocaleString() || '0'}
          </div>
          <div className="mt-1 text-xs text-slate-500">SSN & Financial Data Scrubber</div>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>LLM Telemetry Spend</span>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight font-mono">
            ${kpis?.total_cost_usd ? kpis.total_cost_usd.toFixed(4) : '0.0000'}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {kpis?.total_tokens ? `${(kpis.total_tokens / 1000).toFixed(1)}k Tokens` : '0 Tokens'}
          </div>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Active AI Agents</span>
            <Users className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">
            {kpis?.active_agents || 0}
          </div>
          <div className="mt-1 text-xs text-slate-500">Governed Instances</div>
        </div>

      </div>

      {/* Middle Section: Threat Breakdown & Agent Risk Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Threat Distribution */}
        <div className="bg-white border border-stone-200/90 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Threat Category Distribution</h3>
            <span className="text-xs text-slate-500">Real-Time Ingestion</span>
          </div>

          <div className="space-y-3">
            {threats.length > 0 ? (
              threats.map((threat, idx) => {
                const total = threats.reduce((acc, t) => acc + (t.incident_count || 0), 0) || 1;
                const pct = Math.round(((threat.incident_count || 0) / total) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-700 font-medium">{threat.threat_type || 'Unclassified'}</span>
                      <span className="text-slate-500 font-mono">{threat.incident_count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-sky-600 h-1.5 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                No threat incidents recorded in active window.
              </div>
            )}
          </div>
        </div>

        {/* Agent Cost & Risk Matrix */}
        <div className="bg-white border border-stone-200/90 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Agent Risk & Spend Overview</h3>
            <span className="text-xs text-slate-500">Exasol Aggregation</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-slate-500 font-medium">
                  <th className="pb-2">Agent Name</th>
                  <th className="pb-2 text-right">Calls</th>
                  <th className="pb-2 text-right">Violations</th>
                  <th className="pb-2 text-right">Risk Rate</th>
                  <th className="pb-2 text-right">Total Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {agents.map((agent, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/70 transition">
                    <td className="py-2.5 font-medium text-slate-800">
                      {agent.agent_name}
                      <div className="text-[10px] text-slate-500">{agent.agent_role}</div>
                    </td>
                    <td className="py-2.5 text-right font-mono text-slate-600">{agent.total_calls}</td>
                    <td className="py-2.5 text-right font-mono text-rose-600 font-semibold">{agent.security_violations}</td>
                    <td className="py-2.5 text-right">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        agent.risk_rate_pct > 20 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-stone-100 text-slate-600'
                      }`}>
                        {agent.risk_rate_pct}%
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-mono text-slate-800">
                      ${typeof agent.total_cost_usd === 'number' ? agent.total_cost_usd.toFixed(4) : agent.total_cost_usd}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* In-Database 3-Sigma Anomaly Detection */}
      <div className="bg-white border border-stone-200/90 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center space-x-2">
              <span>In-Database 3-Sigma Statistical Anomaly Detection</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-medium">
                SQL Analytics
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Calculates statistical means and standard deviations within Exasol to flag runaway agent loops and outlier spikes.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-slate-500 font-medium">
                <th className="pb-2">Trace ID</th>
                <th className="pb-2">Agent</th>
                <th className="pb-2 text-right">Tokens</th>
                <th className="pb-2 text-right">Latency</th>
                <th className="pb-2 text-right">Deviation</th>
                <th className="pb-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {anomalies.length > 0 ? (
                anomalies.map((anom, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/70">
                    <td className="py-2.5 font-mono text-slate-500">{anom.trace_id}</td>
                    <td className="py-2.5 font-medium text-slate-800">{anom.agent_name}</td>
                    <td className="py-2.5 text-right font-mono text-amber-700 font-semibold">{anom.total_tokens}</td>
                    <td className="py-2.5 text-right font-mono text-slate-600">{anom.latency_ms} ms</td>
                    <td className="py-2.5 text-right font-mono text-rose-600">+{anom.token_deviation}</td>
                    <td className="py-2.5 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        {anom.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400 text-xs">
                    All traces are operating within standard 3-Sigma boundaries.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real-Time Telemetry Waterfall Table */}
      <div className="bg-white border border-stone-200/90 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900">Live Execution Traces Stream</h3>
          <span className="text-xs text-slate-500">Recent Telemetry</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-slate-500 font-medium">
                <th className="pb-2">Timestamp</th>
                <th className="pb-2">Agent</th>
                <th className="pb-2">Model</th>
                <th className="pb-2">Prompt Excerpt</th>
                <th className="pb-2 text-right">Tokens</th>
                <th className="pb-2 text-right">Latency</th>
                <th className="pb-2 text-right">Cost</th>
                <th className="pb-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {traces.map((t, idx) => {
                const isBlocked = t.status === 'BLOCKED';
                const isFlagged = t.status === 'FLAGGED';
                return (
                  <tr key={idx} className="hover:bg-stone-50/70 transition">
                    <td className="py-2.5 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {t.created_at || 'Just now'}
                    </td>
                    <td className="py-2.5 font-medium text-slate-800 whitespace-nowrap">{t.agent_name}</td>
                    <td className="py-2.5 text-slate-500 whitespace-nowrap">{t.model_name}</td>
                    <td className="py-2.5 text-slate-700 max-w-xs truncate" title={t.prompt_text}>
                      {t.prompt_text}
                    </td>
                    <td className="py-2.5 text-right font-mono text-slate-600">{t.total_tokens}</td>
                    <td className="py-2.5 text-right font-mono text-slate-500">{typeof t.latency_ms === 'number' ? `${t.latency_ms.toFixed(1)} ms` : t.latency_ms}</td>
                    <td className="py-2.5 text-right font-mono text-slate-700">${typeof t.cost_usd === 'number' ? t.cost_usd.toFixed(4) : t.cost_usd}</td>
                    <td className="py-2.5 text-right whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${
                        isBlocked
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : isFlagged
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
