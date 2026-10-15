@echo off
title Vidyora Multimodal AI Engine (Track D)
color 0A
echo ====================================================================
echo             STARTING VIDYORA BACKEND & AI ORCHESTRATION
echo ====================================================================
cd /d C:\Users\utkar\.gemini\antigravity\scratch\vidyora\backend
python benchmark_eval.py
echo.
echo ====================================================================
echo Starting FastAPI Web Server at http://localhost:8000 ...
echo Browser me http://localhost:8000/docs open karke test karein!
echo ====================================================================
python -m uvicorn app.main:app --reload --port 8000
pause
