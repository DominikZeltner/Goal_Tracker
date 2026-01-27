# Schritt-für-Schritt-Anleitung: Goal Tracker mit Cursor bauen

Diese Anleitung führt dich in kleinen, überprüfbaren Schritten durch den Aufbau des Goal-Tracker-Projekts. Jeder Schritt enthält **konkrete Handlungen**, **Cursor-Prompts zum Kopieren** und **messbare Erfolgskriterien**.

**Grundlage:** Alle technischen Entscheidungen und Phasen stammen aus `KONZEPT-CURSOR-WEBSEITE.md`. Nutze dieses Dokument parallel.

---

## Übersicht der Schritte

| # | Schritt | Abhängig von |
|---|---------|----------------|
| 1 | Git & Repository vorbereiten | — |
| 2 | GitHub einrichten & erste Sync | Schritt 1 |
| 3 | Commit- und Branch-Standards anwenden | Schritt 2 |
| 4 | GitHub Actions (CI) anlegen | Schritt 3 |
| 5 | Phase 1: Projektstruktur & Backend-Docker | — |
| 6 | Phase 2: Datenmodell & CRUD-API | Schritt 5 |
| 7 | Phase 3: Frontend-Grundgerüst & Docker | Schritt 5, 6 |
| 8 | Phase 4: Layout & Navigation | Schritt 7 |
| 9 | Phase 5: Timeline, Zielbaum, Detail | Schritt 8 |
| 10 | Phase 6: Interaktion & Logik | Schritt 9 |
| 11 | Phase 7: Qualität & Versionierung | Schritt 4–10 |
| 12 | Phase 8: Deployment-Vorbereitung | Schritt 11 |

---

# Teil A: Git & GitHub (Schritte 1–4)

---

## Schritt 1: Git & Repository vorbereiten

**Ziel:** Ein lokales Git-Repo existiert, sinnvolle Ignore-Regeln sind gesetzt, erster Commit ist möglich.

### 1.1 Git initialisieren

**Handlung:**

1. Im Projektordner (z. B. `Goal Tracker`) öffnest du ein Terminal.
2. Führe aus: `git init`

**Cursor-Prompt (Baustein 1):**

```
Erstelle eine .gitignore für ein Projekt mit:
- Python (Backend: __pycache__, *.pyc, .venv, venv, *.db)
- Node (Frontend: node_modules, dist, .env.local)
- IDE: .idea, .vscode (optional behalten)
- OS: .DS_Store, Thumbs.db
- Docker: Keine besonderen Einträge nötig, aber keine großen Logs
Verweise auf die Projektstruktur in KONZEPT-CURSOR-WEBSEITE.md Abschnitt 1.2.
```

**Messbare Kriterien:**

| Kriterium | Prüfung | Erfüllt wenn |
|-----------|---------|---------------|
| Git-Repo existiert | `git status` im Projektordner | Ausgabe enthält „On branch …“ oder „No commits yet“ ohne Fehler |
| .gitignore existiert | `cat .gitignore` (PowerShell: `Get-Content .gitignore`) | Datei listet z. B. `__pycache__`, `node_modules`, `*.db`, `dist` |
| Kein Fehler bei Init | `git init` (falls schon init: „Reinit“-Hinweis ist OK) | Kein „fatal“-Fehler |

### 1.2 Ersten Commit vorbereiten (Optional: Konzept-Referenz)

**Handlung:** Konzept-Dateien sollen von Anfang an versioniert sein.

**Messbare Kriterien:**

| Kriterium | Prüfung | Erfüllt wenn |
|-----------|---------|---------------|
| Trackbare Dateien | `git status` | Mindestens `.gitignore` und ggf. `KONZEPT-CURSOR-WEBSEITE.md` als „untracked“ sichtbar |
| Erster Commit möglich | `git add .gitignore` dann `git status` | `.gitignore` erscheint unter „Changes to be committed“ |

---

## Schritt 2: GitHub einrichten & erste Sync

**Ziel:** Ein leeres GitHub-Repo ist mit dem lokalen Repo verbunden; Push funktioniert.

### 2.1 GitHub-Repository anlegen

**Handlung:**

1. Auf GitHub: New Repository.
2. Name z. B. `goal-tracker` (oder wie dein Ordner heißt).
3. **Ohne** README, .gitignore oder License initialisieren (wir haben schon Inhalt).
4. Repository erstellen.

### 2.2 Remote hinzufügen und ersten Push

**Handlung:**

```bash
git remote add origin https://github.com/<DEIN-USER>/<REPO-NAME>.git
git branch -M main
git add .
git commit -m "chore(docs): initial project and concept"
git push -u origin main
```

**Cursor-Prompt (Baustein 2 – nur falls du Hilfe bei der .gitignore brauchst):**

```
Wir haben schon eine .gitignore. Prüfe, ob backend/database.db und frontend/.env.local 
sowie frontend/dist darin stehen. Wenn nicht, ergänze sie. Kurz begründen.
```

**Messbare Kriterien:**

| Kriterium | Prüfung | Erfüllt wenn |
|-----------|---------|---------------|
| Remote gesetzt | `git remote -v` | `origin` zeigt auf deine GitHub-URL |
| Branch main | `git branch` | Aktiver Branch ist `main` |
| Push erfolgreich | `git push -u origin main` | „Branch 'main' set up to track …“ bzw. kein „rejected“ |
| GitHub-Inhalt | Browser: Repo öffnen | Mindestens `.gitignore` und Konzept-Datei(en) sichtbar |

---

## Schritt 3: Commit- und Branch-Standards anwenden

**Ziel:** Du arbeitest von jetzt an mit Conventional Commits und klaren Branch-Namen; ein Beispiel-Commit und ein Beispiel-Branch sind angelegt.

### 3.1 Commit-Format (Conventional Commits)

**Regel (aus Konzept 1.14):**  
`<type>(<scope>): <Kurzbeschreibung>`

**Types:** `feat` | `fix` | `docs` | `style` | `refactor` | `test` | `chore`  
**Scopes (Beispiel):** `backend` | `frontend` | `docker` | `docs`

**Cursor-Prompt (Baustein 3):**

```
Erstelle eine kurze Datei CONTRIBUTING.md oder ergänze die README um einen Abschnitt 
„Commit-Standards“. Beschreibe in 5–7 Sätzen das Format: type(scope): Beschreibung. 
Nenne die erlaubten Types (feat, fix, docs, chore, …) und Scopes (backend, frontend, docker, docs). 
Verweise auf KONZEPT-CURSOR-WEBSEITE.md Abschnitt 1.14.
```

**Messbare Kriterien:**

| Kriterium | Prüfung | Erfüllt wenn |
|-----------|---------|---------------|
| Doku existiert | Vorhandenheit von CONTRIBUTING.md oder README-Abschnitt | Datei/Abschnitt enthält „type“, „scope“ und mind. 2 Beispiele |
| Beispiel-Commit | `git log -1 --oneline` nach nächstem Commit | Format entspricht z. B. `docs(docs): add commit standards` |

### 3.2 Branch-Strategie anwenden

**Regel:** Feature/Fix-Branches von `main` abzweigen, z. B. `feat/backend-health`, `fix/cors`.

**Handlung (Beispiel):**

```bash
git checkout -b feat/backend-skeleton
# … später erster Code …
git add backend/
git commit -m "feat(backend): add FastAPI app with GET /health"
```

**Messbare Kriterien:**

| Kriterium | Prüfung | Erfüllt wenn |
|-----------|---------|---------------|
| Feature-Branch angelegt | `git branch` | Neben `main` ein Branch z. B. `feat/...` existiert |
| Commit auf Branch | `git log -1 --oneline` auf dem Feature-Branch | Message hat Format `feat(backend): ...` oder `feat(frontend): ...` |

---

## Schritt 4: GitHub Actions (CI) anlegen

**Ziel:** Die drei Workflows aus Konzept 1.14 liegen unter `.github/workflows/` und laufen bei passenden Push/PRs (oder laufen durch, sobald der zugehörige Code existiert).

### 4.1 Ordnerstruktur für Workflows

**Handlung:** Lege an: `.github/workflows/` (mindestens die Ordner).

**Cursor-Prompt (Baustein 4):**

```
Erstelle die Ordnerstruktur .github/workflows/. Lege drei leere Platzhalter-Dateien an:
backend-ci.yml, frontend-ci.yml, docker-check.yml. In jede Datei schreibe nur eine Zeile:
# Backend CI | # Frontend CI | # Docker Check. Später ersetzen wir den Inhalt.
```

**Messbare Kriterien:**

| Kriterium | Prüfung | Erfüllt wenn |
|-----------|---------|---------------|
| Ordner existiert | Verzeichnis `.github/workflows/` | Enthält die drei genannten YAML-Dateien |

### 4.2 Backend-CI eintragen

**Cursor-Prompt (Baustein 5):**

```
Ersetze den Inhalt von .github/workflows/backend-ci.yml durch den exakten YAML-Inhalt 
aus KONZEPT-CURSOR-WEBSEITE.md Abschnitt 1.14 „Backend-CI (Minimalversion)“.
Keine Änderungen am Konzept-Text – 1:1 übernehmen.
```

**Messbare Kriterien:**

| Kriterium | Prüfung | Erfüllt wenn |
|-----------|---------|---------------|
| Backend-CI-Datei | Inhalt von `.github/workflows/backend-ci.yml` | Enthält `name: Backend CI`, `paths: ['backend/**', ...]`, `setup-python`, `ruff check backend/` |
| Syntax OK | Nach Push auf GitHub: Actions-Tab | Workflow erscheint; bei „push“ ohne Backend-Änderung kann er übersprungen werden (paths) |

### 4.3 Frontend-CI eintragen

**Cursor-Prompt (Baustein 6):**

```
Ersetze den Inhalt von .github/workflows/frontend-ci.yml durch den exakten YAML-Inhalt 
aus KONZEPT-CURSOR-WEBSEITE.md Abschnitt 1.14 „Frontend-CI (Minimalversion)“.
cache-dependency-path: frontend/package-lock.json beibehalten.
```

**Messbare Kriterien:**

| Kriterium | Prüfung | Erfüllt wenn |
|-----------|---------|---------------|
| Frontend-CI-Datei | Inhalt von `frontend-ci.yml` | Enthält `name: Frontend CI`, `paths: ['frontend/**', ...]`, `setup-node`, `node-version: '20'`, `cache-dependency-path: frontend/package-lock.json` |

### 4.4 Docker-Check eintragen (optional)

**Cursor-Prompt (Baustein 7):**

```
Ersetze den Inhalt von .github/workflows/docker-check.yml durch den exakten YAML-Inhalt 
aus KONZEPT-CURSOR-WEBSEITE.md Abschnitt 1.14 „Docker-Check (optional, simpel)“.
```

**Messbare Kriterien:**

| Kriterium | Prüfung | Erfüllt wenn |
|-----------|---------|---------------|
| Docker-Check-Datei | Inhalt von `docker-check.yml` | Enthält `docker compose build` und optional `docker compose up -d` |
| Alle Workflows committet | `git status` nach Add & Commit | Keine uncommitted Änderungen in `.github/` |

### 4.5 Gesamt-Check Git/CI

**Messbare Kriterien:**

| Kriterium | Prüfung | Erfüllt wenn |
|-----------|---------|---------------|
| Push | `git push origin main` (oder dein Branch) | Kein Fehler |
| Actions sichtbar | GitHub → Actions | Mindestens ein Workflow (z. B. Backend CI) ist gelistet; Lauf/Überspringen ist OK, je nach Pfad-Filter |

---

# Teil B: Entwicklung in Phasen (Schritte 5–12)

Jeder Schritt enthält **Cursor-Prompts als überschaubare Bausteine** und **messbare Kriterien**. Die Reihenfolge entspricht dem Konzept (Phase 1 → 8).

---

## Schritt 5: Phase 1 – Projektstruktur & Backend-Docker

**Ziel:** Ordner `backend/` und `frontend/` (mit `src/components`, `src/pages`) existieren; Backend läuft in Docker; `GET /health` antwortet mit 200.

### 5.1 Ordnerstruktur

**Cursor-Prompt (Baustein 8):**

```
Erstelle die Projektstruktur wie in KONZEPT-CURSOR-WEBSEITE.md Abschnitt 1.2:
- backend/ (leer, außer wir legen gleich was rein)
- frontend/src/components/
- frontend/src/pages/
Keine Dateien in backend/ und frontend/ nötig – nur die Ordner.
```

**Messbare Kriterien:**

| Kriterium | Prüfung | Erfüllt wenn |
|-----------|---------|---------------|
| backend/ | `ls backend` bzw. Explorer | Ordner `backend/` existiert |
| frontend-Struktur | `ls frontend/src` | `components/` und `pages/` existieren |

### 5.2 FastAPI + GET /health

**Cursor-Prompt (Baustein 9):**

```
Erstelle backend/main.py mit FastAPI, CORS allow_origins=['*'] (oder ['http://localhost:5173']),
und einem GET /health der {"status":"ok"} zurückgibt. Start per uvicorn auf Port 8000.
Verweise auf Konzept 1.2 und 1.4.
```

**Messbare Kriterien:**

| Kriterium | Prüfung | Erfüllt wenn |
|-----------|---------|---------------|
| /health antwortet | `curl http://localhost:8000/health` (nach Start) | JSON `{"status":"ok"}` oder vergleichbar |
| Port 8000 | Netstat oder Task-Manager | Prozess hört auf 8000 |

### 5.3 requirements.txt

**Cursor-Prompt (Baustein 10):**

```
Lege backend/requirements.txt an mit fastapi, uvicorn, sqlalchemy, pydantic –
Versionen wie in KONZEPT-CURSOR-WEBSEITE.md Abschnitt 1.13 (z. B. fastapi>=0.115,<0.129,
uvicorn[standard]>=0.32, sqlalchemy>=2.0.35, pydantic>=2.8).
```

**Messbare Kriterien:**

| Kriterium | Prüfung | Erfüllt wenn |
|-----------|---------|---------------|
| requirements.txt | `cat backend/requirements.txt` | Mindestens fastapi, uvicorn, sqlalchemy, pydantic mit Versionen |
| Installierbar | `pip install -r backend/requirements.txt` (in backend/) | Kein „fatal“-Fehler |

### 5.4 Backend-Dockerfile

**Cursor-Prompt (Baustein 11):**

```
Erstelle backend/Dockerfile: FROM python:3.12-slim, WORKDIR /app, COPY requirements.txt,
pip install -r requirements.txt, COPY . ., CMD uvicorn main:app --host 0.0.0.0 --port 8000.
Wie in Konzept 1.11/1.13.
```

**Messbare Kriterien:**

| Kriterium | Prüfung | Erfüllt wenn |
|-----------|---------|---------------|
| Dockerfile | Inhalt von `backend/Dockerfile` | FROM python:3.12-slim, uvicorn, Port 8000 |
| Build | `docker build -t goal-backend ./backend` | Build endet mit „Successfully built …“ |

### 5.5 docker-compose nur mit Backend

**Cursor-Prompt (Baustein 12):**

```
Erstelle im Projekt-Root eine docker-compose.yml mit **nur** dem Backend-Service:
build: ./backend, ports: 8000:8000. Kein Frontend-Service – kommt erst in Phase 3.
Wie in Konzept 2.0 und Phase 1.5.
```

**Messbare Kriterien:**

| Kriterium | Prüfung | Erfüllt wenn |
|-----------|---------|---------------|
| docker-compose | `docker compose config` | Ein Service (z. B. backend), Port 8000:8000 |
| Start | `docker compose up --build` | Container startet, kein Exit-Code 1 |
| /health im Container | `curl http://localhost:8000/health` | {"status":"ok"} |

---

## Schritt 6: Phase 2 – Datenmodell & CRUD-API

**Ziel:** SQLite-DB mit Tabelle für Ziele; CRUD-Endpunkte; hierarchisches Laden (`GET /ziele?tree=1` oder `/ziele/tree`); Tabellen werden beim Start angelegt.

### 6.1 DB-Modell und Pfad aus Umgebung

**Cursor-Prompt (Baustein 13):**

```
Erstelle backend/models.py: SQLAlchemy-Modell „Ziel“ mit id, titel, beschreibung,
start_datum, end_datum, status, parent_id. SQLite. DB-Pfad aus Umgebungsvariable DB_PATH,
Default ./database.db. Siehe Konzept 1.3 und 2.0 Phase 2.
```

**Messbare Kriterien:**

| Kriterium | Prüfung | Erfüllt wenn |
|-----------|---------|---------------|
| Modell existiert | Datei `backend/models.py` | Klasse mit genannten Spalten und parent_id |
| DB-Pfad konfigurierbar | Code bzw. Env-Ausgabe | DB_PATH oder DATABASE_URL wird gelesen |

### 6.2 Pydantic-Schemas

**Cursor-Prompt (Baustein 14):**

```
Erstelle Pydantic-Modelle für Ziel: Create (titel, beschreibung, start_datum, end_datum, status, parent_id optional),
Read (wie Create + id), ReadWithChildren (Read + children: Liste). Siehe Konzept 1.4 und Phase 2.2.
```

**Messbare Kriterien:**

| Kriterium | Prüfung | Erfüllt wenn |
|-----------|---------|---------------|
| Schemas vorhanden | Import/Definition in main oder eigene Datei | Create, Read/ReadWithChildren nutzbar |

### 6.3 CRUD und Tabellen-Init

**Cursor-Prompt (Baustein 15):**

```
In main.py: Beim App-Start Base.metadata.create_all(engine). CRUD: POST /ziele, GET /ziele (flach),
GET /ziele?tree=1 oder GET /ziele/tree (hierarchisch), GET /ziele/{id}, PUT /ziele/{id},
PATCH /ziele/{id} für Status, DELETE /ziele/{id}. Siehe Konzept Phase 2.3.
```

**Messbare Kriterien:**

| Kriterium | Prüfung | Erfüllt wenn |
|-----------|---------|---------------|
| Tabelle nach Start | Nach Start: Existenz von database.db und Tabelle | Datei vorhanden, Tabelle „ziel“ (oder gewählter Name) |
| POST /ziele | `curl -X POST http://localhost:8000/ziele -H "Content-Type: application/json" -d "{\"titel\":\"Test\",\"start_datum\":\"2025-01-01\",\"end_datum\":\"2025-12-31\",\"status\":\"offen\"}"` | 200/201, JSON mit id |
| GET /ziele | `curl http://localhost:8000/ziele` | JSON-Array (leer oder mit Einträgen) |
| GET /ziele/{id} | `curl http://localhost:8000/ziele/1` | Ein Ziel-Objekt oder 404 |

### 6.4 Hierarchie

**Messbare Kriterien:**

| Kriterium | Prüfung | Erfüllt wenn |
|-----------|---------|---------------|
| Baum-Endpunkt | `curl "http://localhost:8000/ziele?tree=1"` oder `curl http://localhost:8000/ziele/tree` | Struktur mit Unterzielen (children) oder leere Liste |

---

## Schritt 7: Phase 3 – Frontend-Grundgerüst & Docker

**Ziel:** Vite+React+TS-Projekt unter `frontend/`, Tailwind, Axios, Routing (/, /tree, /ziel/:id), API-Client, Frontend-Dockerfile, Frontend in docker-compose.

### 7.1 Vite + React + TypeScript

**Cursor-Prompt (Baustein 16):**

```
Erstelle das Frontend mit Vite 5, React, TypeScript: z. B. npm create vite@5 frontend -- --template react-ts.
Versionen wie Konzept 1.13 (vite ^5.4, react ^18.3, typescript ~5.6). Nach Anlegen npm install,
damit package-lock.json existiert.
```

**Messbare Kriterien:**

| Kriterium | Prüfung | Erfüllt wenn |
|-----------|---------|---------------|
| frontend/package.json | `cat frontend/package.json` | "vite", "react", "typescript" mit passenden Versionen |
| package-lock.json | `ls frontend/package-lock.json` | Datei existiert |
| Dev-Start | `npm run dev` in frontend/ | App unter http://localhost:5173 erreichbar |

### 7.2 Tailwind & Axios & VITE_API_URL

**Cursor-Prompt (Baustein 17):**

```
TailwindCSS 3.4 und Axios ins Frontend einbauen. API-Base-URL aus import.meta.env.VITE_API_URL,
Fallback http://localhost:8000. .env.example mit VITE_API_URL=http://localhost:8000 anlegen.
```

**Messbare Kriterien:**

| Kriterium | Prüfung | Erfüllt wenn |
|-----------|---------|---------------|
| Tailwind | Beliebige Komponente mit `className="text-blue-500"` | Farbe sichtbar |
| Axios/Env | Konsolenausgabe oder Netzwerk-Tab | Requests gehen an gesetzte VITE_API_URL |

### 7.3 Routing & Platzhalter-Seiten

**Cursor-Prompt (Baustein 18):**

```
React Router: / (Timeline), /tree (Zielbaum), /ziel/:id (Detail). Layout mit Tabs oder Sidebar,
Outlet für die Routes. Platzhalter-Componenten für Timeline, Tree, Detail. Konzept Phase 3.3.
```

**Messbare Kriterien:**

| Kriterium | Prüfung | Erfüllt wenn |
|-----------|---------|---------------|
| Routen | Manuell /, /tree, /ziel/1 aufrufen | Keine weiße Seite, keine Console-„route not found“ |

### 7.4 API-Client

**Cursor-Prompt (Baustein 19):**

```
Erstelle src/api/goals.ts (oder .js): getGoals(tree?: boolean), getGoal(id), createGoal(data),
updateGoal(id, data), updateStatus(id, status). Base-URL aus VITE_API_URL. Konzept Phase 3.4.
```

**Messbare Kriterien:**

| Kriterium | Prüfung | Erfüllt wenn |
|-----------|---------|---------------|
| getGoals | In Browser-Konsole oder kurzer Test: getGoals() aufrufen (Backend läuft) | Antwort ist Array oder fehlgeschlagener Request sichtbar |
| Typen/Export | Import in einer Seite | Kein „Module not found“ |

### 7.5 Frontend-Dockerfile & docker-compose

**Cursor-Prompt (Baustein 20):**

```
Frontend Dockerfile: Multi-Stage. Stage 1: node:20-alpine, npm ci, ARG VITE_API_URL=http://localhost:8000,
npm run build. Stage 2: nginx:alpine, Build-Artefakte aus dist/ kopieren, Port 80.
Konzept Phase 3.5.
```

**Cursor-Prompt (Baustein 21):**

```
Erweitere docker-compose.yml um Service frontend: build ./frontend, ports 80:80,
build-args VITE_API_URL=http://localhost:8000. CORS im Backend auf http://localhost und http://localhost:5173 erweitern. Konzept Phase 3.6 und 2.0.
```

**Messbare Kriterien:**

| Kriterium | Prüfung | Erfüllt wenn |
|-----------|---------|---------------|
| Frontend-Build | `docker compose build frontend` | Erfolgreicher Build |
| Beide Services | `docker compose up -d` | Backend unter :8000, Frontend unter :80 erreichbar |
| Kein CORS-Fehler | Browser: Frontend öffnen, z. B. Ziele laden | Keine CORS-Fehlermeldung in Konsole |

---

## Schritt 8: Phase 4 – Layout & Navigation

**Ziel:** Gemeinsames Layout mit Header, Nav (Timeline / Zielbaum), Main-Bereich für Outlet; konsistentes Styling.

### 8.1 Layout-Komponenten

**Cursor-Prompt (Baustein 22):**

```
Header mit App-Titel „Goal Tracker“, Nav-Links: Timeline (/), Zielbaum (/tree). Main-Bereich 
für <Outlet />. Tailwind: saubere Abstände, lesbare Typo. Konzept Phase 4.1 und 4.2.
```

**Messbare Kriterien:**

| Kriterium | Prüfung | Erfüllt wenn |
|-----------|---------|---------------|
| Nav sichtbar | Seite öffnen | Mindestens 2 klickbare Links, Outlet wechselt Inhalt |
| Responsiv (optional) | Fenster verkleinern | Layout bricht nicht völlig, Navigation nutzbar |

---

## Schritt 9: Phase 5 – Timeline, Zielbaum, Detail

**Ziel:** Timeline (vis-timeline) mit Daten von der API; Zielbaum (@xyflow/react); Detail-Seite mit Bearbeiten/Abhaken.

### 9.1 Timeline

**Cursor-Prompt (Baustein 23):**

```
Integriere vis-timeline 8.5. Ziele von API laden; start_datum/end_datum auf start/end mappen.
Items mit Farben nach Status (offen/in Arbeit/erledigt). Container per useRef, Timeline in useEffect.
Konzept 1.6, 1.13, Phase 5.1 und 2.0 (vis-timeline Mapping).
```

**Messbare Kriterien:**

| Kriterium | Prüfung | Erfüllt wenn |
|-----------|---------|---------------|
| Timeline rendert | Seite / öffnen, Backend mit Daten | Balken/Items auf Zeitachse sichtbar |
| Farben | Verschiedene Status in DB | Unterschiedliche Farben pro Status |
| Zoom | Maus/Touch | Zoom reagiert |

### 9.2 Klick auf Ziel → Detail

**Cursor-Prompt (Baustein 24):**

```
Klick auf Timeline-Item soll zu /ziel/:id navigieren (useNavigate) oder Detail inline anzeigen.
Konzept Phase 5.2.
```

**Messbare Kriterien:**

| Kriterium | Prüfung | Erfüllt wenn |
|-----------|---------|---------------|
| Navigation | Klick auf Item | URL wird /ziel/:id oder Detail-Inhalt erscheint |

### 9.3 Zielbaum (@xyflow/react)

**Cursor-Prompt (Baustein 25):**

```
Seite /tree: Paket @xyflow/react (React Flow v12) verwenden, NICHT reactflow 11.x. Knoten = Ziel,
Kanten = parent_id. Klick auf Knoten → Detail oder /ziel/:id. Konzept 1.6, 1.13, Phase 5.3.
```

**Messbare Kriterien:**

| Kriterium | Prüfung | Erfüllt wenn |
|-----------|---------|---------------|
| Baum zeigt Hierarchie | /tree mit mehreren Zielen in DB | Eltern-Kind-Struktur sichtbar |
| Paket | package.json | "@xyflow/react" ^12.x, kein "reactflow" 11 |

### 9.4 Detailansicht & Abhaken

**Cursor-Prompt (Baustein 26):**

```
Seite /ziel/:id: Titel, Beschreibung, Datum, Status anzeigen. Button „Abhaken“ → PATCH Status 
auf erledigt, dann UI aktualisieren. Optional: Unterziele auflisten. Konzept Phase 5.4.
```

**Messbare Kriterien:**

| Kriterium | Prüfung | Erfüllt wenn |
|-----------|---------|---------------|
| Detail lädt | /ziel/1 aufrufen | Daten des Ziels 1 sichtbar |
| Abhaken | „Abhaken“ klicken | Status wechselt, GET /ziele/1 liefert neuen Status |

---

## Schritt 10: Phase 6 – Interaktion & Logik

**Ziel:** Abhaken konsistent; Fortschritt (Backend oder Frontend) sichtbar; optional Drag&Drop, JSON-Import.

### 10.1 Abhaken & Fortschritt

**Cursor-Prompt (Baustein 27):**

```
Abhaken: Checkbox/Button „Erledigt“ führt PATCH /ziele/{id} mit status=erledigt aus, 
danach lokale Daten/Refetch. Fortschritt: Entweder Backend liefert Feld in GET /ziele/{id} 
oder Frontend berechnet aus children – einmal festlegen und in Detail anzeigen. Konzept Phase 6.1, 6.2.
```

**Messbare Kriterien:**

| Kriterium | Prüfung | Erfüllt wenn |
|-----------|---------|---------------|
| Abhaken | Ziel abhaken | Status „erledigt“, UI passt sich an |
| Fortschritt | Ziel mit Unterzielen, einige erledigt | Fortschritt (z. B. %) oder Balken sichtbar |

### 10.2 Drag & Drop (optional)

**Cursor-Prompt (Baustein 28):**

```
Nutze vis-timeline- und @xyflow/react-Drag-Events. Nach Verschieben (Datum oder parent_id) 
PUT oder PATCH an API senden. Konzept Phase 6.3.
```

**Messbare Kriterien:**

| Kriterium | Prüfung | Erfüllt wenn |
|-----------|---------|---------------|
| Drag in Timeline | Item verschieben | Neues Datum wird an API gesendet, nach Reload korrekt |

---

## Schritt 11: Phase 7 – Qualität & Versionierung

**Ziel:** ESLint/Prettier (Frontend), Ruff/Black (Backend); Fehlerbehandlung im Frontend; Versionierung wie Konzept 1.14 umgesetzt.

### 11.1 Linting

**Cursor-Prompt (Baustein 29):**

```
ESLint und Prettier im Frontend einrichten. Ruff oder Black für Python im Backend. 
Konzept Phase 7.1, 7.2.
```

**Messbare Kriterien:**

| Kriterium | Prüfung | Erfüllt wenn |
|-----------|---------|---------------|
| Frontend lint | `npm run lint` in frontend/ | Befehl existiert, endet ohne Abbruch (oder nur behebbare Warnings) |
| Backend lint | `ruff check backend/` oder `black backend/` | Befehl ausführbar, keine kritischen Fehler |

### 11.2 Fehlerbehandlung & A11y

**Cursor-Prompt (Baustein 30):**

```
API-Fehler im Frontend anzeigen (Toast oder Inline). Kontraste, fokussierbare Buttons, 
ARIA wo nötig. Konzept Phase 7.3, 7.4.
```

**Messbare Kriterien:**

| Kriterium | Prüfung | Erfüllt wenn |
|-----------|---------|---------------|
| Fehler sichtbar | Backend aus, API-Call auslösen | Fehlermeldung wird angezeigt |
| Fokus | Tab durch UI | Buttons/Links fokussierbar |

### 11.3 Versionierung prüfen

**Messbare Kriterien:**

| Kriterium | Prüfung | Erfüllt wenn |
|-----------|---------|---------------|
| Workflows laufen | Push mit backend/ oder frontend/ Änderung | Entsprechende CI-Jobs laufen (grün oder bewusst continue-on-error) |
| Commits | git log --oneline -5 | Messages im Format type(scope): ... |

---

## Schritt 12: Phase 8 – Deployment-Vorbereitung

**Ziel:** Docker-Build und -Start stabil; Volume für SQLite; Umgebungsvariablen für API-URL und CORS dokumentiert.

### 12.1 Docker & Volume

**Cursor-Prompt (Baustein 31):**

```
Backend in docker-compose: Volume z. B. backend_data:/app/data, Umgebungsvariable 
DB_PATH=/app/data/database.db. main.py bzw. Models müssen DB_PATH nutzen. Konzept Phase 8.1, 2.0.
```

**Messbare Kriterien:**

| Kriterium | Prüfung | Erfüllt wenn |
|-----------|---------|---------------|
| Volume | docker-compose.yml | backend hat volumes und env DB_PATH |
| Persistenz | docker compose down && docker compose up -d, Ziele anlegen | Nach Neustart sind Daten noch da |

### 12.2 Dokumentation

**Cursor-Prompt (Baustein 32):**

```
README: Start mit docker compose up -d. Kurz beschreiben: VITE_API_URL und CORS für 
Produktion anpassen (Konzept Phase 8.2–8.4). Keine App-Code-Änderung für anderen Host – 
nur andere Orchestrierung.
```

**Messbare Kriterien:**

| Kriterium | Prüfung | Erfüllt wenn |
|-----------|---------|---------------|
| README | Inhalt | Enthält „docker compose“ und Hinweis zu VITE_API_URL/CORS |

---

# Kurzreferenz: Cursor-Prompts nach Baustein-Nummer

| # | Thema |
|---|--------|
| 1 | .gitignore (Python, Node, Docker, IDE, OS) |
| 2 | .gitignore prüfen (database.db, .env.local, dist) |
| 3 | CONTRIBUTING/README: Commit-Standards (Conventional Commits) |
| 4 | .github/workflows/ + Platzhalter-Dateien |
| 5 | backend-ci.yml aus Konzept 1:1 |
| 6 | frontend-ci.yml aus Konzept 1:1 |
| 7 | docker-check.yml aus Konzept 1:1 |
| 8 | Ordnerstruktur backend/, frontend/src/components, frontend/src/pages |
| 9 | main.py: FastAPI, CORS, GET /health |
| 10 | backend/requirements.txt (Konzept 1.13) |
| 11 | backend/Dockerfile (python:3.12-slim, uvicorn, Port 8000) |
| 12 | docker-compose.yml nur Backend |
| 13 | backend/models.py (Ziel, SQLite, DB_PATH) |
| 14 | Pydantic-Schemas (Create, Read, ReadWithChildren) |
| 15 | CRUD + Tabellen-Init in main.py |
| 16 | Vite 5 + React + TS, package-lock |
| 17 | Tailwind, Axios, VITE_API_URL, .env.example |
| 18 | React Router, Layout, Platzhalter-Seiten |
| 19 | src/api/goals.ts (getGoals, getGoal, create, update, updateStatus) |
| 20 | frontend/Dockerfile (Multi-Stage, VITE_API_URL, nginx) |
| 21 | docker-compose + Frontend-Service, CORS |
| 22 | Header, Nav (Timeline/Tree), Outlet, Tailwind |
| 23 | vis-timeline, API-Daten, Farben nach Status, Zoom |
| 24 | Klick Timeline-Item → /ziel/:id |
| 25 | /tree mit @xyflow/react, Knoten/Kanten, Klick → Detail |
| 26 | /ziel/:id Detail, Abhaken, Unterziele |
| 27 | Abhaken + Fortschritt (Backend oder Frontend) |
| 28 | Drag & Drop → API aktualisieren |
| 29 | ESLint/Prettier, Ruff/Black |
| 30 | API-Fehler anzeigen, A11y |
| 31 | Backend-Volume, DB_PATH |
| 32 | README: docker compose, VITE_API_URL, CORS |

---

*Anleitung zu KONZEPT-CURSOR-WEBSEITE.md – jeden Schritt mit messbaren Kriterien abschließen, dann zum nächsten.*
