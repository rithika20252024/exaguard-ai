-- ==============================================================================
-- ExaGuard AI - Exasol Relational & Columnar Telemetry Schema
-- Optimized for high-throughput streaming ingestion and sub-second analytical queries
-- ==============================================================================

-- Create dedicated schema
CREATE SCHEMA IF NOT EXISTS EXAGUARD;
OPEN SCHEMA EXAGUARD;

-- 1. Agent Traces Table: Stores raw execution traces from all enterprise AI agents
CREATE TABLE IF NOT EXISTS AGENT_TRACES (
    TRACE_ID            VARCHAR(64) PRIMARY KEY,
    SESSION_ID          VARCHAR(64),
    AGENT_NAME          VARCHAR(100),
    AGENT_ROLE          VARCHAR(100),
    MODEL_NAME          VARCHAR(100),
    PROMPT_TEXT         VARCHAR(2000000),
    RESPONSE_TEXT       VARCHAR(2000000),
    TOOL_NAME           VARCHAR(100),
    TOOL_INPUT          VARCHAR(2000000),
    TOOL_OUTPUT         VARCHAR(2000000),
    INPUT_TOKENS        DECIMAL(10,0),
    OUTPUT_TOKENS       DECIMAL(10,0),
    TOTAL_TOKENS        DECIMAL(10,0),
    COST_USD            DECIMAL(12,6),
    LATENCY_MS          DECIMAL(10,2),
    STATUS              VARCHAR(20),       -- 'SUCCESS', 'BLOCKED', 'ERROR', 'LOOP_DETECTED'
    IS_SECURITY_RISK    BOOLEAN,
    HAS_PII             BOOLEAN,
    HAS_INJECTION       BOOLEAN,
    CREATED_AT          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Security Alerts Table: High-priority security incidents and guardrail interventions
CREATE TABLE IF NOT EXISTS SECURITY_ALERTS (
    ALERT_ID            VARCHAR(64) PRIMARY KEY,
    TRACE_ID            VARCHAR(64),
    AGENT_NAME          VARCHAR(100),
    SEVERITY            VARCHAR(20),       -- 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
    THREAT_TYPE         VARCHAR(100),      -- 'PROMPT_INJECTION', 'PII_LEAK', 'COST_ANOMALY', 'UNAUTHORIZED_TOOL', 'JAILBREAK'
    DETAILS             VARCHAR(4000),
    REMEDIATION_ACTION  VARCHAR(100),      -- 'BLOCKED', 'REDACTED', 'RATE_LIMITED', 'FLAGGED'
    ALERT_TIMESTAMP     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Policy Rules Table: Enterprise compliance and quota policies
CREATE TABLE IF NOT EXISTS POLICY_RULES (
    POLICY_ID           VARCHAR(64) PRIMARY KEY,
    POLICY_NAME         VARCHAR(100),
    TARGET_AGENT        VARCHAR(100),      -- 'ALL' or specific agent
    RULE_TYPE           VARCHAR(50),       -- 'MAX_COST_PER_CALL', 'BLOCKED_TOOL', 'PII_RESTRICTION', 'INJECTION_STRICTNESS'
    RULE_VALUE          VARCHAR(500),
    ENFORCEMENT_MODE    VARCHAR(20),       -- 'ENFORCE', 'WARN_ONLY', 'DISABLED'
    IS_ACTIVE           BOOLEAN DEFAULT TRUE,
    CREATED_AT          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Audit & Compliance Logs Table: EU AI Act, HIPAA, SOC2 compliance assessments
CREATE TABLE IF NOT EXISTS AUDIT_LOGS (
    AUDIT_ID            VARCHAR(64) PRIMARY KEY,
    AUDIT_TYPE          VARCHAR(50),       -- 'EU_AI_ACT', 'SOC2', 'HIPAA', 'ISO_42001'
    COMPLIANCE_SCORE    DECIMAL(5,2),      -- 0.00 to 100.00%
    RISK_LEVEL          VARCHAR(20),       -- 'LOW', 'MODERATE', 'HIGH', 'NON_COMPLIANT'
    FINDINGS_SUMMARY    VARCHAR(4000),
    EVALUATED_TRACES    DECIMAL(10,0),
    AUDIT_TIMESTAMP     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
