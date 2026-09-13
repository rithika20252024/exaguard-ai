import React from 'react';
import { ShieldCheck, Database, RefreshCw, Zap, Cpu } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  queryTimeMs: number;
  engineName: string;
  onRefresh: () => void;
  onSeed: () => void;
  isSeeding: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  queryTimeMs,
  engineName,
  onRefresh,
  onSeed,
  isSeeding
}) => {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'sandbox', label: 'Security Sandbox' },
    { id: 'mcp', label: 'MCP Firewall' },
    { id: 'redteam', label: 'Red Team Testing' },
    { id: 'benchmark', label: 'Exasol Benchmark' },
    { id: 'compliance', label: 'Compliance Audit' },
  ];

  return (
    <header className="border-b border-stone-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-slate-900">ExaGuard AI</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-medium">
                  Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Agent Observability & Real-Time Governance
              </p>
            </div>
          </div>

          {/* Center Engine Indicator */}
          <div className="hidden md:flex items-center space-x-4 bg-stone-50 px-3.5 py-1.5 rounded-lg border border-stone-200">
            <div className="flex items-center space-x-2 text-xs">
              <Database className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-slate-700 font-medium">{engineName}</span>
            </div>
            <div className="h-3 w-px bg-stone-200" />
            <div className="flex items-center space-x-1.5 text-xs text-slate-600">
              <Zap className="h-3.5 w-3.5 text-amber-600" />
              <span>SQL Query:</span>
              <span className="text-emerald-700 font-mono font-semibold">{queryTimeMs.toFixed(2)} ms</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={onSeed}
              disabled={isSeeding}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-slate-700 hover:bg-stone-50 border border-stone-300 shadow-sm transition disabled:opacity-50"
            >
              <Cpu className="h-3.5 w-3.5 text-sky-600" />
              <span>{isSeeding ? 'Streaming...' : 'Stream 50 Traces'}</span>
            </button>

            <button
              onClick={onRefresh}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-sky-600 text-white hover:bg-sky-700 transition shadow-sm"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Sync</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 overflow-x-auto py-2 border-t border-stone-100">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition ${
                  isActive
                    ? 'bg-stone-100 text-sky-700 border border-stone-300 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-stone-50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
