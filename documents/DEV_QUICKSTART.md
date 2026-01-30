# 🚀 Development Quick-Start

Schnellste Art, mit der Entwicklung zu starten!

---

## ⚡ In 3 Schritten loslegen

### 1️⃣ Development-Server starten

```bash
cd "c:\_work\Goal Tracker"
docker compose -f docker-compose.dev.yml up
```

**Warte bis du siehst:**
```
backend-1   | INFO:     Application startup complete.
backend-1   | INFO:     Uvicorn running on http://0.0.0.0:8000
frontend-1  | ➜  Local:   http://localhost:5173/
```

### 2️⃣ Im Browser öffnen

**Frontend (Development):**  
http://localhost:5173

**Backend API:**  
http://localhost:8000/docs

### 3️⃣ Code ändern → Automatisch neu laden! ✨

**Beispiel:**

1. Öffne `frontend/src/pages/Timeline.tsx`
2. Ändere etwas (z.B. eine Überschrift)
3. Speichere (`Strg + S`)
4. → Browser lädt automatisch neu! 🎉

---

## 🛑 Server stoppen

```bash
Strg + C
```

Oder in neuem Terminal:

```bash
docker compose -f docker-compose.dev.yml down
```

---

## 📝 Wichtige Unterschiede

| | Development | Production |
|---|-------------|------------|
| **Befehl** | `docker compose -f docker-compose.dev.yml up` | `docker compose up` |
| **URL** | http://localhost:5173 | http://localhost |
| **Hot Reload** | ✅ Ja | ❌ Nein |
| **Build nötig?** | Nur beim 1. Start | Bei jeder Änderung |

---

## 💡 Pro-Tipp

**Zwei Terminals parallel:**

**Terminal 1 (Logs sehen):**
```bash
docker compose -f docker-compose.dev.yml up
```

**Terminal 2 (Befehle ausführen):**
```bash
# Git-Befehle
git status
git add .
git commit -m "feat: neue Features"

# Oder: Container-Befehle
docker compose -f docker-compose.dev.yml logs backend
```

---

## 🔄 Wechsel zwischen Dev und Production

**Von Dev zu Production:**
```bash
docker compose -f docker-compose.dev.yml down
docker compose up -d
# → Öffne http://localhost
```

**Von Production zu Dev:**
```bash
docker compose down
docker compose -f docker-compose.dev.yml up
# → Öffne http://localhost:5173
```

---

**Weitere Details:**  
- [DEV_SETUP.md](DEV_SETUP.md)  
- [COMMANDS_CHEATSHEET.md](COMMANDS_CHEATSHEET.md)
