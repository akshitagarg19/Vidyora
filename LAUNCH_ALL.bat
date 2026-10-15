@echo off
title Vidyora Multimodal AI Ecosystem (Combined Full-Stack)
color 0B
echo ====================================================================
echo             STARTING VIDYORA FULL-STACK AI COMPANION
echo ====================================================================
echo.
echo [1/2] Launching Backend Engine (FastAPI + Live RAG + BKT)...
start "Vidyora Backend API" cmd /k "cd /d C:\Users\utkar\.gemini\antigravity\scratch\vidyora\backend && python -m uvicorn app.main:app --reload --port 8000"

echo [2/2] Launching Frontend Cockpit UI (StudyMate)...
start "Vidyora Frontend UI" cmd /k "cd /d C:\Users\utkar\.gemini\antigravity\scratch\vidyora\studymate && npm run dev"

echo.
echo ====================================================================
echo Both Servers are launching in separate windows!
echo - Frontend UI:  http://localhost:5173 (or port shown in Frontend window)
echo - Backend API:  http://localhost:8000/docs
echo ====================================================================
echo.
echo Opening browser in 5 seconds...
timeout /t 5 >nul
start http://localhost:5173
start http://localhost:8000/docs
pause
