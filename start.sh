#!/usr/bin/env bash
set -e

echo "━━━ Agentic Community — Starting Frontend + Backend ━━━"
echo ""

# Backend
echo "→ Starting backend (port 8000)..."
cd backend
if [ ! -d "venv" ]; then
  python3 -m venv venv
fi
source venv/bin/activate
pip install -q -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

sleep 2

# Frontend
echo "→ Starting frontend (port 5173)..."
npm install --silent
npm run dev &
FRONTEND_PID=$!

echo ""
echo "━━━ Both running ━━━"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8000"
echo "  API docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait