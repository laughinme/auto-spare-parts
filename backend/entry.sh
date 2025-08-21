#!/usr/bin/env bash
set -e

cd src

echo "Running Alembic migrations..."
alembic upgrade head

echo "Running database seeding..."
python scripts/auto_seed.py

echo "Starting the application..."
uvicorn main:app --host '0.0.0.0' --port 8080
