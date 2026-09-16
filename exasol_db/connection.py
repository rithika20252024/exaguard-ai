"""
ExaGuard AI - Exasol Connection Manager
Provides PyExasol connection handling, schema bootstrapping, and seamless fallback support.
"""

import os
import sys
import time
import sqlite3
import pandas as pd
from typing import Dict, Any, List, Optional
import config

try:
    import pyexasol
    HAS_PYEXASOL = True
except ImportError:
    HAS_PYEXASOL = False


class ExasolDBManager:
    """Manages connections to Exasol Personal or local embedded fallback."""

    def __init__(self):
        self.is_connected_to_exasol = False
        self.exasol_conn = None
        self.sqlite_conn = None
        self.db_engine_name = "Initializing..."
        self._init_connection()

    def _init_connection(self):
        """Attempt connection to Exasol Personal. Fallback gracefully if not available."""
        if HAS_PYEXASOL:
            try:
                self.exasol_conn = pyexasol.connect(
                    dsn=f"{config.EXASOL_HOST}:{config.EXASOL_PORT}",
                    user=config.EXASOL_USER,
                    password=config.EXASOL_PASSWORD,
                    schema=config.EXASOL_SCHEMA,
                    encryption=config.EXASOL_ENCRYPTION,
                    connection_timeout=3
                )
                self.is_connected_to_exasol = True
                self.db_engine_name = f"Exasol Personal (Native @ {config.EXASOL_HOST}:{config.EXASOL_PORT})"
                self._bootstrap_exasol_schema()
                return
            except Exception as e:
                print(f"[ExaGuard] Native Exasol connection failed ({e}). Switching to local embedded engine.")

        # Local Embedded Mode (for zero-dependency testing / instant evaluation)
        self.is_connected_to_exasol = False
        self.db_engine_name = "Exasol Simulator (Embedded Zero-Config Mode)"
        self._init_sqlite_fallback()

    def _bootstrap_exasol_schema(self):
        """Execute DDL on Exasol Personal."""
        schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")
        if os.path.exists(schema_path):
            with open(schema_path, "r") as f:
                ddl = f.read()
            for stmt in ddl.split(";"):
                stmt = stmt.strip()
                if stmt:
                    try:
                        self.exasol_conn.execute(stmt)
                    except Exception as e:
                        pass

    def _init_sqlite_fallback(self):
        """Initialize SQLite database with equivalent schema."""
        db_path = getattr(config, "SQLITE_DB_PATH", os.path.join(os.path.dirname(os.path.dirname(__file__)), "exaguard_local.db"))
        os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)
        self.sqlite_conn = sqlite3.connect(db_path, check_same_thread=False)
        cursor = self.sqlite_conn.cursor()

        cursor.executescript("""
        CREATE TABLE IF NOT EXISTS AGENT_TRACES (
            TRACE_ID TEXT PRIMARY KEY,
            SESSION_ID TEXT,
            AGENT_NAME TEXT,
            AGENT_ROLE TEXT,
            MODEL_NAME TEXT,
            PROMPT_TEXT TEXT,
            RESPONSE_TEXT TEXT,
            TOOL_NAME TEXT,
            TOOL_INPUT TEXT,
            TOOL_OUTPUT TEXT,
            INPUT_TOKENS INTEGER,
            OUTPUT_TOKENS INTEGER,
            TOTAL_TOKENS INTEGER,
            COST_USD REAL,
            LATENCY_MS REAL,
            STATUS TEXT,
            IS_SECURITY_RISK INTEGER,
            HAS_PII INTEGER,
            HAS_INJECTION INTEGER,
            CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS SECURITY_ALERTS (
            ALERT_ID TEXT PRIMARY KEY,
            TRACE_ID TEXT,
            AGENT_NAME TEXT,
            SEVERITY TEXT,
            THREAT_TYPE TEXT,
            DETAILS TEXT,
            REMEDIATION_ACTION TEXT,
            ALERT_TIMESTAMP TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS POLICY_RULES (
            POLICY_ID TEXT PRIMARY KEY,
            POLICY_NAME TEXT,
            TARGET_AGENT TEXT,
            RULE_TYPE TEXT,
            RULE_VALUE TEXT,
            ENFORCEMENT_MODE TEXT,
            IS_ACTIVE INTEGER DEFAULT 1,
            CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS AUDIT_LOGS (
            AUDIT_ID TEXT PRIMARY KEY,
            AUDIT_TYPE TEXT,
            COMPLIANCE_SCORE REAL,
            RISK_LEVEL TEXT,
            FINDINGS_SUMMARY TEXT,
            EVALUATED_TRACES INTEGER,
            AUDIT_TIMESTAMP TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)
        self.sqlite_conn.commit()

    def insert_trace(self, trace_data: Dict[str, Any]):
        """Insert a single agent trace into the database."""
        cols = [
            "TRACE_ID", "SESSION_ID", "AGENT_NAME", "AGENT_ROLE", "MODEL_NAME",
            "PROMPT_TEXT", "RESPONSE_TEXT", "TOOL_NAME", "TOOL_INPUT", "TOOL_OUTPUT",
            "INPUT_TOKENS", "OUTPUT_TOKENS", "TOTAL_TOKENS", "COST_USD", "LATENCY_MS",
            "STATUS", "IS_SECURITY_RISK", "HAS_PII", "HAS_INJECTION", "CREATED_AT"
        ]
        values = [trace_data.get(c) for c in cols]

        if self.is_connected_to_exasol:
            placeholders = ", ".join(["?" for _ in cols])
            query = f"INSERT INTO EXAGUARD.AGENT_TRACES ({', '.join(cols)}) VALUES ({placeholders})"
            self.exasol_conn.execute(query, values)
        else:
            placeholders = ", ".join(["?" for _ in cols])
            query = f"INSERT OR REPLACE INTO AGENT_TRACES ({', '.join(cols)}) VALUES ({placeholders})"
            cursor = self.sqlite_conn.cursor()
            # Convert booleans to int for sqlite
            vals_converted = [int(v) if isinstance(v, bool) else v for v in values]
            cursor.execute(query, vals_converted)
            self.sqlite_conn.commit()

    def insert_alert(self, alert_data: Dict[str, Any]):
        """Insert a security alert."""
        cols = ["ALERT_ID", "TRACE_ID", "AGENT_NAME", "SEVERITY", "THREAT_TYPE", "DETAILS", "REMEDIATION_ACTION", "ALERT_TIMESTAMP"]
        values = [alert_data.get(c) for c in cols]

        if self.is_connected_to_exasol:
            placeholders = ", ".join(["?" for _ in cols])
            query = f"INSERT INTO EXAGUARD.SECURITY_ALERTS ({', '.join(cols)}) VALUES ({placeholders})"
            self.exasol_conn.execute(query, values)
        else:
            placeholders = ", ".join(["?" for _ in cols])
            query = f"INSERT OR REPLACE INTO SECURITY_ALERTS ({', '.join(cols)}) VALUES ({placeholders})"
            cursor = self.sqlite_conn.cursor()
            cursor.execute(query, values)
            self.sqlite_conn.commit()

    def insert_batch_traces(self, traces_list: List[Dict[str, Any]]):
        """Batch insert traces for high-throughput performance demo."""
        if not traces_list:
            return

        cols = [
            "TRACE_ID", "SESSION_ID", "AGENT_NAME", "AGENT_ROLE", "MODEL_NAME",
            "PROMPT_TEXT", "RESPONSE_TEXT", "TOOL_NAME", "TOOL_INPUT", "TOOL_OUTPUT",
            "INPUT_TOKENS", "OUTPUT_TOKENS", "TOTAL_TOKENS", "COST_USD", "LATENCY_MS",
            "STATUS", "IS_SECURITY_RISK", "HAS_PII", "HAS_INJECTION", "CREATED_AT"
        ]

        if self.is_connected_to_exasol:
            rows = [[t.get(c) for c in cols] for t in traces_list]
            self.exasol_conn.import_from_iterable(rows, table="EXAGUARD.AGENT_TRACES")
        else:
            cursor = self.sqlite_conn.cursor()
            placeholders = ", ".join(["?" for _ in cols])
            query = f"INSERT OR REPLACE INTO AGENT_TRACES ({', '.join(cols)}) VALUES ({placeholders})"
            rows = [[int(t.get(c)) if isinstance(t.get(c), bool) else t.get(c) for c in cols] for t in traces_list]
            cursor.executemany(query, rows)
            self.sqlite_conn.commit()

    def execute_query(self, query: str) -> pd.DataFrame:
        """Execute analytical query and return pandas DataFrame with execution timing."""
        start_time = time.perf_counter()

        if self.is_connected_to_exasol:
            stmt = self.exasol_conn.execute(query)
            df = stmt.fetch_dataframe()
        else:
            df = pd.read_sql_query(query, self.sqlite_conn)

        # Normalize all column names to lowercase for consistent cross-database compatibility
        if not df.empty and df.columns is not None:
            df.columns = [str(c).lower() for c in df.columns]

        elapsed_ms = (time.perf_counter() - start_time) * 1000
        df.attrs["elapsed_ms"] = elapsed_ms
        return df


# Singleton instance
db_manager = ExasolDBManager()
