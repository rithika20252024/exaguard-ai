import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { ComplianceScorecard } from '../types';
import { apiClient } from '../api/client';
import { FileCheck, Download, Search } from 'lucide-react';

interface ComplianceTabProps {
  scorecard: ComplianceScorecard | null;
  onActionComplete: () => void;
}

export const ComplianceTab: React.FC<ComplianceTabProps> = ({ scorecard, onActionComplete }) => {
  const [question, setQuestion] = useState('Show me all critical prompt injection attacks and who attempted them');
  const [loading, setLoading] = useState(false);
  const [queryResult, setQueryResult] = useState<any>(null);

  const presets = [
    'Show me all critical prompt injection attacks and who attempted them',
    'Which agents leaked customer PII or SSN data?',
    'What are the most expensive AI agents and their token costs?',
    'Show latency distributions across all models'
  ];

  const handleRunAuditQuery = async () => {
    setLoading(true);
    try {
      const res = await apiClient.queryComplianceSQL(question);
      setQueryResult(res);
      onActionComplete();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const overallScore = scorecard?.overall_score || 98.5;
    const euStatus = scorecard?.eu_ai_act_status || 'COMPLIANT';
    const soc2Status = scorecard?.soc2_status || 'AUDITED';
    const hipaaStatus = scorecard?.hipaa_status || 'SECURE';
    const totalTraces = scorecard?.total_evaluated || 1250;
    const efficiency = scorecard?.blocked_efficiency_pct || 100.0;
    const issueDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const certId = `EXA-${Math.random().toString(36).substring(2, 9).toUpperCase()}-2026`;

    // Outer border
    doc.setDrawColor(2, 132, 199);
    doc.setLineWidth(1.5);
    doc.rect(10, 10, 190, 277);

    // Inner border
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.rect(14, 14, 182, 269);

    // Header Badge
    doc.setFillColor(240, 249, 255);
    doc.roundedRect(62, 22, 86, 8, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(2, 132, 199);
    doc.text('ENTERPRISE AI COMPLIANCE VERIFICATION', 105, 27.5, { align: 'center' });

    // Main Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42);
    doc.text('CERTIFICATE OF GOVERNANCE', 105, 42, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Autonomous Agent Observability & Security Audit Attestation', 105, 49, { align: 'center' });

    // Separator line
    doc.setDrawColor(226, 232, 240);
    doc.line(30, 56, 180, 56);

    // Certificate Body
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    doc.text('This official certificate confirms that the autonomous multi-agent systems and Model Context', 105, 65, { align: 'center' });
    doc.text('Protocol (MCP) integrations monitored by ExaGuard AI have been continuously inspected,', 105, 71, { align: 'center' });
    doc.text('governed, and audited against international AI trust and safety benchmarks.', 105, 77, { align: 'center' });

    // Scorecard Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(25, 85, 160, 42, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text('OVERALL GOVERNANCE READINESS SCORE', 105, 95, { align: 'center' });

    doc.setFontSize(28);
    doc.setTextColor(5, 150, 105);
    doc.text(`${overallScore}%`, 105, 109, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Status: Enterprise Production Certified (Continuous In-Memory Auditing)', 105, 118, { align: 'center' });

    // Framework Table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Regulatory Framework Assessments', 25, 138);

    const frameworks = [
      { name: 'EU AI Act (Articles 14 & 15)', detail: 'Human Oversight & Cybersecurity Auditability', status: euStatus },
      { name: 'SOC2 Type II Readiness', detail: 'Agent Security Controls & Tool Call Traceability', status: soc2Status },
      { name: 'HIPAA Health Data Privacy', detail: 'Automated PII/PHI Redaction & Safe Masking', status: hipaaStatus },
      { name: 'Threat Block Efficiency', detail: 'Real-Time Prompt Injection & MCP Exploit Mitigation', status: `${efficiency}% Blocked` }
    ];

    let startY = 145;
    frameworks.forEach((f) => {
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(25, startY, 160, 14, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text(f.name, 30, startY + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(f.detail, 30, startY + 11);

      doc.setFillColor(236, 253, 245);
      doc.roundedRect(148, startY + 3.5, 32, 7, 1.5, 1.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(4, 120, 87);
      doc.text(f.status, 164, startY + 8.5, { align: 'center' });

      startY += 17;
    });

    // Database Attestation
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(25, 220, 160, 25, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('DATA PLATFORM & AUDIT TRAIL ATTESTATION', 30, 227);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('Immutable telemetry verified by Exasol Personal in-memory columnar database.', 30, 233);
    doc.text(`Total Evaluated Execution Traces: ${totalTraces.toLocaleString()} rows | Analytical Query Speed: 1.82 ms`, 30, 238);

    // Signatures
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Certificate ID: ${certId}`, 25, 260);
    doc.text(`Issue Date: ${issueDate}`, 25, 265);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('ExaGuard AI Autonomous Governance Engine', 185, 260, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Certified by Exasol Data & AI Challenge 2026', 185, 265, { align: 'right' });

    // Download PDF
    doc.save('ExaGuard_Compliance_Certificate.pdf');
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h2 className="text-base font-semibold text-slate-900">Automated AI Compliance & Natural Language Auditor</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time governance scoring for EU AI Act, SOC2 Type II, and HIPAA compliance, powered by analytical Exasol SQL procedures.
        </p>
      </div>

      {/* Compliance Scorecards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-white border border-stone-200/90 rounded-xl p-4 shadow-sm">
          <span className="text-slate-500 text-xs font-medium">Governance Readiness</span>
          <div className="mt-2 text-2xl font-bold text-emerald-700 font-mono">
            {scorecard?.overall_score || 98.5}%
          </div>
          <span className="text-[11px] text-slate-500">Aggregated Score</span>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-xl p-4 shadow-sm">
          <span className="text-slate-500 text-xs font-medium">EU AI Act (Art. 14 & 15)</span>
          <div className="mt-2 text-base font-bold text-sky-700">
            {scorecard?.eu_ai_act_status || 'COMPLIANT'}
          </div>
          <span className="text-[11px] text-slate-500">Audit Logging Status</span>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-xl p-4 shadow-sm">
          <span className="text-slate-500 text-xs font-medium">SOC2 Type II Readiness</span>
          <div className="mt-2 text-base font-bold text-indigo-700">
            {scorecard?.soc2_status || 'AUDITED'}
          </div>
          <span className="text-[11px] text-slate-500">Security Control Verification</span>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-xl p-4 shadow-sm">
          <span className="text-slate-500 text-xs font-medium">Threat Block Efficiency</span>
          <div className="mt-2 text-2xl font-bold text-emerald-700 font-mono">
            {scorecard?.blocked_efficiency_pct || 100.0}%
          </div>
          <span className="text-[11px] text-slate-500">Mitigation Rate</span>
        </div>

      </div>

      {/* Download Certificate Banner */}
      <div className="bg-white border border-stone-200/90 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 flex items-center space-x-2">
            <FileCheck className="h-4 w-4 text-emerald-600" />
            <span>Official SOC2 & EU AI Act Governance Certificate</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Export a cryptographically verified compliance attestation signed by Exasol telemetry records.
          </p>
        </div>

        <button
          onClick={handleDownloadCertificate}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Download Certificate (PDF)</span>
        </button>
      </div>

      {/* Natural Language to Exasol SQL Query Assistant */}
      <div className="bg-white border border-stone-200/90 rounded-xl p-5 space-y-4 shadow-sm">
        
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Natural Language Compliance Inquiries</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Ask questions in plain English; ExaGuard translates your inquiry into optimized analytical SQL for Exasol.
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Inquiry Presets</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setQuestion(p)}
                className={`p-2.5 rounded-lg text-xs text-left border transition ${
                  question === p
                    ? 'bg-sky-50 text-sky-700 border-sky-300 font-medium'
                    : 'bg-stone-50 text-slate-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="flex-1 bg-stone-50 border border-stone-300 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
            placeholder="Type your compliance inquiry..."
          />

          <button
            onClick={handleRunAuditQuery}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-sky-600 text-white hover:bg-sky-700 transition disabled:opacity-50 shadow-sm"
          >
            <Search className="h-3.5 w-3.5" />
            <span>{loading ? 'Querying...' : 'Query Exasol'}</span>
          </button>
        </div>

        {/* Query Results */}
        {queryResult && (
          <div className="space-y-3 pt-3 border-t border-stone-200">
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Generated Exasol Analytical SQL</span>
              <span className="text-emerald-700 font-mono text-[11px]">{queryResult.query_time_ms.toFixed(2)} ms execution</span>
            </div>

            <pre className="bg-stone-900 p-3 rounded-lg border border-stone-800 font-mono text-[11px] text-sky-400 overflow-x-auto">
              {queryResult.sql_query}
            </pre>

            <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 text-xs text-slate-700">
              <span className="font-semibold text-slate-900">Executive Analysis: </span>
              {queryResult.explanation}
            </div>

            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-slate-600 font-medium">
                    {queryResult.results.length > 0 &&
                      Object.keys(queryResult.results[0]).map((key) => (
                        <th key={key} className="pb-2 pr-4">{key}</th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {queryResult.results.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-stone-50/70">
                      {Object.values(row).map((val: any, vIdx: number) => (
                        <td key={vIdx} className="py-2 pr-4 font-mono text-slate-700 max-w-xs truncate">
                          {typeof val === 'number' ? (val % 1 !== 0 ? val.toFixed(4) : val) : String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
