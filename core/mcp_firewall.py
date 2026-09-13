"""
ExaGuard AI - Model Context Protocol (MCP) Security Firewall
Inspects, validates, and governs MCP JSON-RPC tool calls and resource accesses in real-time.
"""

import json
import re
from typing import Dict, Any, List, Optional
from datetime import datetime
from exasol_db.connection import db_manager

# High-Risk MCP System Methods & Parameter Keywords
SENSITIVE_MCP_METHODS = [
    "tools/call",
    "resources/read",
    "prompts/get",
    "roots/list",
    "sampling/createMessage"
]

HIGH_RISK_MCP_TOOLS = [
    "execute_terminal_command",
    "drop_database_table",
    "export_secret_vault",
    "access_raw_filesystem",
    "override_user_permissions"
]

SQL_INJECTION_INDICATORS = [
    r"(\bUNION\b\s+\bSELECT\b)",
    r"(\bDROP\b\s+\bTABLE\b)",
    r"(--|/\*|\*/|;)",
    r"(' OR '1'='1)"
]


class MCPFirewall:
    """Enterprise Security Proxy & Firewall for Model Context Protocol (MCP) agents."""

    @classmethod
    def evaluate_mcp_request(
        cls,
        server_name: str,
        method: str,
        tool_name: Optional[str] = None,
        arguments: Optional[Dict[str, Any]] = None,
        client_agent: str = "EnterpriseAgent"
    ) -> Dict[str, Any]:
        """Inspects an MCP JSON-RPC tool invocation before execution."""
        arguments = arguments or {}
        arg_str = json.dumps(arguments)
        is_blocked = False
        threat_type = None
        remediation = "ALLOWED"
        risk_level = "LOW"
        reasons = []

        # 1. Inspect for Unauthorized MCP Tool Execution
        if tool_name and any(rt in tool_name.lower() for rt in HIGH_RISK_MCP_TOOLS):
            is_blocked = True
            threat_type = "UNAUTHORIZED_MCP_TOOL"
            risk_level = "CRITICAL"
            remediation = "BLOCKED"
            reasons.append(f"Tool '{tool_name}' is restricted by enterprise MCP security policy.")

        # 2. Inspect for Injected SQL in MCP Arguments
        for pattern in SQL_INJECTION_INDICATORS:
            if re.search(pattern, arg_str, re.IGNORECASE):
                is_blocked = True
                threat_type = "MCP_SQL_INJECTION"
                risk_level = "CRITICAL"
                remediation = "BLOCKED"
                reasons.append(f"SQL Injection payload detected in MCP argument payload.")
                break

        # 3. Inspect for Sensitive File Traversal in Arguments
        if "../" in arg_str or "/etc/passwd" in arg_str or "id_rsa" in arg_str:
            is_blocked = True
            threat_type = "PATH_TRAVERSAL_EXPLOIT"
            risk_level = "CRITICAL"
            remediation = "BLOCKED"
            reasons.append("Path traversal signature detected in MCP file path parameter.")

        decision = {
            "is_blocked": is_blocked,
            "risk_level": risk_level,
            "threat_type": threat_type,
            "remediation": remediation,
            "server_name": server_name,
            "method": method,
            "tool_name": tool_name or "none",
            "arguments_sanitized": arguments if not is_blocked else {},
            "reasons": reasons,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

        # Log MCP Security event to Exasol
        if is_blocked:
            db_manager.insert_alert({
                "ALERT_ID": f"mcp_alt_{int(datetime.now().timestamp() * 1000)}",
                "TRACE_ID": f"mcp_trc_{server_name}",
                "AGENT_NAME": client_agent,
                "SEVERITY": risk_level,
                "THREAT_TYPE": threat_type,
                "DETAILS": f"MCP [{server_name}] tool '{tool_name}': {' | '.join(reasons)}",
                "REMEDIATION_ACTION": remediation,
                "ALERT_TIMESTAMP": decision["timestamp"]
            })

        return decision
