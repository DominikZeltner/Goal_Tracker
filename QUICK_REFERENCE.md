# Quick Reference - Häufige Befehle

Schnelle Übersicht der wichtigsten Befehle für den Goal Tracker.

## 🚀 Deployment

### Erstmaliges Deployment

```bash
# Server vorbereiten
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER

# Projekt klonen
sudo mkdir -p /opt/goaltracker
sudo chown $USER:$USER /opt/goaltracker
cd /opt/goaltracker
git clone https://github.com/DominikZeltner/Goal_Tracker.git .

# Konfigurieren
nano .env  # VITE_API_URL setzen
nano backend/main.py  # CORS anpassen

# Starten
docker compose up -d
```

### Updates einspielen

```bash
cd /opt/goaltracker
git pull origin main
docker compose down
docker compose build --no-cache
docker compose up -d
```

## 🐳 Docker-Befehle

### Container-Management

```bash
# Starten
docker compose up -d

# Stoppen
docker compose down

# Neu starten
docker compose restart

# Status
docker compose ps

# Einzelner Service neu starten
docker compose restart backend
docker compose restart frontend
```

### Logs

```bash
# Alle Logs
docker compose logs

# Live-Logs
docker compose logs -f

# Bestimmter Service
docker compose logs backend
docker compose logs frontend

# Letzte 100 Zeilen
docker compose logs --tail=100
```

### Build

```bash
# Alles neu bauen
docker compose build

# Ohne Cache (sauberer Build)
docker compose build --no-cache

# Nur ein Service
docker compose build backend
docker compose build frontend

# Mit Umgebungsvariable
export VITE_API_URL=https://api.yourdomain.com
docker compose build frontend
```

## 🗄️ Datenbank

### Backup

```bash
# Manuelles Backup
docker compose exec backend cat /app/data/database.db > backup-$(date +%Y%m%d).db

# An sicheren Ort kopieren
cp backup-*.db ~/backups/
```

### Restore

```bash
# Backup einspielen
docker compose exec -T backend sh -c 'cat > /app/data/database.db' < backup-20260129.db

# Container neu starten
docker compose restart backend
```

### Datenbank-Info

```bash
# Volume-Inhalt anzeigen
docker compose exec backend ls -la /app/data/

# Datenbank-Größe
docker compose exec backend du -h /app/data/database.db

# Volume inspizieren
docker volume inspect goaltracker_backend_data
```

## 🔍 Monitoring & Debugging

### Health-Checks

```bash
# Backend
curl http://localhost:8000/health

# Frontend
curl http://localhost/

# Mit HTTPS
curl https://api.yourdomain.com/health
```

### System-Ressourcen

```bash
# Container-Ressourcen live
docker stats

# Disk-Usage
docker system df
df -h

# Container-Prozesse
docker compose top
```

### In Container einsteigen

```bash
# Backend-Container
docker compose exec backend /bin/sh

# Frontend-Container
docker compose exec frontend /bin/sh

# Als Root
docker compose exec -u root backend /bin/sh
```

## 🔒 HTTPS & Nginx

### Certbot (Let's Encrypt)

```bash
# Zertifikat holen
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# Renewal testen
sudo certbot renew --dry-run

# Manuell erneuern
sudo certbot renew

# Zertifikat-Info
sudo certbot certificates
```

### Nginx

```bash
# Status
sudo systemctl status nginx

# Neu starten
sudo systemctl restart nginx

# Neu laden (ohne Verbindungsabbruch)
sudo systemctl reload nginx

# Konfiguration testen
sudo nginx -t

# Logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## 🧹 Aufräumen

### Docker aufräumen

```bash
# Alte Images löschen
docker image prune -f

# Alte Container löschen
docker container prune -f

# Alles ungenutzte löschen
docker system prune -a -f

# Volumes auch löschen (ACHTUNG: Datenverlust!)
docker system prune -a -f --volumes
```

### Logs rotieren

```bash
# Docker-Logs begrenzen
docker compose logs --tail=1000 > saved-logs.txt
docker compose down
docker compose up -d
```

## 🔧 Konfiguration

### Umgebungsvariablen ändern

```bash
# .env bearbeiten
nano /opt/goaltracker/.env

# Container neu bauen (für VITE_API_URL)
export VITE_API_URL=https://api.newdomain.com
docker compose build --no-cache frontend
docker compose up -d

# Nur neu starten (für DB_PATH)
docker compose restart
```

### CORS ändern

```bash
# backend/main.py bearbeiten
nano /opt/goaltracker/backend/main.py

# Nur Backend neu starten
docker compose restart backend
```

## 📊 Git-Befehle

### Updates holen

```bash
cd /opt/goaltracker

# Aktuellen Stand prüfen
git status
git log --oneline -5

# Updates holen
git fetch origin
git pull origin main

# Bestimmten Branch
git pull origin feat/new-feature
```

### Branch wechseln

```bash
# Zu main wechseln
git checkout main
git pull origin main

# Zu Feature-Branch
git checkout feat/new-feature
```

## 🚨 Troubleshooting Quick-Fixes

### Container startet nicht

```bash
docker compose down
docker compose build --no-cache
docker compose up -d
docker compose logs -f
```

### Port bereits belegt

```bash
# Welcher Prozess nutzt Port?
sudo lsof -i :80
sudo lsof -i :8000

# Prozess beenden
sudo kill -9 <PID>
```

### Out of Memory

```bash
# Docker-Ressourcen prüfen
docker stats

# Alte Images/Container löschen
docker system prune -a -f

# System-Speicher prüfen
free -h
df -h
```

### Frontend kann Backend nicht erreichen

```bash
# CORS prüfen und Backend neu starten
nano backend/main.py  # allow_origins anpassen
docker compose restart backend

# Netzwerk testen
docker compose exec frontend ping backend
docker compose exec frontend wget http://backend:8000/health
```

## 📞 Hilfe

### Logs exportieren (für Support)

```bash
# Alle relevanten Logs sammeln
cd /opt/goaltracker
docker compose logs > debug-logs.txt
docker compose ps >> debug-logs.txt
docker system df >> debug-logs.txt
cat .env >> debug-logs.txt  # Vorsicht: Keine Secrets!
```

### Issue erstellen

Gehe zu: https://github.com/DominikZeltner/Goal_Tracker/issues

---

## 🔖 Wichtige Pfade

| Pfad | Beschreibung |
|------|--------------|
| `/opt/goaltracker` | Projekt-Root |
| `/opt/goaltracker/.env` | Umgebungsvariablen |
| `/opt/goaltracker/backend/main.py` | Backend-Code (CORS) |
| `/var/lib/docker/volumes/goaltracker_backend_data` | Datenbank-Volume |
| `/etc/nginx/sites-available/goaltracker` | Nginx-Config |
| `/var/log/nginx/` | Nginx-Logs |

---

## 🔗 Wichtige Links

- **GitHub**: https://github.com/DominikZeltner/Goal_Tracker
- **README**: [README.md](README.md)
- **Deployment-Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Production-Checkliste**: [PRODUCTION_DEPLOYMENT_CHECKLIST.md](PRODUCTION_DEPLOYMENT_CHECKLIST.md)

---

**Tipp:** Setze ein Bookmark auf diese Seite für schnellen Zugriff! 🔖
