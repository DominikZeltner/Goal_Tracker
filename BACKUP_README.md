# 💾 Datenbank Backup & Restore

Einfache Scripts zum Sichern und Wiederherstellen deiner Goal-Tracker Datenbank.

---

## 🚀 Schnellstart

### Backup erstellen

```powershell
.\backup_database.ps1
```

**Das passiert:**
- ✅ Erstellt ein Backup der aktuellen Datenbank
- ✅ Speichert es in `.\backups\database_backup_YYYY-MM-DD_HH-mm-ss.db`
- ✅ Zeigt Anzahl der gesicherten Ziele
- ✅ Löscht alte Backups (älter als 30 Tage)

---

### Backup wiederherstellen

```powershell
.\restore_database.ps1
```

**Das passiert:**
- 📂 Zeigt alle verfügbaren Backups
- ⚠️ Warnung: Aktuelle Daten werden überschrieben
- 🔒 Erstellt Sicherheits-Backup der aktuellen DB
- ✅ Stellt gewähltes Backup wieder her

---

## 📋 Beispiel-Workflow

### Tägliches Backup

```powershell
# Einfach ausführen - fertig!
.\backup_database.ps1
```

**Output:**
```
✅ Backup-Ordner erstellt: .\backups
📦 Erstelle Backup...
✅ Backup erfolgreich erstellt!
📁 Datei: .\backups\database_backup_2026-01-30_18-30-45.db
📊 Größe: 28.5 KB

📋 Inhalt:
   3 Ziele gesichert

🧹 Räume alte Backups auf...
   Keine alten Backups zum Löschen

✅ Backup abgeschlossen!
💡 Tipp: Kopiere das Backup auf einen USB-Stick oder Cloud-Storage
```

---

### Backup wiederherstellen

```powershell
.\restore_database.ps1
```

**Output:**
```
📂 Verfügbare Backups:

[1] database_backup_2026-01-30_18-30-45.db - 30.01.2026 18:30 - 28.5 KB
[2] database_backup_2026-01-29_20-15-30.db - 29.01.2026 20:15 - 25.2 KB
[3] database_backup_2026-01-28_19-00-00.db - 28.01.2026 19:00 - 22.8 KB

💡 Verwendung: .\restore_database.ps1 -BackupFile '.\backups\database_backup_YYYY-MM-DD_HH-mm-ss.db'
💡 Oder wähle eine Nummer:
Backup-Nummer (1-3) oder Enter zum Abbrechen: 1

⚠️  WARNUNG: Diese Aktion überschreibt die aktuelle Datenbank!
⚠️  Alle aktuellen Ziele werden durch das Backup ersetzt!

📁 Backup-Datei: .\backups\database_backup_2026-01-30_18-30-45.db

Möchtest du fortfahren? (ja/nein): ja

📦 Erstelle Sicherheits-Backup der aktuellen Datenbank...
✅ Sicherheits-Backup erstellt: .\backups\safety_backup_before_restore_2026-01-30_18-35-00.db
🛑 Stoppe Backend-Container...
📥 Stelle Backup wieder her...
✅ Backup wiederhergestellt!
🔄 Starte Backend-Container neu...

📋 Wiederhergestellt:
   3 Ziele

✅ Restore abgeschlossen!
💡 Öffne http://localhost:5173 oder http://localhost um die Ziele zu sehen
```

---

## 🛡️ Sicherheits-Features

### Automatisches Sicherheits-Backup

**Beim Restore:** Wird automatisch ein Sicherheits-Backup der aktuellen DB erstellt!

Falls etwas schiefgeht:
```powershell
# Sicherheits-Backup liegt in:
.\backups\safety_backup_before_restore_YYYY-MM-DD_HH-mm-ss.db

# Kann manuell wiederhergestellt werden
```

---

### Alte Backups werden automatisch gelöscht

**Regel:** Backups älter als 30 Tage werden automatisch entfernt

**Warum?**
- Spart Speicherplatz
- Nur relevante Backups bleiben
- Manuelle Backups bleiben (wenn woanders gespeichert)

---

## 💡 Best Practices

### 1. Regelmäßige Backups

**Empfehlung:** Täglich oder vor wichtigen Änderungen

```powershell
# Vor großem Update
.\backup_database.ps1

# Dann: Update durchführen
```

---

### 2. Externe Sicherung

**Wichtig:** Kopiere wichtige Backups außerhalb des Projekts!

**Optionen:**
- USB-Stick
- OneDrive / Google Drive / Dropbox
- Externe Festplatte
- NAS

**Warum?**
- Schutz vor Festplattenausfall
- Schutz vor versehentlichem Löschen
- Backup bei System-Neuinstallation

---

### 3. Backup nach Meilensteinen

**Gute Zeiten für Backup:**
- Nach Erreichen eines großen Ziels
- Nach wichtigen Projekt-Updates
- Vor dem Löschen vieler Ziele
- Ende des Monats / Quartals

---

## 📂 Backup-Struktur

```
Goal Tracker/
├── backups/                                    ← Backup-Ordner
│   ├── database_backup_2026-01-30_18-30-45.db ← Reguläres Backup
│   ├── database_backup_2026-01-29_20-15-30.db
│   ├── safety_backup_before_restore_...db     ← Automatisches Sicherheits-Backup
│   └── ...
├── backup_database.ps1                         ← Backup-Script
├── restore_database.ps1                        ← Restore-Script
└── BACKUP_README.md                            ← Diese Datei
```

---

## 🔧 Erweiterte Nutzung

### Backup mit spezifischem Namen

```powershell
# Backup erstellen
.\backup_database.ps1

# Umbenennen für bessere Übersicht
cd backups
ren database_backup_2026-01-30_18-30-45.db "Backup_Nach_Phase9_Sprint1.db"
```

---

### Backup direkt an bestimmten Ort

```powershell
# Backup erstellen
.\backup_database.ps1

# Sofort kopieren
Copy-Item ".\backups\database_backup_*.db" "D:\Meine_Backups\GoalTracker\" -Force
```

---

### Manuelles Backup (ohne Script)

```powershell
# Container muss laufen
docker compose up -d backend

# Datenbank kopieren
docker cp goaltracker-backend-1:/app/data/database.db ./manual_backup.db
```

---

## ❓ Troubleshooting

### Problem: "Container läuft nicht"

**Lösung:**
```powershell
# Starte Container manuell
docker compose up -d backend

# Dann: Script erneut ausführen
.\backup_database.ps1
```

---

### Problem: "Backup-Ordner nicht gefunden"

**Lösung:**
- Script erstellt den Ordner automatisch beim ersten Backup
- Falls manuell gelöscht: Einfach `.\backup_database.ps1` ausführen

---

### Problem: "Keine Backups verfügbar"

**Lösung:**
```powershell
# Erstelle erst ein Backup
.\backup_database.ps1

# Dann: Restore möglich
.\restore_database.ps1
```

---

### Problem: "Restore funktioniert nicht"

**Lösung:**
1. Container stoppen:
   ```powershell
   docker compose down
   ```

2. Container neu starten:
   ```powershell
   docker compose up -d
   ```

3. Restore erneut versuchen:
   ```powershell
   .\restore_database.ps1
   ```

---

## 📊 Backup-Größen

**Typische Größen:**
- Leere Datenbank: ~4 KB
- 10 Ziele: ~8 KB
- 100 Ziele: ~50 KB
- 1000 Ziele: ~500 KB

**Speicherplatz:** Selbst 100 Backups nehmen nur wenige MB!

---

## 🔒 Sicherheit

### Was ist im Backup?

- ✅ Alle Ziele (Titel, Beschreibung, Daten, Status)
- ✅ Beziehungen (Parent-Child)
- ❌ KEINE Passwörter (keine Login-Funktionalität)
- ❌ KEINE Benutzer-Authentifizierung

### Backup-Schutz

**Empfehlung:** Speichere Backups an sicheren Orten
- Nicht öffentlich teilen
- Bei Cloud-Speicherung: Verschlüsselung aktivieren
- USB-Sticks sicher aufbewahren

---

## 🎯 Zusammenfassung

| Aktion | Befehl | Dauer |
|--------|--------|-------|
| **Backup erstellen** | `.\backup_database.ps1` | ~2 Sekunden |
| **Backup wiederherstellen** | `.\restore_database.ps1` | ~5 Sekunden |
| **Alle Backups ansehen** | `.\restore_database.ps1` → Enter | sofort |

---

**Deine Daten sind sicher mit regelmäßigen Backups!** 💾✅
