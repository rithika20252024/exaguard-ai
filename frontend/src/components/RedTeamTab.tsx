import React, { useState } from 'react';
import { AgentConfig, RedTeamReport } from '../types';
import { apiClient } from '../api/client';
import { Crosshair } from 'lucide-react';

interface RedTeamTabProps {
  agents: AgentConfig[];
  onActionComplete: () => void;
}

export const RedTeamTab: React.FC<RedTeamTabProps> = ({ agents, onActionComplete }) => {
  const [selectedAgent, setSelectedAgent] = useState<string>(agents[0]?.name || 'FinTech-WealthAdvisor-Agent');
  const [loading, setLoading] = useState<boolean>(false);
  const [report, setReport] = useState<RedTeamReport | null>(null);

  const handleRunSuite = async () => {
    setLoading(true);
    try {
      const res = await apiClient.runRedTeam(selectedAgent);
      setReport(res);
      onActionComplete();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h2 className="text-base font-semibold text-slate-900">Automated AI Red Teaming & Stress-Testing Suite</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Execute automated multi-vector adversarial penetration tests (DAN jailbreaks, indirect extraction, synthetic SSN leaks, privilege escalation) to score agent defense posture.
        </p>
      </div>

      {/* Trigger Row */}
      <div className="bg-white border border-stone-200/90 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        
        <div className="w-full md:w-1/2">
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Select Target Agent for Red Teaming</label>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
          >
            {agents.map((a) => (
              <option key={a.name} value={a.name}>
                {a.name} ({a.role})
              </option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-auto flex items-end">
          <button
            onClick={handleRunSuite}
            disabled={loading}
            className="w-full md:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition disabled:opacity-50 shadow-sm"
          >
            <Crosshair className="h-4 w-4" />
            <span>{loading ? 'Executing 7 Attack Vectors...' : 'Execute Full Red Team Battery (7 Vectors)'}</span>
          </button>
        </div>

      </div>

      {/* Report Summary Cards */}
      {report && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div className="bg-white border border-stone-200/90 rounded-xl p-4 shadow-sm">
              <span className="text-slate-500 text-xs font-medium">Defense Success Rate</span>
              <div className="mt-2 text-2xl font-bold text-sky-700 font-mono">
                {report.defense_success_rate_pct}%
              </div>
              <span className="text-[11px] text-slate-500">Attacks Mitigated</span>
            </div>

            <div className="bg-white border border-stone-200/90 rounded-xl p-4 shadow-sm">
              <span className="text-slate-500 text-xs font-medium">Attacks Blocked / Flagged</span>
              <div className="mt-2 text-2xl font-bold text-emerald-700 font-mono">
                {report.attacks_blocked + report.attacks_flagged_redacted} / {report.total_attacks_tested}
              </div>
              <span className="text-[11px] text-slate-500">Total Tested Vectors</span>
            </div>

            <div className="bg-white border border-stone-200/90 rounded-xl p-4 shadow-sm">
              <span className="text-slate-500 text-xs font-medium">Security Posture Rating</span>
              <div className="mt-2 text-lg font-bold text-amber-700">
                {report.security_rating}
              </div>
              <span className="text-[11px] text-slate-500">Tier Assessment</span>
            </div>

            <div className="bg-white border border-stone-200/90 rounded-xl p-4 shadow-sm">
              <span className="text-slate-500 text-xs font-medium">Execution Duration</span>
              <div className="mt-2 text-2xl font-bold text-slate-800 font-mono">
                {report.execution_time_ms} ms
              </div>
              <span className="text-[11px] text-slate-500">Multi-Turn Test Time</span>
            </div>

          </div>

          {/* Detailed Attack Vectors Matrix */}
          <div className="bg-white border border-stone-200/90 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Adversarial Vector Breakdown</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-slate-500 font-medium">
                    <th className="pb-2">Test ID</th>
                    <th className="pb-2">Attack Name</th>
                    <th className="pb-2">Threat Vector</th>
                    <th className="pb-2">Payload Excerpt</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Defense Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {report.detailed_results.map((r, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/70">
                      <td className="py-2.5 font-mono text-slate-500">{r.test_id}</td>
                      <td className="py-2.5 font-medium text-slate-800">{r.attack_name}</td>
                      <td className="py-2.5 text-slate-600">{r.vector}</td>
                      <td className="py-2.5 text-slate-600 max-w-xs truncate" title={r.payload}>
                        {r.payload}
                      </td>
                      <td className="py-2.5">
                        <span className="font-mono text-slate-700">{r.gateway_status}</span>
                      </td>
                      <td className="py-2.5 text-right">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${
                          r.defense_successful
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {r.defense_successful ? 'PASSED' : 'VULNERABLE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
