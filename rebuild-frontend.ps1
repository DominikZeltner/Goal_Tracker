#!/usr/bin/env pwsh
# Schneller Frontend-Rebuild für Development

Write-Host "🔨 Building Frontend..." -ForegroundColor Cyan
docker compose build frontend

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build erfolgreich!" -ForegroundColor Green
    Write-Host "🔄 Restarting Frontend..." -ForegroundColor Cyan
    docker compose restart frontend
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Frontend neu gestartet!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🌐 Öffne http://localhost im Browser" -ForegroundColor Yellow
        Write-Host "   und mache einen Hard Refresh (Ctrl + Shift + R)" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Build fehlgeschlagen!" -ForegroundColor Red
}
