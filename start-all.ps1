# CivicLens - Complete Project Runner PowerShell Script
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       CivicLens - Municipal Grievance Platform          " -ForegroundColor Cyan
Write-Host "          Academic Major Project Startup Script          " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$root = $PSScriptRoot

Write-Host "`n[1/3] Starting Python FastAPI ML Service (Port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\ml-service'; python -m uvicorn app:app --host 127.0.0.1 --port 8000"

Start-Sleep -Seconds 3

Write-Host "[2/3] Starting Express.js Backend API (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\server'; node server.js"

Start-Sleep -Seconds 3

Write-Host "[3/3] Starting React Vite Frontend (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\client'; npm run dev"

Write-Host "`nAll CivicLens services launched successfully!" -ForegroundColor Green
Write-Host "Access the application at: http://localhost:5173" -ForegroundColor Cyan
