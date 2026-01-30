#!/usr/bin/env pwsh
# Schneller Frontend-Rebuild für Development

Write-Host "Building Frontend (no cache)..." -ForegroundColor Cyan
docker compose build --no-cache frontend

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build erfolgreich!" -ForegroundColor Green
    Write-Host "Recreating Frontend container..." -ForegroundColor Cyan
    docker compose up -d --force-recreate frontend
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Frontend neu erstellt und gestartet!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Oeffne http://localhost im Browser" -ForegroundColor Yellow
        Write-Host "   und mache einen Hard Refresh (Ctrl + Shift + R)" -ForegroundColor Yellow
    }
} else {
    Write-Host "Build fehlgeschlagen!" -ForegroundColor Red
}
