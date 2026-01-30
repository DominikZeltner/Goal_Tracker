# Goal Tracker - Datenbank Restore Script
# Stellt ein Backup der SQLite-Datenbank wieder her

param(
    [Parameter(Mandatory=$false)]
    [string]$BackupFile
)

# Backup-Ordner prüfen
$backupDir = ".\backups"
if (-not (Test-Path $backupDir)) {
    Write-Host "❌ Backup-Ordner nicht gefunden: $backupDir" -ForegroundColor Red
    Write-Host "💡 Erstelle zuerst ein Backup mit: .\backup_database.ps1" -ForegroundColor Yellow
    exit 1
}

# Wenn keine Datei angegeben, zeige verfügbare Backups
if (-not $BackupFile) {
    Write-Host "📂 Verfügbare Backups:" -ForegroundColor Cyan
    Write-Host ""
    
    $backups = Get-ChildItem $backupDir -Filter "database_backup_*.db" | Sort-Object LastWriteTime -Descending
    
    if ($backups.Count -eq 0) {
        Write-Host "❌ Keine Backups gefunden!" -ForegroundColor Red
        Write-Host "💡 Erstelle zuerst ein Backup mit: .\backup_database.ps1" -ForegroundColor Yellow
        exit 1
    }
    
    for ($i = 0; $i -lt $backups.Count; $i++) {
        $backup = $backups[$i]
        $size = [math]::Round($backup.Length / 1KB, 2)
        $date = $backup.LastWriteTime.ToString("dd.MM.yyyy HH:mm")
        Write-Host "[$($i+1)] $($backup.Name) - $date - $size KB" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "💡 Verwendung: .\restore_database.ps1 -BackupFile '.\backups\database_backup_YYYY-MM-DD_HH-mm-ss.db'" -ForegroundColor Yellow
    Write-Host "💡 Oder wähle eine Nummer:" -ForegroundColor Yellow
    
    $selection = Read-Host "Backup-Nummer (1-$($backups.Count)) oder Enter zum Abbrechen"
    
    if ([string]::IsNullOrWhiteSpace($selection)) {
        Write-Host "Abgebrochen." -ForegroundColor Gray
        exit 0
    }
    
    $index = [int]$selection - 1
    if ($index -lt 0 -or $index -ge $backups.Count) {
        Write-Host "❌ Ungültige Auswahl!" -ForegroundColor Red
        exit 1
    }
    
    $BackupFile = $backups[$index].FullName
}

# Backup-Datei prüfen
if (-not (Test-Path $BackupFile)) {
    Write-Host "❌ Backup-Datei nicht gefunden: $BackupFile" -ForegroundColor Red
    exit 1
}

# Warnung anzeigen
Write-Host ""
Write-Host "⚠️  WARNUNG: Diese Aktion überschreibt die aktuelle Datenbank!" -ForegroundColor Yellow
Write-Host "⚠️  Alle aktuellen Ziele werden durch das Backup ersetzt!" -ForegroundColor Yellow
Write-Host ""
Write-Host "📁 Backup-Datei: $BackupFile" -ForegroundColor Cyan
Write-Host ""

$confirm = Read-Host "Möchtest du fortfahren? (ja/nein)"
if ($confirm -ne "ja") {
    Write-Host "Abgebrochen." -ForegroundColor Gray
    exit 0
}

# Container-Status prüfen
$containerRunning = docker ps --filter "name=goaltracker-backend-1" --format "{{.Names}}"

if (-not $containerRunning) {
    Write-Host "⚠️  Backend-Container läuft nicht!" -ForegroundColor Yellow
    Write-Host "Starte Container..." -ForegroundColor Yellow
    docker compose up -d backend
    Start-Sleep -Seconds 5
}

# Aktuelles Backup der aktuellen DB erstellen (Sicherheit!)
Write-Host "📦 Erstelle Sicherheits-Backup der aktuellen Datenbank..." -ForegroundColor Cyan
$safetyBackup = "$backupDir\safety_backup_before_restore_$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss').db"
docker cp goaltracker-backend-1:/app/data/database.db $safetyBackup
Write-Host "✅ Sicherheits-Backup erstellt: $safetyBackup" -ForegroundColor Green

# Container stoppen für Restore
Write-Host "🛑 Stoppe Backend-Container..." -ForegroundColor Yellow
docker compose stop backend

# Restore durchführen
Write-Host "📥 Stelle Backup wieder her..." -ForegroundColor Cyan
try {
    docker cp $BackupFile goaltracker-backend-1:/app/data/database.db
    Write-Host "✅ Backup wiederhergestellt!" -ForegroundColor Green
} catch {
    Write-Host "❌ Fehler beim Restore: $_" -ForegroundColor Red
    Write-Host "🔄 Stelle Sicherheits-Backup wieder her..." -ForegroundColor Yellow
    docker cp $safetyBackup goaltracker-backend-1:/app/data/database.db
    Write-Host "✅ Original-Datenbank wiederhergestellt" -ForegroundColor Green
    exit 1
}

# Container neu starten
Write-Host "🔄 Starte Backend-Container neu..." -ForegroundColor Cyan
docker compose start backend
Start-Sleep -Seconds 5

# Anzahl Ziele anzeigen
Write-Host "`n📋 Wiederhergestellt:" -ForegroundColor Cyan
$zielCount = docker compose exec -T backend python -c "import sqlite3; conn = sqlite3.connect('/app/data/database.db'); print(conn.execute('SELECT COUNT(*) FROM ziel').fetchone()[0]); conn.close()"
Write-Host "   $zielCount Ziele" -ForegroundColor White

Write-Host "`n✅ Restore abgeschlossen!" -ForegroundColor Green
Write-Host "💡 Öffne http://localhost:5173 oder http://localhost um die Ziele zu sehen" -ForegroundColor Cyan
