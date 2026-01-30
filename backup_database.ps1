# Goal Tracker - Datenbank Backup Script
# Erstellt ein Backup der SQLite-Datenbank aus dem Docker-Container

# Backup-Ordner erstellen (falls nicht vorhanden)
$backupDir = ".\backups"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
    Write-Host "Backup-Ordner erstellt: $backupDir" -ForegroundColor Green
}

# Datum für Backup-Dateiname
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFile = "$backupDir\database_backup_$timestamp.db"

# Container-Status prüfen
$containerRunning = docker ps --filter "name=goaltracker-backend-1" --format "{{.Names}}"

if (-not $containerRunning) {
    Write-Host "Backend-Container läuft nicht!" -ForegroundColor Yellow
    Write-Host "Starte Container..." -ForegroundColor Yellow
    docker compose up -d backend
    Start-Sleep -Seconds 5
}

# Backup erstellen
Write-Host "Erstelle Backup..." -ForegroundColor Cyan
try {
    docker cp goaltracker-backend-1:/app/data/database.db $backupFile
    
    # Backup-Größe anzeigen
    $fileSize = (Get-Item $backupFile).Length / 1KB
    
    Write-Host "Backup erfolgreich erstellt!" -ForegroundColor Green
    Write-Host "Datei: $backupFile" -ForegroundColor Green
    Write-Host "Groesse: $([math]::Round($fileSize, 2)) KB" -ForegroundColor Green
    
    # Anzahl Ziele im Backup anzeigen (optional)
    Write-Host "`nInhalt:" -ForegroundColor Cyan
    $zielCount = docker compose exec -T backend python -c "import sqlite3; conn = sqlite3.connect('/app/data/database.db'); print(conn.execute('SELECT COUNT(*) FROM ziel').fetchone()[0]); conn.close()"
    Write-Host "   $zielCount Ziele gesichert" -ForegroundColor White
    
} catch {
    Write-Host "Fehler beim Backup: $_" -ForegroundColor Red
    exit 1
}

# Alte Backups aufräumen (älter als 30 Tage)
Write-Host "`nRaeume alte Backups auf..." -ForegroundColor Yellow
$oldBackups = Get-ChildItem $backupDir -Filter "database_backup_*.db" | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) }
if ($oldBackups.Count -gt 0) {
    $oldBackups | Remove-Item -Force
    Write-Host "   $($oldBackups.Count) alte Backup(s) gelöscht (älter als 30 Tage)" -ForegroundColor Gray
} else {
    Write-Host "   Keine alten Backups zum Löschen" -ForegroundColor Gray
}

Write-Host "`nBackup abgeschlossen!" -ForegroundColor Green
Write-Host "Tipp: Kopiere das Backup auf einen USB-Stick oder Cloud-Storage" -ForegroundColor Cyan
