#!/bin/bash
# Start script for College Data modernized application
# Starts PostgreSQL (via docker-compose), backend, and frontend

set -e

echo "=== College Data - Modernized from AS/400 RPG ILE ==="
echo ""

# Check if docker is available
if command -v docker &> /dev/null; then
  echo "[1/4] Starting PostgreSQL via docker-compose..."
  docker compose up -d postgres 2>/dev/null || docker-compose up -d postgres
  echo "Waiting for PostgreSQL to be ready..."
  sleep 3
else
  echo "[1/4] Docker not found. Please ensure PostgreSQL is running on localhost:5432"
  echo "       Database: college_db, User: postgres, Password: postgres"
  echo "       Run: psql -U postgres -d college_db -f database/schema.sql"
  echo "       Run: psql -U postgres -d college_db -f database/seed.sql"
fi

echo ""
echo "[2/4] Installing backend dependencies..."
cd backend
npm install --silent
cd ..

echo ""
echo "[3/4] Installing frontend dependencies..."
cd frontend
npm install --silent
cd ..

echo ""
echo "[4/4] Starting servers..."
echo "  Backend:  http://localhost:3001"
echo "  Frontend: http://localhost:5173"
echo ""

# Start backend in background
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Start frontend
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "Press Ctrl+C to stop all servers"

# Trap Ctrl+C to kill both servers
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM

wait
