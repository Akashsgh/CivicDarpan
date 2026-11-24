@echo off
echo ========================================================
echo         CivicLens - Municipal Grievance Platform
echo               Academic Major Project Launcher
echo ========================================================
echo.

echo [1/3] Starting Python FastAPI ML Service (Port 8000)...
start "CivicLens ML Service" cmd /k "cd ml-service && python -m uvicorn app:app --host 127.0.0.1 --port 8000"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Express.js Backend API (Port 5000)...
start "CivicLens Backend API" cmd /k "cd server && node server.js"

timeout /t 3 /nobreak >nul

echo [3/3] Starting React Vite Frontend (Port 5173)...
start "CivicLens Frontend" cmd /k "cd client && npm run dev"

echo.
echo All services launched!
echo Access the application at: http://localhost:5173
echo.
pause
