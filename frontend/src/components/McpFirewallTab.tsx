import React, { useState } from 'react';
import { apiClient } from '../api/client';
import { Server, ShieldAlert, CheckCircle2, Terminal } from 'lucide-react';

interface McpFirewallTabProps {
  onActionComplete: () => void;
}

export const McpFirewallTab: React.FC<McpFirewallTabProps> = ({ onActionComplete }) => {
  const [serverName, setServerName] = useState('database-mcp-server');
  const [scenario, setScenario] = useState('sql_injection');
  const [toolName, setToolName] = useState('query_customer_records');
  const [rawArgs, setRawArgs] = useState(
    '{\n  "query": "SELECT * FROM users WHERE id = 101 UNION SELECT username, password_hash FROM admin_users;"\n}'
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleScenarioChange = (s: string) => {
    setScenario(s);
    if (s === 'sql_injection') {
      setServerName('database-mcp-server');
      setToolName('query_customer_records');
      setRawArgs('{\n  "query": "SELECT * FROM users WHERE id = 101 UNION SELECT username, password_hash FROM admin_users;"\n}');
    } else if (s === 'path_traversal') {
      setServerName('filesystem-mcp-server');
      setToolName('read_local_resource');
      setRawArgs('{\n  "filepath": "../../../etc/passwd"\n}');
    } else if (s === 'unauthorized_tool') {
      setServerName('devops-mcp-server');
      setToolName('drop_database_table');
      setRawArgs('{\n  "table_name": "FINANCIAL_TRANSACTIONS_2026"\n}');
    } else {
      setServerName('database-mcp-server');
      setToolName('get_user_profile');
      setRawArgs('{\n  "user_id": "usr_99812",\n  "include_email": true\n}');
    }
  };

  const handleInspectMCP = async () => {
    setLoading(true);
    try {
      let parsed = {};
      try {
        parsed = JSON.parse(rawArgs);
      } catch (e) {
        parsed = { raw: rawArgs };
      }

      const res = await apiClient.inspectMCPCall({
        server_name: serverName,
        method: 'tools/call',
        tool_name: toolName,
        arguments: parsed
      });
      setResult(res);
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
        <h2 className="text-base font-semibold text-slate-900">Model Context Protocol (MCP) Security Firewall</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time JSON-RPC proxy inspecting MCP tool invocations, protecting against SQL injection, path traversal, and unauthorized tool calls.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left MCP Configuration */}
        <div className="bg-white border border-stone-200/90 rounded-xl p-5 space-y-4 shadow-sm">
          
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">MCP Attack / Test Scenario</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleScenarioChange('sql_injection')}
                className={`px-3 py-2 rounded-lg text-xs font-medium border text-left transition ${
                  scenario === 'sql_injection'
                    ? 'bg-rose-50 text-rose-700 border-rose-300'
                    : 'bg-stone-50 text-slate-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                SQL Injection via MCP
              </button>

              <button
                type="button"
                onClick={() => handleScenarioChange('path_traversal')}
                className={`px-3 py-2 rounded-lg text-xs font-medium border text-left transition ${
                  scenario === 'path_traversal'
                    ? 'bg-amber-50 text-amber-700 border-amber-300'
                    : 'bg-stone-50 text-slate-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Path Traversal Exploit
              </button>

              <button
                type="button"
                onClick={() => handleScenarioChange('unauthorized_tool')}
                className={`px-3 py-2 rounded-lg text-xs font-medium border text-left transition ${
                  scenario === 'unauthorized_tool'
                    ? 'bg-purple-50 text-purple-700 border-purple-300'
                    : 'bg-stone-50 text-slate-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Restricted System Tool
              </button>

              <button
                type="button"
                onClick={() => handleScenarioChange('safe_mcp')}
                className={`px-3 py-2 rounded-lg text-xs font-medium border text-left transition ${
                  scenario === 'safe_mcp'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-stone-50 text-slate-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Safe Tool Call
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Target MCP Server</label>
              <select
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 font-mono"
              >
                <option value="database-mcp-server">database-mcp-server</option>
                <option value="filesystem-mcp-server">filesystem-mcp-server</option>
                <option value="devops-mcp-server">devops-mcp-server</option>
                <option value="payment-mcp-server">payment-mcp-server</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">MCP Tool Name</label>
              <input
                type="text"
                value={toolName}
                onChange={(e) => setToolName(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">MCP JSON-RPC Arguments</label>
            <textarea
              rows={4}
              value={rawArgs}
              onChange={(e) => setRawArgs(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-lg p-3 text-xs text-slate-800 font-mono focus:outline-none focus:border-sky-500"
            />
          </div>

          <button
            type="button"
            onClick={handleInspectMCP}
            disabled={loading}
            className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-sky-600 text-white hover:bg-sky-700 transition disabled:opacity-50 shadow-sm"
          >
            <Terminal className="h-4 w-4" />
            <span>{loading ? 'Evaluating MCP Firewall...' : 'Validate MCP Tool via Firewall'}</span>
          </button>

        </div>

        {/* Right MCP Decision */}
        <div className="bg-white border border-stone-200/90 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <h3 className="text-sm font-semibold text-slate-900">Firewall Proxy Decision</h3>
            {result && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                result.is_blocked
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {result.is_blocked ? <ShieldAlert className="h-3 w-3 mr-1" /> : <CheckCircle2 className="h-3 w-3 mr-1" />}
                {result.is_blocked ? 'BLOCKED' : 'APPROVED'}
              </span>
            )}
          </div>

          {result ? (
            <div className="space-y-4 text-xs">
              
              <div className={`p-3 rounded-lg border ${
                result.is_blocked
                  ? 'bg-rose-50/70 border-rose-200 text-rose-800'
                  : 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
              }`}>
                <div className="font-semibold text-xs mb-1">
                  {result.is_blocked ? `Blocked Threat: ${result.threat_type}` : 'MCP Call Verified Safe'}
                </div>
                <div className="text-slate-700">
                  {result.reasons?.length ? result.reasons.join(' | ') : 'Tool invocation conforms to enterprise MCP authorization policy.'}
                </div>
              </div>

              <div>
                <label className="block text-slate-500 text-[10px] mb-1">Firewall Audit Object</label>
                <pre className="bg-stone-900 p-3 rounded-lg border border-stone-800 text-[10px] text-sky-400 overflow-x-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>

            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400 text-xs">
              <Server className="h-8 w-8 mb-2 text-slate-400" />
              <span>Select an MCP test case to verify parameter validation.</span>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
