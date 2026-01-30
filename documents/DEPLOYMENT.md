# Deployment-Anleitung

Diese Anleitung beschreibt verschiedene Deployment-Szenarien für den Goal Tracker.

## 📋 Inhaltsverzeichnis

- [Lokale Entwicklung](#lokale-entwicklung)
- [Production auf VPS](#production-auf-vps)
- [Docker-Konfiguration](#docker-konfiguration)
- [Umgebungsvariablen](#umgebungsvariablen)
- [Wartung & Monitoring](#wartung--monitoring)

## 🔧 Lokale Entwicklung

### Mit Docker

```bash
# Starten
docker compose up -d

# Logs anzeigen
docker compose logs -f

# Stoppen
docker compose down
```

### Ohne Docker (manuell)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
DB_PATH=./database.db uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
VITE_API_URL=http://localhost:8000 npm run dev
```

## 🌐 Production auf VPS

### Voraussetzungen

- Ubuntu 22.04 LTS (oder ähnlich)
- Docker & Docker Compose installiert
- Domain mit DNS-Eintrag (optional, für HTTPS)

### 1. Server vorbereiten

```bash
# System aktualisieren
sudo apt update && sudo apt upgrade -y

# Docker installieren
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Neu einloggen für Docker-Rechte
exit
# SSH neu verbinden
```

### 2. Projekt klonen

```bash
cd /opt
sudo git clone https://github.com/DominikZeltner/Goal_Tracker.git
sudo chown -R $USER:$USER Goal_Tracker
cd Goal_Tracker
```

### 3. Umgebungsvariablen setzen

```bash
# .env erstellen
cat > .env << 'EOF'
DB_PATH=/app/data/database.db
VITE_API_URL=https://api.yourdomain.com
EOF
```

### 4. CORS konfigurieren

Bearbeite `backend/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://yourdomain.com",
        "https://www.yourdomain.com",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 5. Production-Build starten

```bash
# Mit Umgebungsvariable für API-URL
export VITE_API_URL=https://api.yourdomain.com
docker compose -f docker-compose.prod.yml up -d --build
```

### 6. HTTPS mit Nginx Reverse Proxy (Optional)

Installiere Nginx und Certbot:

```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

Erstelle Nginx-Config `/etc/nginx/sites-available/goaltracker`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

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

Aktiviere Config und hole SSL-Zertifikate:

```bash
sudo ln -s /etc/nginx/sites-available/goaltracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

## 🐳 Docker-Konfiguration

### Volume-Management

**Volume auflisten:**
```bash
docker volume ls
```

**Volume inspizieren:**
```bash
docker volume inspect goal_tracker_backend_data
```

**Volume-Inhalt anzeigen:**
```bash
docker run --rm -v goal_tracker_backend_data:/data alpine ls -la /data
```

### Container-Logs

```bash
# Alle Logs
docker compose logs

# Nur Backend
docker compose logs backend

# Live-Logs (folgen)
docker compose logs -f

# Letzte 100 Zeilen
docker compose logs --tail=100
```

### Container neu starten

```bash
# Einzelner Service
docker compose restart backend

# Alle Services
docker compose restart
```

### Images neu bauen

```bash
# Ohne Cache (sauberer Build)
docker compose build --no-cache

# Nur ein Service
docker compose build backend
```

## 🔐 Umgebungsvariablen

### Backend

| Variable | Beschreibung | Default | Erforderlich |
|----------|--------------|---------|--------------|
| `DB_PATH` | Pfad zur SQLite-Datenbank | `./database.db` | Nein |

### Frontend (Build-Zeit)

| Variable | Beschreibung | Default | Erforderlich |
|----------|--------------|---------|--------------|
| `VITE_API_URL` | Backend API-URL | `http://localhost:8000` | Nein |

**Wichtig**: `VITE_API_URL` wird zur **Build-Zeit** eingebettet, nicht zur Runtime!

### Production-Beispiel

```bash
# .env Datei
DB_PATH=/app/data/database.db
VITE_API_URL=https://api.yourdomain.com

# docker-compose.prod.yml nutzt diese automatisch
docker compose -f docker-compose.prod.yml up -d
```

## 🗄️ Datenbank-Wartung

Backup/Restore und Best Practices sind zentral dokumentiert:  
Siehe [BACKUP_README.md](BACKUP_README.md)

## 📊 Monitoring & Health Checks

### Manueller Health Check

```bash
# Backend
curl http://localhost:8000/health

# Frontend
curl http://localhost/
```

### Docker Health Status

```bash
docker compose ps
```

### System-Ressourcen

```bash
# Container-Ressourcen
docker stats

# Disk-Usage
docker system df
```

## 🔄 Updates deployen

### 1. Code aktualisieren

```bash
cd /opt/Goal_Tracker
git pull origin main
```

### 2. Neu bauen und starten

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### 3. Alte Images aufräumen

```bash
docker image prune -f
```

## 🚨 Troubleshooting

### Container startet nicht

```bash
# Logs prüfen
docker compose logs backend

# Container direkt starten (interaktiv)
docker compose run --rm backend /bin/sh
```

### Datenbank-Fehler

```bash
# Volume-Permissions prüfen
docker compose exec backend ls -la /app/data/

# Datenbank neu erstellen (Achtung: Datenverlust!)
docker compose down -v
docker compose up -d
```

### Port bereits belegt

```bash
# Prüfen welcher Prozess Port 80/8000 nutzt
sudo lsof -i :80
sudo lsof -i :8000

# Andere Ports verwenden (docker-compose.yml anpassen)
ports:
  - "8080:80"   # Frontend
  - "8001:8000" # Backend
```

### Frontend kann Backend nicht erreichen

1. CORS-Konfiguration in `backend/main.py` prüfen
2. `VITE_API_URL` zur Build-Zeit korrekt gesetzt?
3. Netzwerk zwischen Containern funktioniert?

```bash
docker compose exec frontend ping backend
```

## 🔒 Sicherheit

### Best Practices

1. **Niemals** `.env` ins Git committen
2. **Secrets** über Docker Secrets oder externe Secret-Manager
3. **HTTPS** in Production (Certbot/Let's Encrypt)
4. **Firewall** konfigurieren (nur 80/443 offen)
5. **Updates** regelmäßig einspielen

### Firewall-Setup (UFW)

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

## 📞 Support

Bei Problemen:
1. Logs prüfen: `docker compose logs`
2. GitHub Issues: https://github.com/DominikZeltner/Goal_Tracker/issues
3. Dokumentation: README.md

---

**Letzte Aktualisierung**: 2026-01-30
