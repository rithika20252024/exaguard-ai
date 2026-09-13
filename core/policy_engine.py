"""
ExaGuard AI - Policy & Quota Enforcement Engine
Evaluates enterprise compliance rules, cost ceilings, and tool permissions in real-time.
"""

from typing import Dict, Any, List, Optional
import config


class PolicyEngine:
    """Evaluates agent actions against active corporate policies."""

    def __init__(self):
        # Default enterprise policies
        self.max_cost_limit = config.MAX_COST_PER_CALL_USD
        self.max_tokens_limit = config.MAX_PROMPT_TOKENS
        self.disallowed_tools = ["bash_execute_root", "drop_table", "export_all_passwords", "raw_sql_exec"]

    def evaluate_call(
        self,
        agent_name: str,
        tool_name: Optional[str],
        tokens: int,
        estimated_cost: float
    ) -> Dict[str, Any]:
        """Evaluates whether the agent call complies with operational policies."""
        violations = []
        action = "ALLOW"
        severity = "LOW"

        # 1. Check Cost Spikes / Runaway Loop Anomaly
        if estimated_cost > self.max_cost_limit:
            violations.append(f"Cost threshold exceeded: ${estimated_cost:.4f} > ${self.max_cost_limit:.4f}")
            action = "RATE_LIMITED"
            severity = "HIGH"

        # 2. Check Token Limit
        if tokens > self.max_tokens_limit:
            violations.append(f"Token limit exceeded: {tokens} > {self.max_tokens_limit}")
            action = "FLAGGED"
            severity = "MEDIUM"

        # 3. Check Disallowed Tools
        if tool_name and any(dt in tool_name.lower() for dt in self.disallowed_tools):
            violations.append(f"Unauthorized high-risk tool execution attempt: {tool_name}")
            action = "BLOCKED"
            severity = "CRITICAL"

        is_violated = len(violations) > 0
        return {
            "is_violated": is_violated,
            "action": action,
            "severity": severity,
            "violations": violations,
            "details": " ; ".join(violations) if violations else "Policy compliant"
        }
