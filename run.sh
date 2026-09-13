#!/bin/bash
# ExaGuard AI - One-Click Launcher

echo "============================================================"
echo "🛡️  Starting ExaGuard AI - Enterprise AI Governance Platform"
echo "    Track: AI Trust, Safety & Governance (Exasol Hackathon)"
echo "============================================================"

# Ensure dependencies are installed
echo "📦 Verifying dependencies..."
pip install -r requirements.txt --quiet

# Launch Streamlit Command Center
echo "🚀 Launching ExaGuard Dashboard on http://localhost:8501 ..."
streamlit run dashboard/app.py
