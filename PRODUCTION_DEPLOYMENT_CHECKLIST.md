# Production Deployment Checkliste

Diese Checkliste führt dich Schritt für Schritt durch das Deployment des Goal Trackers auf einem Production-Server.

## 📋 Voraussetzungen

### Was du brauchst:
- [ ] **Server** (VPS/VM mit Ubuntu 22.04 LTS oder ähnlich)
  - Mindestens 2GB RAM
  - 20GB Festplatte
  - SSH-Zugriff
- [ ] **Domain** (optional, aber empfohlen für HTTPS)
  - z.B. `goaltracker.yourdomain.com`
  - DNS A-Record auf Server-IP zeigen lassen
- [ ] **Root-Zugriff** oder sudo-Berechtigung
- [ ] **Git installiert** auf dem Server

---

## 🚀 Phase 1: Server-Vorbereitung

### 1.1 Mit Server verbinden

```bash
ssh root@your-server-ip
# oder mit eigenem User:
ssh your-user@your-server-ip
```

### 1.2 System aktualisieren

```bash
sudo apt update
sudo apt upgrade -y
```

### 1.3 Docker installieren

```bash
# Docker Installation Script
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# User zu Docker-Gruppe hinzufügen (kein sudo mehr nötig)
sudo usermod -aG docker $USER

# Neue Gruppe aktivieren (neu einloggen)
exit
# SSH erneut verbinden
ssh your-user@your-server-ip
```

### 1.4 Docker-Installation testen

```bash
docker --version
docker compose version
```

**Erwartete Ausgabe:**
```
Docker version 24.x.x
Docker Compose version v2.x.x
```

✅ **Checkpoint:** Docker ist installiert und funktioniert

---

## 📦 Phase 2: Projekt auf Server bringen

### 2.1 Verzeichnis erstellen

```bash
# Als Root/sudo
sudo mkdir -p /opt/goaltracker
sudo chown -R $USER:$USER /opt/goaltracker
cd /opt/goaltracker
```

### 2.2 Repository klonen

```bash
git clone https://github.com/DominikZeltner/Goal_Tracker.git .
```

**Hinweis:** Der `.` am Ende klont direkt ins aktuelle Verzeichnis.

### 2.3 Auf main-Branch wechseln

```bash
git checkout main
git pull origin main
```

✅ **Checkpoint:** Code ist auf dem Server

---

## ⚙️ Phase 3: Konfiguration

### 3.1 Umgebungsvariablen setzen

**Für lokale Entwicklung (ohne Domain):**
```bash
cat > .env << 'EOF'
DB_PATH=/app/data/database.db
VITE_API_URL=http://localhost:8000
EOF
```

**Für Production mit Domain:**
```bash
cat > .env << 'EOF'
DB_PATH=/app/data/database.db
VITE_API_URL=https://api.yourdomain.com
EOF
```

**Wichtig:** Ersetze `yourdomain.com` mit deiner echten Domain!

### 3.2 CORS-Konfiguration anpassen

Bearbeite `backend/main.py`:

```bash
nano backend/main.py
```

Finde die CORS-Middleware und passe die Origins an:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://goaltracker.yourdomain.com",      # Deine Frontend-Domain
        "https://www.goaltracker.yourdomain.com",  # Optional: www-Variante
        "http://localhost",                         # Für lokale Tests
        "http://localhost:5173",                    # Vite Dev-Server
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Speichern: `Ctrl+O`, `Enter`, `Ctrl+X`

✅ **Checkpoint:** Konfiguration ist angepasst

---

## 🐳 Phase 4: Docker-Build & Start

### 4.1 Images bauen

**Option A: Development (ohne Domain):**
```bash
docker compose build
```

**Option B: Production (mit Domain):**
```bash
# API-URL exportieren
export VITE_API_URL=https://api.yourdomain.com

# Build mit Production-Config
docker compose -f docker-compose.prod.yml build
```

**Erwartete Ausgabe:**
```
[+] Building 120.5s (24/24) FINISHED
```

### 4.2 Container starten

**Development:**
```bash
docker compose up -d
```

**Production:**
```bash
docker compose -f docker-compose.prod.yml up -d
```

### 4.3 Status prüfen

```bash
docker compose ps
```

**Erwartete Ausgabe:**
```
NAME                      STATUS              PORTS
goaltracker-backend-1     Up 10 seconds       0.0.0.0:8000->8000/tcp
goaltracker-frontend-1    Up 10 seconds       0.0.0.0:80->80/tcp
```

### 4.4 Logs prüfen

```bash
# Alle Logs
docker compose logs

# Live-Logs folgen
docker compose logs -f

# Nur Backend
docker compose logs backend

# Nur Frontend
docker compose logs frontend
```

**Keine Fehler?** ✅ Weiter zu Phase 5

**Fehler?** Siehe Troubleshooting-Sektion unten

✅ **Checkpoint:** Container laufen

---

## 🌐 Phase 5: Firewall & Netzwerk

### 5.1 Firewall konfigurieren (UFW)

```bash
# Firewall aktivieren
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Ports öffnen
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS (für später)

# Status prüfen
sudo ufw status

# Firewall aktivieren
sudo ufw enable
```

### 5.2 Test: Erreichbarkeit prüfen

**Von deinem lokalen Computer aus:**

```bash
# Backend testen
curl http://your-server-ip:8000/health

# Frontend testen
curl http://your-server-ip/
```

**Im Browser öffnen:**
```
http://your-server-ip
```

**Funktioniert es?** ✅ Weiter zu Phase 6

✅ **Checkpoint:** Anwendung ist über HTTP erreichbar

---

## 🔒 Phase 6: HTTPS mit Let's Encrypt (Optional aber empfohlen)

**Voraussetzung:** Domain ist auf Server-IP konfiguriert

### 6.1 Nginx Reverse Proxy installieren

```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

### 6.2 Nginx-Konfiguration erstellen

```bash
sudo nano /etc/nginx/sites-available/goaltracker
```

**Inhalt:**
```nginx
# Frontend
server {
    listen 80;
    server_name goaltracker.yourdomain.com www.goaltracker.yourdomain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Ersetze** `yourdomain.com` mit deiner Domain!

### 6.3 Nginx-Config aktivieren

```bash
# Symlink erstellen
sudo ln -s /etc/nginx/sites-available/goaltracker /etc/nginx/sites-enabled/

# Standard-Site deaktivieren (optional)
sudo rm /etc/nginx/sites-enabled/default

# Konfiguration testen
sudo nginx -t

# Nginx neu laden
sudo systemctl reload nginx
```

### 6.4 SSL-Zertifikate holen

```bash
sudo certbot --nginx -d goaltracker.yourdomain.com -d www.goaltracker.yourdomain.com -d api.yourdomain.com
```

**Certbot fragt:**
- Email-Adresse für Renewal-Benachrichtigungen
- Terms of Service akzeptieren: `Y`
- Email-Updates: `Y` oder `N` (deine Wahl)
- Redirect HTTP → HTTPS: `2` (empfohlen)

**Erwartete Ausgabe:**
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/goaltracker.yourdomain.com/fullchain.pem
```

### 6.5 Auto-Renewal testen

```bash
sudo certbot renew --dry-run
```

**Sollte keine Fehler zeigen.**

### 6.6 CORS nochmal anpassen für HTTPS

```bash
nano /opt/goaltracker/backend/main.py
```

CORS-Origins auf HTTPS ändern:
```python
allow_origins=[
    "https://goaltracker.yourdomain.com",
    "https://www.goaltracker.yourdomain.com",
],
```

Container neu starten:
```bash
cd /opt/goaltracker
docker compose restart backend
```

✅ **Checkpoint:** HTTPS ist aktiviert

---

## ✅ Phase 7: Finale Tests

### 7.1 HTTPS-Zugriff testen

**Im Browser öffnen:**
```
https://goaltracker.yourdomain.com
```

**Sollte funktionieren:**
- [ ] Grünes Schloss-Symbol (HTTPS)
- [ ] Timeline lädt Ziele
- [ ] Zielbaum funktioniert
- [ ] Detail-Ansicht funktioniert
- [ ] Neues Ziel erstellen funktioniert

### 7.2 API-Zugriff testen

```bash
curl https://api.yourdomain.com/health
```

**Erwartete Ausgabe:**
```json
{"status":"healthy"}
```

### 7.3 Persistenz testen

```bash
# Ziel im Browser erstellen
# Dann Container neu starten
cd /opt/goaltracker
docker compose restart

# Browser neu laden - Ziel sollte noch da sein
```

✅ **Alles funktioniert?** 🎉 Deployment erfolgreich!

---

## 🔧 Wartung & Monitoring

### Regelmäßige Aufgaben

#### 1. Logs überwachen

```bash
# Letzte 100 Zeilen
docker compose logs --tail=100

# Live-Logs
docker compose logs -f
```

#### 2. Datenbank-Backup (täglich empfohlen)

**Manuelles Backup:**
```bash
cd /opt/goaltracker
docker compose exec backend cat /app/data/database.db > backup-$(date +%Y%m%d).db
```

**Automatisches Backup-Script:**
```bash
# Backup-Script erstellen
cat > /opt/goaltracker/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups/goaltracker"
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)
docker compose -f /opt/goaltracker/docker-compose.yml exec -T backend cat /app/data/database.db > $BACKUP_DIR/backup_$DATE.db
# Alte Backups löschen (älter als 30 Tage)
find $BACKUP_DIR -name "backup_*.db" -mtime +30 -delete
echo "Backup erstellt: $BACKUP_DIR/backup_$DATE.db"
EOF

chmod +x /opt/goaltracker/backup.sh

# Cronjob für tägliches Backup (2 Uhr nachts)
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/goaltracker/backup.sh >> /var/log/goaltracker-backup.log 2>&1") | crontab -
```

#### 3. Updates einspielen

```bash
cd /opt/goaltracker

# Code aktualisieren
git pull origin main

# Neu bauen und starten
docker compose down
docker compose build --no-cache
docker compose up -d

# Logs prüfen
docker compose logs -f
```

#### 4. System-Ressourcen überwachen

```bash
# Container-Ressourcen
docker stats

# Disk-Usage
df -h
docker system df

# Alte Images aufräumen
docker image prune -f
```

---

## 🚨 Troubleshooting

### Problem: Container startet nicht

**Lösung:**
```bash
# Logs prüfen
docker compose logs backend
docker compose logs frontend

# Container-Status
docker compose ps

# Ports bereits belegt?
sudo lsof -i :80
sudo lsof -i :8000

# Container neu bauen
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Problem: Frontend kann Backend nicht erreichen

**Prüfen:**
1. CORS-Konfiguration in `backend/main.py` korrekt?
2. `VITE_API_URL` beim Build richtig gesetzt?
3. Netzwerk zwischen Containern OK?

```bash
# Netzwerk testen
docker compose exec frontend ping backend
```

**Fix:**
```bash
# Neu bauen mit korrekter API-URL
export VITE_API_URL=https://api.yourdomain.com
docker compose down
docker compose build --no-cache frontend
docker compose up -d
```

### Problem: Datenbank-Fehler

**Lösung:**
```bash
# Volume-Permissions prüfen
docker compose exec backend ls -la /app/data/

# Falls Permissions falsch:
docker compose exec backend chown -R root:root /app/data/

# Container neu starten
docker compose restart backend
```

### Problem: Let's Encrypt schlägt fehl

**Mögliche Ursachen:**
- Domain zeigt nicht auf Server-IP → DNS prüfen
- Port 80/443 nicht offen → Firewall prüfen
- Nginx läuft nicht → `sudo systemctl status nginx`

**Fix:**
```bash
# DNS testen
nslookup goaltracker.yourdomain.com

# Sollte Server-IP zurückgeben
# Falls nicht: DNS-Einträge korrigieren und 5-30 Minuten warten

# Nginx neu starten
sudo systemctl restart nginx

# Certbot erneut versuchen
sudo certbot --nginx -d goaltracker.yourdomain.com -d api.yourdomain.com
```

### Problem: CORS-Fehler im Browser

**Symptom:** Console zeigt "CORS policy blocked"

**Lösung:**
```bash
# backend/main.py bearbeiten
nano /opt/goaltracker/backend/main.py

# Stelle sicher, dass allow_origins deine Domain enthält:
allow_origins=[
    "https://goaltracker.yourdomain.com",
    "https://www.goaltracker.yourdomain.com",
],

# Backend neu starten
docker compose restart backend
```

---

## 📚 Weitere Hilfe

### Dokumentation

- **README.md** - Allgemeine Übersicht
- **DEPLOYMENT.md** - Detaillierte Deployment-Szenarien
- **CONTRIBUTING.md** - Entwickler-Guide

### Logs

- Docker-Logs: `docker compose logs`
- Nginx-Logs: `/var/log/nginx/error.log`
- System-Logs: `journalctl -u docker`

### GitHub Issues

Bei Problemen: https://github.com/DominikZeltner/Goal_Tracker/issues

---

## ✅ Fertig!

**Deine Goal Tracker-Installation ist jetzt live!**

🎉 **Gratulation!** 

**URLs:**
- Frontend: https://goaltracker.yourdomain.com
- API: https://api.yourdomain.com
- API-Docs: https://api.yourdomain.com/docs

---

**Erstellt:** 2026-01-29  
**Version:** 1.0
