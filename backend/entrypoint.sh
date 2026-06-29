#!/bin/sh

set -e

echo "Checking database availability (db:5432)"

python << 'EOF'
import socket
import time
import sys

port = 5432
host = 'db'

while True:
    try:
        with socket.create_connection((host, port), timeout=1):
            print("=Database port is open and accepting connectivity")
            sys.exit(0)
    except OSError:
        print("Database is initializing. Retrying in 1 second.")
        time.sleep(1)
EOF

echo "Running database migrations via Alembic."
alembic upgrade head

echo "Database is up to date. Starting Uvicorn production server."
exec uvicorn api:app --host 0.0.0.0 --port 8000