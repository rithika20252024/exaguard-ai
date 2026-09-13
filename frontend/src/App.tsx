import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { OverviewTab } from './components/OverviewTab';
import { SandboxTab } from './components/SandboxTab';
import { McpFirewallTab } from './components/McpFirewallTab';
import { RedTeamTab } from './components/RedTeamTab';
import { BenchmarkTab } from './components/BenchmarkTab';
import { ComplianceTab } from './components/ComplianceTab';
import { apiClient } from './api/client';
import {
  KPIs,
  TraceRecord,
  ThreatCategory,
  AgentRisk,
  StatisticalAnomaly,
  AgentConfig,
  ComplianceScorecard
} from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [engineName, setEngineName] = useState<string>('Exasol Columnar Engine');
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [threats, setThreats] = useState<ThreatCategory[]>([]);
  const [agentsRisk, setAgentsRisk] = useState<AgentRisk[]>([]);
  const [traces, setTraces] = useState<TraceRecord[]>([]);
  const [anomalies, setAnomalies] = useState<StatisticalAnomaly[]>([]);
  const [agentsList, setAgentsList] = useState<AgentConfig[]>([]);
  const [scorecard, setScorecard] = useState<ComplianceScorecard | null>(null);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);

  const fetchAllData = async () => {
    try {
      const [
        healthRes,
        kpiRes,
        threatsRes,
        agentsRiskRes,
        tracesRes,
        anomaliesRes,
        agentsListRes,
        scorecardRes
      ] = await Promise.all([
        apiClient.getHealth(),
        apiClient.getKPIs(),
        apiClient.getThreatDistribution(),
        apiClient.getAgentRiskBreakdown(),
        apiClient.getRecentTraces(15),
        apiClient.getStatisticalAnomalies(),
        apiClient.getAgentsList(),
        apiClient.getComplianceScorecard()
      ]);

      setEngineName(healthRes.engine || 'Exasol Personal');
      setKpis(kpiRes);
      setThreats(threatsRes);
      setAgentsRisk(agentsRiskRes);
      setTraces(tracesRes);
      setAnomalies(anomaliesRes);
      setAgentsList(agentsListRes);
      setScorecard(scorecardRes);
    } catch (err) {
      console.error('Error loading ExaGuard telemetry:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleSeedTraces = async () => {
    setIsSeeding(true);
    try {
      await apiClient.seedTraces(50);
      await fetchAllData();
    } catch (err) {
      console.error('Error seeding traces:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-slate-900 flex flex-col selection:bg-sky-500 selection:text-white">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        queryTimeMs={kpis?.query_time_ms || 1.25}
        engineName={engineName}
        onRefresh={fetchAllData}
        onSeed={handleSeedTraces}
        isSeeding={isSeeding}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <OverviewTab
            kpis={kpis}
            threats={threats}
            agents={agentsRisk}
            traces={traces}
            anomalies={anomalies}
          />
        )}

        {activeTab === 'sandbox' && (
          <SandboxTab
            agents={agentsList}
            onActionComplete={fetchAllData}
          />
        )}

        {activeTab === 'mcp' && (
          <McpFirewallTab
            onActionComplete={fetchAllData}
          />
        )}

        {activeTab === 'redteam' && (
          <RedTeamTab
            agents={agentsList}
            onActionComplete={fetchAllData}
          />
        )}

        {activeTab === 'benchmark' && (
          <BenchmarkTab
            onActionComplete={fetchAllData}
          />
        )}

        {activeTab === 'compliance' && (
          <ComplianceTab
            scorecard={scorecard}
            onActionComplete={fetchAllData}
          />
        )}
      </main>

      <footer className="border-t border-stone-200/90 bg-white/70 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            ExaGuard AI — Built for the <span className="text-slate-700 font-medium">Exasol AI + Data Challenge 2026</span>
          </div>
          <div>
            Track: <span className="text-slate-700">AI Trust, Safety & Governance</span> • Powered by <span className="text-sky-700 font-medium">Exasol Personal</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
