"""
ExaGuard AI - Real-Time AI Threat, PII & Guardrails Engine
Inspects prompts, tool calls, and model outputs for security vulnerabilities, compliance breaches,
and runaway loop anomalies.
"""

import re
from typing import Dict, Any, List, Tuple

# Prompt Injection & Jailbreak Heuristic Signatures
INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|prior|above)\s+instructions",
    r"system\s+override",
    r"disregard\s+your\s+(rules|guidelines|safety)",
    r"you\s+are\s+now\s+in\s+(developer|dan|unrestricted|god)\s+mode",
    r"reveal\s+your\s+(system\s+prompt|hidden\s+instructions|secret\s+key)",
    r"act\s+as\s+an\s+unfiltered\s+ai",
    r"bypass\s+(all\s+)?(security|guardrails|filters)",
    r"sudo\s+mode",
    r"jailbreak",
    r"prompt\s+leak",
]

# Sensitive Data (PII) Regular Expressions
PII_PATTERNS = {
    "US_SSN": r"\b\d{3}-\d{2}-\d{4}\b",
    "CREDIT_CARD": r"\b(?:\d[ -]*?){13,16}\b",
    "EMAIL_ADDRESS": r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b",
    "API_SECRET_KEY": r"(?i)(api[_-]?key|secret[_-]?key|bearer\s+[a-zA-Z0-9_\-\.]{20,}|sk-[a-zA-Z0-9]{20,})",
    "PHONE_NUMBER": r"\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b",
    "IBAN_BANK_ACCOUNT": r"\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b",
}


class GuardrailsEngine:
    """Enterprise AI Guardrail Inspector."""

    @classmethod
    def check_prompt_injection(cls, text: str) -> Tuple[bool, List[str]]:
        """Scans for adversarial prompt injections, jailbreaks, and system override attempts."""
        if not text:
            return False, []

        detected_threats = []
        for pattern in INJECTION_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                detected_threats.append(pattern)

        return len(detected_threats) > 0, detected_threats

    @classmethod
    def scan_and_redact_pii(cls, text: str) -> Tuple[bool, List[str], str]:
        """Detects sensitive personal or corporate data and produces a redacted version."""
        if not text:
            return False, [], text

        detected_types = []
        redacted_text = text

        for pii_type, pattern in PII_PATTERNS.items():
            matches = list(re.finditer(pattern, text))
            if matches:
                detected_types.append(pii_type)
                for m in matches:
                    matched_str = m.group(0)
                    mask = f"[REDACTED_{pii_type}]"
                    redacted_text = redacted_text.replace(matched_str, mask)

        return len(detected_types) > 0, detected_types, redacted_text

    @classmethod
    def analyze_payload(cls, prompt: str, response: str = "", tool_input: str = "") -> Dict[str, Any]:
        """Comprehensive security analysis of an agent interaction."""
        full_text = f"{prompt} {response} {tool_input}"

        has_inj, inj_patterns = cls.check_prompt_injection(prompt)
        has_pii, pii_types, redacted_prompt = cls.scan_and_redact_pii(prompt)
        resp_has_pii, resp_pii_types, redacted_resp = cls.scan_and_redact_pii(response)

        all_pii_types = list(set(pii_types + resp_pii_types))
        is_risk = has_inj or has_pii or resp_has_pii

        threat_type = None
        severity = "LOW"
        details = []

        if has_inj:
            threat_type = "PROMPT_INJECTION"
            severity = "CRITICAL"
            details.append(f"Prompt injection signature detected: {inj_patterns[:2]}")

        if all_pii_types:
            if not threat_type:
                threat_type = "PII_LEAK"
                severity = "HIGH"
            else:
                details.append(f"PII entities exposed: {', '.join(all_pii_types)}")

        return {
            "is_security_risk": is_risk,
            "has_injection": has_inj,
            "has_pii": len(all_pii_types) > 0,
            "threat_type": threat_type,
            "severity": severity,
            "details": " | ".join(details) if details else "Compliant interaction",
            "redacted_prompt": redacted_prompt,
            "redacted_response": redacted_resp,
            "pii_categories": all_pii_types
        }
