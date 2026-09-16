"""
ExaGuard AI - Central Configuration
Handles database connection parameters, guardrail thresholds, and system settings.
"""

import os
dotenv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)

# Exasol Database Configuration
EXASOL_HOST = os.getenv("EXASOL_HOST", "localhost")
EXASOL_PORT = int(os.getenv("EXASOL_PORT", "8563"))
EXASOL_USER = os.getenv("EXASOL_USER", "sys")
EXASOL_PASSWORD = os.getenv("EXASOL_PASSWORD", "exasol")
EXASOL_SCHEMA = os.getenv("EXASOL_SCHEMA", "EXAGUARD")
EXASOL_ENCRYPTION = os.getenv("EXASOL_ENCRYPTION", "False").lower() in ("true", "1", "yes")

# Fallback mode: If Exasol Personal Docker/Cloud is not currently reachable,
# auto-switch to embedded high-performance in-memory simulation mode so judges can run zero-setup.
AUTO_FALLBACK_SQLITE = os.getenv("AUTO_FALLBACK_SQLITE", "True").lower() in ("true", "1", "yes")

# In Vercel / AWS Lambda environments, root filesystem is read-only; use /tmp for SQLite
if os.getenv("VERCEL"):
    SQLITE_DB_PATH = os.getenv("SQLITE_DB_PATH", "/tmp/exaguard_local.db")
else:
    SQLITE_DB_PATH = os.getenv("SQLITE_DB_PATH", os.path.join(os.path.dirname(os.path.abspath(__file__)), "exaguard_local.db"))

# Guardrail Detection Thresholds
MAX_PROMPT_TOKENS = int(os.getenv("MAX_PROMPT_TOKENS", "4096"))
MAX_COST_PER_CALL_USD = float(os.getenv("MAX_COST_PER_CALL_USD", "0.25"))
MAX_RECURSION_DEPTH = int(os.getenv("MAX_RECURSION_DEPTH", "5"))

# Application Metadata
APP_NAME = "ExaGuard AI"
APP_VERSION = "1.0.0"
APP_SUBTITLE = "Enterprise AI Agent Observability & Real-Time Governance Platform"
TRACK = "AI Trust, Safety & Governance"
POWERED_BY = "Exasol Personal (High-Performance In-Memory Columnar Database)"
