# 📍 Datenbank-Speicherort - Goal Tracker

## Wo liegen meine Ziel-Daten?

### ✅ **Sicher im Docker Volume gespeichert!**

Deine Ziele und alle Daten sind in einem **Docker Volume** gespeichert:

```
Volume-Name: goaltracker_backend_data
Physischer Pfad: /var/lib/docker/volumes/goaltracker_backend_data/_data
Im Container: /app/data/database.db
```

---

## 🔒 Sind meine Daten auf GitHub?

### ❌ **NEIN - und das ist gut so!**

**Warum nicht?**
- Datenbank-Dateien (`.db`, `.sqlite`) sind in `.gitignore`
- Nur der Code wird auf GitHub gespeichert
- Deine persönlichen Ziele bleiben privat auf deinem PC

**Was ist auf GitHub?**
- ✅ Code (Frontend/Backend)
- ✅ Konfigurationsdateien
- ✅ Dokumentation
- ❌ KEINE Datenbank
- ❌ KEINE persönlichen Daten

---

## 📊 Wie kann ich meine Daten sehen?

### Option 1: Im Browser (einfachste Methode)

1. Starte Development oder Production:
   ```bash
   docker compose -f docker-compose.dev.yml up
   # ODER
   docker compose up -d
   ```

2. Öffne im Browser:
   ```
   http://localhost:5173  (Development)
   # ODER
   http://localhost       (Production)
   ```

3. Alle deine Ziele sind sichtbar! ✅

---

### Option 2: API direkt abfragen

```bash
# Backend muss laufen
curl http://localhost:8000/ziele

# ODER im Browser:
http://localhost:8000/ziele
```

---

### Option 3: Datenbank direkt im Container prüfen

```bash
# Container muss laufen
docker compose exec backend python -c "
import sqlite3
conn = sqlite3.connect('/app/data/database.db')
cursor = conn.cursor()
cursor.execute('SELECT id, titel, status FROM ziel')
for row in cursor.fetchall():
    print(f'ID: {row[0]}, Titel: {row[1]}, Status: {row[2]}')
conn.close()
"
```

---

## 💾 Backup erstellen

### Datenbank-Backup manuell erstellen:

```bash
# 1. Container muss laufen
docker compose up -d

# 2. Datenbank aus Container kopieren
docker cp goaltracker-backend-1:/app/data/database.db ./backup_database.db

# 3. Backup-Datei liegt jetzt in deinem Projekt-Ordner
```

**Tipp:** Speichere Backups außerhalb des Git-Repositories (z.B. auf OneDrive, USB-Stick)

---

### Datenbank-Backup wiederherstellen:

```bash
# 1. Container stoppen
docker compose down

# 2. Backup-Datei in Container kopieren
docker compose up -d
docker cp ./backup_database.db goaltracker-backend-1:/app/data/database.db

# 3. Container neu starten
docker compose restart backend
```

---

## 🔄 Was passiert bei...?

### **Git Pull / Code-Update:**
- ✅ Code wird aktualisiert
- ✅ Datenbank bleibt unverändert
- ✅ Deine Ziele bleiben erhalten

### **Docker Rebuild:**
```bash
docker compose build --no-cache
```
- ✅ Code wird neu gebaut
- ✅ Datenbank bleibt unverändert (im Volume)
- ✅ Deine Ziele bleiben erhalten

### **Docker Down:**
```bash
docker compose down
```
- ✅ Container werden gestoppt und gelöscht
- ✅ **Volume bleibt bestehen** (Datenbank sicher!)
- ✅ Deine Ziele bleiben erhalten

### **Docker Down mit Volume-Löschen (⚠️ ACHTUNG!):**
```bash
docker compose down -v  # ⚠️ Löscht auch das Volume!
```
- ❌ Container werden gelöscht
- ❌ **Volume wird gelöscht**
- ❌ **ALLE Ziele sind WEG!**
- ⚠️ **NUR VERWENDEN WENN DU ALLES LÖSCHEN WILLST!**

---

## 📂 Volume-Management

### Alle Volumes anzeigen:
```bash
docker volume ls
```

### Dein Goal-Tracker Volume:
```bash
docker volume inspect goaltracker_backend_data
```

### Volume-Größe prüfen:
```bash
docker system df -v | findstr goaltracker
```

### Datenbank-Datei im Volume ansehen:
```bash
docker run --rm -v goaltracker_backend_data:/data alpine ls -lh /data
```

---

## 🛡️ Datensicherheit

### ✅ **Deine Daten sind sicher, wenn:**
- Docker läuft normal
- Du `docker compose down` verwendest (OHNE `-v`)
- Du den Computer neu startest
- Du das Projekt mit Git pulled/pushed

### ⚠️ **Deine Daten sind in Gefahr, wenn:**
- Du `docker compose down -v` verwendest
- Du `docker volume rm goaltracker_backend_data` ausführst
- Du Docker komplett deinstallierst (OHNE Volume-Backup)
- Deine Festplatte kaputtgeht (OHNE externes Backup)

---

## 💡 Best Practices

### 1. **Regelmäßige Backups:**
```bash
# Automatisches Backup-Script (Windows PowerShell)
$date = Get-Date -Format "yyyy-MM-dd_HH-mm"
docker cp goaltracker-backend-1:/app/data/database.db "backup_$date.db"
```

### 2. **Vor großen Änderungen:**
Erstelle immer ein Backup, bevor du:
- Großes Code-Update machst
- Datenbank-Migrationen durchführst
- Docker komplett neu aufsetzt

### 3. **Cloud-Backup:**
Kopiere wichtige Backups auf:
- OneDrive
- Google Drive
- USB-Stick
- NAS

---

## 🔍 Zusammenfassung

| Frage | Antwort |
|-------|---------|
| **Wo sind meine Daten?** | Docker Volume `goaltracker_backend_data` |
| **Sind sie auf GitHub?** | ❌ Nein, nur Code ist auf GitHub |
| **Sind sie sicher?** | ✅ Ja, solange du kein `-v` bei `down` verwendest |
| **Kann ich Backups machen?** | ✅ Ja, siehe oben |
| **Gehen Daten bei Rebuild verloren?** | ❌ Nein, Volume bleibt bestehen |
| **Gehen Daten bei Neustart verloren?** | ❌ Nein, Volume ist persistent |

---

## 📞 Hilfe

**Problem:** "Meine Ziele sind weg!"

**Lösung:**
1. Prüfe, ob das Volume noch existiert:
   ```bash
   docker volume ls | findstr goaltracker
   ```

2. Falls ja, starte Container neu:
   ```bash
   docker compose up -d
   ```

3. Falls nein, restore aus Backup:
   ```bash
   docker cp ./backup_database.db goaltracker-backend-1:/app/data/database.db
   ```

---

**Deine Daten sind sicher im Docker Volume und NICHT auf GitHub!** 🔒✅
