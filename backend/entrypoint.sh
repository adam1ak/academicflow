#!/bin/sh

set -e

python << 'EOF'
import os
import socket
import time
import sys
from urllib.parse import urlparse

db_url = os.getenv("DATABASE_URL", "postgresql://user:pass@db:5432/dbname")
try:
    parsed = urlparse(db_url)
    host = parsed.hostname or "db"
    port = parsed.port or 5432
except Exception:
    host = "db"
    port = 5432

print(f"Checking database availability at {host}:{port}")

retries = 30
while retries > 0:
    try:
        with socket.create_connection((host, port), timeout=2):
            print(f"Database port {host}:{port} is open and accepting connectivity")
            sys.exit(0)
    except OSError:
        print(f"Database initializing at {host}:{port}. Retrying... ({retries} left)")
        time.sleep(1)
        retries -= 1

print("Max retries reached. Attempting to proceed with application startup...")
sys.exit(0)
EOF

echo "Running database migrations via Alembic."
alembic upgrade head

PORT_TO_USE="${PORT:-8000}"
echo "Database is up to date. Starting Uvicorn production server on port ${PORT_TO_USE}."
exec uvicorn api:app --host 0.0.0.0 --port "${PORT_TO_USE}"