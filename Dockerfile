# Multi-stage lightweight deployment container for ExaGuard AI
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy full application
COPY . .


#Expose React + FastAPI application port

EXPOSE 8000

HEALTHCHECK CMD curl --fail http://localhost:8000/api/health || exit 1

ENTRYPOINT ["uvicorn", "backend.server:app", "--host", "0.0.0.0", "--port", "8000"]
