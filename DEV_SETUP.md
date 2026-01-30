# Development-Setup mit Hot Reload 🚀

Dieses Setup ermöglicht **sofortige Änderungen** ohne Rebuilds!

---

## 🎯 Features

✅ **Frontend Hot Reload** - Änderungen sofort sichtbar (Vite HMR)  
✅ **Backend Auto-Reload** - Uvicorn startet bei Änderungen neu  
✅ **Keine Rebuilds** - Änderungen werden direkt gemountet  
✅ **Gleiche Ports** - Frontend auf Port 5173, Backend auf Port 8000  
✅ **Persistente Datenbank** - SQLite bleibt zwischen Restarts erhalten

---

## 🚀 Schnellstart

### 1. Development-Server starten

```bash
docker compose -f docker-compose.dev.yml up
```

**Hinweis:** Beim ersten Start dauert es ~20-30 Sekunden (Dependencies installieren).  
**Danach:** Keine Rebuilds mehr nötig! ⚡

### 2. Im Browser öffnen

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API-Dokumentation:** http://localhost:8000/docs

### 3. Code ändern → Automatisch neu laden!

**Frontend:**
- Ändere eine `.tsx`-Datei in `frontend/src/`
- Speichern (`Strg + S`)
- Browser lädt automatisch neu (HMR)

**Backend:**
- Ändere eine `.py`-Datei in `backend/`
- Speichern (`Strg + S`)
- Uvicorn startet automatisch neu (~1-2 Sekunden)

---

## 📋 Alle Befehle

### Server starten

```bash
# Im Vordergrund (mit Logs)
docker compose -f docker-compose.dev.yml up

# Im Hintergrund
docker compose -f docker-compose.dev.yml up -d
```

### Server stoppen

```bash
# Strg + C (wenn im Vordergrund)

# Oder:
docker compose -f docker-compose.dev.yml down
```

### Logs anzeigen

```bash
# Alle Logs
docker compose -f docker-compose.dev.yml logs -f

# Nur Frontend
docker compose -f docker-compose.dev.yml logs -f frontend

# Nur Backend
docker compose -f docker-compose.dev.yml logs -f backend
```

### Neustart (wenn etwas hängt)

```bash
docker compose -f docker-compose.dev.yml restart
```

### Container komplett neu bauen (nur nötig wenn Dependencies geändert wurden)

```bash
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml build --no-cache
docker compose -f docker-compose.dev.yml up
```

---

## 🔧 Wann musst du neu bauen?

### ✅ KEIN Rebuild nötig:
- Änderungen an `.tsx`, `.ts`, `.css` Dateien (Frontend)
- Änderungen an `.py` Dateien (Backend)
- Änderungen an `nginx.conf` (nur in Production relevant)

### ⚠️ Rebuild ERFORDERLICH:
- Neue Dependencies hinzugefügt:
  - Frontend: `package.json` geändert → `npm install` im Container
  - Backend: `requirements.txt` geändert → `pip install` im Container
- Dockerfile geändert

**Quick-Fix für neue Dependencies:**

```bash
# Frontend: npm install im Container ausführen
docker compose -f docker-compose.dev.yml exec frontend npm install

# Backend: pip install im Container ausführen
docker compose -f docker-compose.dev.yml exec backend pip install -r requirements.txt

# Oder: Container neu bauen
docker compose -f docker-compose.dev.yml build
```

---

## 🐛 Troubleshooting

### Problem: "Port 5173 already in use"

**Lösung:**
```bash
# Prüfe, welcher Prozess den Port nutzt
netstat -ano | findstr :5173

# Stoppe den Development-Server
docker compose -f docker-compose.dev.yml down
```

### Problem: "Frontend zeigt alte Version"

**Lösung:**
1. Hard Refresh im Browser: `Strg + Shift + R`
2. Browser-Cache leeren
3. Container neu starten:
   ```bash
   docker compose -f docker-compose.dev.yml restart frontend
   ```

### Problem: "Backend lädt nicht neu nach Änderungen"

**Lösung:**
1. Prüfe Logs:
   ```bash
   docker compose -f docker-compose.dev.yml logs backend
   ```
2. Backend neu starten:
   ```bash
   docker compose -f docker-compose.dev.yml restart backend
   ```

### Problem: "Änderungen werden nicht erkannt"

**Mögliche Ursache:** Windows File Watcher Probleme

**Lösung:**
1. Verwende WSL2 (empfohlen für Docker auf Windows)
2. Oder: Setze Polling in `vite.config.ts`:
   ```typescript
   export default defineConfig({
     server: {
       watch: {
         usePolling: true,
       },
     },
   });
   ```

---

## 📊 Development vs Production

| Feature | Development (`dev.yml`) | Production (`docker-compose.yml`) |
|---------|------------------------|----------------------------------|
| **Build-Zeit** | ~20s (einmalig) | ~40s (jedes Mal) |
| **Hot Reload** | ✅ Ja | ❌ Nein |
| **Source Maps** | ✅ Ja | ❌ Nein (minified) |
| **Frontend Port** | 5173 (Vite) | 80 (Nginx) |
| **Optimierung** | Schnelles Reload | Optimierte Bundles |
| **Verwendung** | Entwicklung | Testing, Deployment |

---

## 🎯 Workflow-Empfehlung

### Während der Entwicklung:

```bash
# 1. Development-Server starten
docker compose -f docker-compose.dev.yml up

# 2. Code editieren in VSCode/Cursor
# → Änderungen werden automatisch geladen!

# 3. Features testen in Browser (http://localhost:5173)

# 4. Fertig? Server stoppen
docker compose -f docker-compose.dev.yml down
```

### Vor dem Commit (Production-Test):

```bash
# 1. Production-Build testen
docker compose build --no-cache
docker compose up -d

# 2. Testen auf http://localhost

# 3. Alles OK? Commit & Push
git add .
git commit -m "feat: neue Features"
git push
```

---

## 💡 Pro-Tipps

1. **Zwei Terminals:**
   - Terminal 1: `docker compose -f docker-compose.dev.yml up` (Logs sehen)
   - Terminal 2: Für Git-Befehle, Tests, etc.

2. **Browser DevTools:**
   - Network-Tab: API-Requests überwachen
   - Console: JavaScript-Fehler sofort sehen

3. **Backend-Logs filtern:**
   ```bash
   docker compose -f docker-compose.dev.yml logs backend | grep ERROR
   ```

4. **VSCode-Extensions:**
   - Docker Extension: Container-Status direkt in VSCode sehen
   - ESLint: Code-Probleme sofort erkennen

---

## 🔄 Von Development zu Production wechseln

### Development → Production:

```bash
docker compose -f docker-compose.dev.yml down
docker compose up -d
```

### Production → Development:

```bash
docker compose down
docker compose -f docker-compose.dev.yml up
```

---

## 📝 Zusammenfassung

**Development-Setup:**
- ✅ Schnelles Feedback (Hot Reload)
- ✅ Keine Rebuilds zwischen Code-Änderungen
- ✅ Perfekt für tägliche Entwicklung

**Production-Setup:**
- ✅ Optimierte Bundles
- ✅ Nginx für Performance
- ✅ Production-ready
- ✅ Zum Testen vor Deployment

**Benutze Development für Coding, Production für Testing!** 🚀
