# 🎯 Command Cheatsheet - Goal Tracker

Alle wichtigen Befehle auf einen Blick!

---

## 🔥 Die wichtigsten Befehle

### Development-Server (mit Hot Reload)

```bash
# Starten
docker compose -f docker-compose.dev.yml up

# Im Hintergrund starten
docker compose -f docker-compose.dev.yml up -d

# Stoppen
docker compose -f docker-compose.dev.yml down

# Logs ansehen
docker compose -f docker-compose.dev.yml logs -f

# Nur Backend-Logs
docker compose -f docker-compose.dev.yml logs -f backend

# Nur Frontend-Logs
docker compose -f docker-compose.dev.yml logs -f frontend

# Neustart
docker compose -f docker-compose.dev.yml restart
```

---

### Production-Server (optimiert)

```bash
# Bauen (neu)
docker compose build --no-cache

# Starten
docker compose up -d

# Stoppen
docker compose down

# Logs ansehen
docker compose logs -f

# Neustart
docker compose restart
```

---

## 🔄 Workflow

### Typischer Development-Tag

```bash
# 1. Morning: Development starten
cd "c:\_work\Goal Tracker"
docker compose -f docker-compose.dev.yml up

# 2. Code editieren in VSCode/Cursor
#    → Änderungen automatisch geladen!

# 3. Testen im Browser: http://localhost:5173

# 4. Abends: Server stoppen
Strg + C
```

---

### Vor Git Commit

```bash
# 1. Development stoppen
docker compose -f docker-compose.dev.yml down

# 2. Production bauen und testen
docker compose build --no-cache
docker compose up -d

# 3. Testen: http://localhost

# 4. Alles OK? Commit
git add .
git commit -m "feat: neue Features"
git push

# 5. Production stoppen, zurück zu Development
docker compose down
docker compose -f docker-compose.dev.yml up
```

---

## 🆘 Troubleshooting

### Port bereits belegt

```bash
# Development
docker compose -f docker-compose.dev.yml down

# Production
docker compose down
```

### Container hängt

```bash
# Development neu starten
docker compose -f docker-compose.dev.yml restart

# Production neu starten
docker compose restart
```

### Alles löschen und neu anfangen

```bash
# ACHTUNG: Löscht auch die Datenbank!
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml build --no-cache
docker compose -f docker-compose.dev.yml up
```

### Neue Dependencies installiert

```bash
# Frontend: package.json geändert
docker compose -f docker-compose.dev.yml exec frontend npm install

# Backend: requirements.txt geändert
docker compose -f docker-compose.dev.yml exec backend pip install -r requirements.txt

# Oder: Komplett neu bauen
docker compose -f docker-compose.dev.yml build --no-cache
```

---

## 📦 Container-Management

### Container-Status prüfen

```bash
docker compose -f docker-compose.dev.yml ps
```

### In Container einsteigen

```bash
# Frontend
docker compose -f docker-compose.dev.yml exec frontend sh

# Backend
docker compose -f docker-compose.dev.yml exec backend bash
```

### Datenbank im Container prüfen

```bash
docker compose -f docker-compose.dev.yml exec backend python -c "
from database import SessionLocal
from models import Ziel
db = SessionLocal()
ziele = db.query(Ziel).all()
print(f'Anzahl Ziele: {len(ziele)}')
for z in ziele:
    print(f'- {z.titel} ({z.status})')
"
```

---

## 🌐 URLs

### Development
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Production
- Frontend: http://localhost
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 📂 Wichtige Dateien

| Datei | Beschreibung |
|-------|--------------|
| `docker-compose.dev.yml` | Development-Konfiguration (Hot Reload) |
| `docker-compose.yml` | Production-Konfiguration |
| `DEV_SETUP.md` | Vollständige Development-Anleitung |
| `DEV_QUICKSTART.md` | Quick-Start Guide |
| `COMMANDS_CHEATSHEET.md` | Diese Datei (Befehls-Übersicht) |

---

## 💡 Pro-Tipps

### Alias erstellen (PowerShell)

Füge in deine PowerShell-Profil ein (`notepad $PROFILE`):

```powershell
# Goal Tracker Aliases
function gtdev { docker compose -f docker-compose.dev.yml up }
function gtstop { docker compose -f docker-compose.dev.yml down }
function gtlogs { docker compose -f docker-compose.dev.yml logs -f }
function gtprod { docker compose up -d }
```

Dann kannst du einfach tippen:
```bash
gtdev   # Development starten
gtstop  # Development stoppen
gtlogs  # Logs ansehen
gtprod  # Production starten
```

---

## 📊 Quick Reference

```bash
# Development
docker compose -f docker-compose.dev.yml up    # Starten
docker compose -f docker-compose.dev.yml down  # Stoppen

# Production
docker compose build --no-cache                # Bauen
docker compose up -d                          # Starten
docker compose down                           # Stoppen

# Logs
docker compose -f docker-compose.dev.yml logs -f     # Dev
docker compose logs -f                               # Prod
```

---

**Tipp:** Setze ein Lesezeichen auf diese Datei! 📌
