"""
ExaGuard AI - Real-Time Agent Interceptor & Telemetry Gateway
Intercepts agent invocations, executes inline guardrails, and streams telemetry into Exasol Personal.
"""

import uuid
import time
from datetime import datetime
from typing import Dict, Any, Optional
from exasol_db.connection import db_manager
from core.guardrails import GuardrailsEngine
from core.policy_engine import PolicyEngine

policy_engine = PolicyEngine()


class AgentInterceptor:
    """Enterprise Gateway Interceptor for AI Agents."""

    @classmethod
    def process_agent_step(
        cls,
        agent_name: str,
        agent_role: str,
        model_name: str,
        prompt: str,
        response: str,
        tool_name: Optional[str] = None,
        tool_input: Optional[str] = None,
        tool_output: Optional[str] = None,
        input_tokens: int = 150,
        output_tokens: int = 80,
        latency_ms: float = 120.0,
        session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Intercepts, scans, logs, and protects agent interactions."""
        trace_id = f"trc_{uuid.uuid4().hex[:12]}"
        session_id = session_id or f"sess_{uuid.uuid4().hex[:8]}"
        total_tokens = input_tokens + output_tokens

        # Standard OpenAI-style pricing heuristic ($3.00/1M input, $15.00/1M output approx)
        cost_usd = (input_tokens * 0.000003) + (output_tokens * 0.000015)

        # 1. Real-time Security & Threat Analysis
        security_analysis = GuardrailsEngine.analyze_payload(prompt, response, tool_input or "")

        # 2. Operational Policy Evaluation
        policy_eval = policy_engine.evaluate_call(agent_name, tool_name, total_tokens, cost_usd)

        # Determine Final Operational Status
        status = "SUCCESS"
        if security_analysis["has_injection"]:
            status = "BLOCKED"
        elif policy_eval["action"] == "BLOCKED":
            status = "BLOCKED"
        elif security_analysis["is_security_risk"]:
            status = "FLAGGED"

        # Build Trace Payload for Exasol
        trace_record = {
            "TRACE_ID": trace_id,
            "SESSION_ID": session_id,
            "AGENT_NAME": agent_name,
            "AGENT_ROLE": agent_role,
            "MODEL_NAME": model_name,
            "PROMPT_TEXT": security_analysis["redacted_prompt"],
            "RESPONSE_TEXT": security_analysis["redacted_response"],
            "TOOL_NAME": tool_name or "none",
            "TOOL_INPUT": tool_input or "",
            "TOOL_OUTPUT": tool_output or "",
            "INPUT_TOKENS": input_tokens,
            "OUTPUT_TOKENS": output_tokens,
            "TOTAL_TOKENS": total_tokens,
            "COST_USD": cost_usd,
            "LATENCY_MS": latency_ms,
            "STATUS": status,
            "IS_SECURITY_RISK": security_analysis["is_security_risk"] or policy_eval["is_violated"],
            "HAS_PII": security_analysis["has_pii"],
            "HAS_INJECTION": security_analysis["has_injection"],
            "CREATED_AT": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

        # Stream directly into Exasol Column Store
        db_manager.insert_trace(trace_record)

        # If a security violation occurred, record incident alert
        if trace_record["IS_SECURITY_RISK"]:
            alert_id = f"alt_{uuid.uuid4().hex[:10]}"
            threat_type = security_analysis["threat_type"] or "POLICY_VIOLATION"
            severity = security_analysis["severity"]
            if policy_eval["severity"] == "CRITICAL":
                severity = "CRITICAL"
                threat_type = "UNAUTHORIZED_TOOL"

            details = f"{security_analysis['details']} | {policy_eval['details']}"
            remediation = "BLOCKED" if status == "BLOCKED" else "REDACTED_AND_LOGGED"

            alert_record = {
                "ALERT_ID": alert_id,
                "TRACE_ID": trace_id,
                "AGENT_NAME": agent_name,
                "SEVERITY": severity,
                "THREAT_TYPE": threat_type,
                "DETAILS": details,
                "REMEDIATION_ACTION": remediation,
                "ALERT_TIMESTAMP": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            db_manager.insert_alert(alert_record)

        return {
            "trace_id": trace_id,
            "status": status,
            "cost_usd": cost_usd,
            "security": security_analysis,
            "policy": policy_eval,
            "sanitized_response": security_analysis["redacted_response"] if status != "BLOCKED" else "[REQUEST BLOCKED BY EXAGUARD SECURITY POLICY]"
        }
