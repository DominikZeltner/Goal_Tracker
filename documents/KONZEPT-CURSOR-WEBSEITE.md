# Konzept: Webseite mit Cursor aufbauen

Dieses Dokument beschreibt den schrittweisen Aufbau der gesamten Webseite mit Cursor. Nutze es als Roadmap und Checkliste.

---

## 1. Deine vorbereiteten Informationen

**Ziel:** Eine einfache, interaktive Ziel-Webseite mit Timeline, Unterzielen und Visualisierung, gebaut mit Cursor und Python.

### 1.1 Architektur (festgelegt)

| Schicht | Technologie |
|--------|-------------|
| **Backend** | Python + FastAPI |
| **Frontend** | React |
| **Daten** | SQLite |
| **Kommunikation** | REST API |
| **Darstellung** | Timeline + Hierarchie (Zielbaum) |
| **Laufzeit** | **Docker** (Backend + Frontend in Containern, einfacher Plattformwechsel) |

### 1.2 Projektstruktur

```
/backend
  main.py
  models.py
  database.db
  Dockerfile
  requirements.txt

/frontend
  src/
    components/
    pages/
  Dockerfile
  nginx.conf          # optional: für Produktions-Serving

/docker-compose.yml   # Backend + Frontend + ggf. Volumes
/.dockerignore
/.github/
  workflows/          # GitHub Actions (Backend-CI, Frontend-CI, optional Docker-Check)
```

**Docker-Strategie:** Die gesamte App läuft in Docker. Ein `docker compose up` startet Backend und Frontend; später Wechsel zu anderem Host (z. B. AWS, Azure, eigener Server) ohne Code-Anpassung, nur neues Deployment der gleichen Images.

### 1.3 Datenmodell

**Minimal:**

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | int | Primärschlüssel |
| `titel` | string | Bezeichnung des Ziels |
| `beschreibung` | string | Optionale Beschreibung |
| `start_datum` | date | Start |
| `end_datum` | date | Ende |
| `status` | enum/string | z. B. offen, in Arbeit, erledigt |
| `parent_id` | int? | Verweis auf übergeordnetes Ziel (Unterziele) |

**Optional (später):**

- Fortschritt %
- Priorität
- Kategorie

### 1.4 Backend mit FastAPI

**Funktionen:**

- Ziel anlegen
- Ziel bearbeiten
- Ziele laden (hierarchisch)
- Status aktualisieren

**Cursor übernimmt:**

- CRUD-Endpunkte
- Pydantic-Modelle
- SQLite-Integration

### 1.5 Frontend mit React

**Technik:**

- Vite + React
- TailwindCSS für Layout
- Axios für API-Calls

**Struktur / Views:**

- Timeline View (Zeitachse)
- Zielbaum (Tree View)
- Detailansicht pro Ziel

### 1.6 Timeline & Visualisierung

**Libraries:** (konkrete Versionen siehe Abschnitt 1.13)

| Zweck | Library |
|-------|---------|
| Zeitachse | vis-timeline (8.5.x) |
| Zielbäume | @xyflow/react (React Flow v12) |
| Fortschritt (Charts) | recharts (2.14+ oder 3.x) |

**Darstellung:**

- Zeitachse mit Zielen als Balken/Items
- Klick auf Ziel → Unterziele sichtbar
- Farben nach Status (z. B. offen = grau, in Arbeit = blau, erledigt = grün)

### 1.7 Interaktion

- Ziel abhaken → Status geändert
- Fortschritt automatisch berechnen (z. B. aus erledigten Unterzielen)
- Verschieben von Zielen per Drag & Drop
- Zoom in Timeline

### 1.8 Konfiguration statt Coding

Ziele initial als JSON definierbar, später über UI editierbar:

```json
{
  "title": "Business aufbauen",
  "start": "2025-01-01",
  "end": "2025-12-31",
  "subgoals": []
}
```

### 1.9 KI sinnvoll einsetzen (mit Cursor)

- Ziele strukturieren lassen
- Meilensteine vorschlagen
- Zeitabschätzung generieren
- Reflexion: „Warum Ziel verfehlt?“ – keine komplexe KI nötig

### 1.10 Ausbau später

- Auth (Login)
- Versionsverlauf
- Rückblick-Modus
- Export als PDF
- Mobile Ansicht
- AI-Review pro Quartal

### 1.11 Docker & Plattformunabhängigkeit

- **Laufzeit:** Backend und Frontend werden als Container gebaut und per `docker compose` gemeinsam gestartet.
- **Vorteil:** Einmal gebaut, überall lauffähig (Linux, Windows Server, Cloud). Späterer Wechsel der Plattform ohne Änderung am Application-Code.
- **Umfang:** `Dockerfile` im Backend, `Dockerfile` im Frontend (Build → Nginx oder statischer Server), `docker-compose.yml` im Root. SQLite-Datenbank als Volume, damit Daten beim Neustart erhalten bleiben.

### 1.12 Kurzfassung

- **Stack:** FastAPI + React + SQLite
- **Laufzeit:** Docker (Backend + Frontend), plattformunabhängig
- **Struktur:** Ziele als Baum (parent_id)
- **Visualisierung:** Timeline + Zielbaum
- **Arbeitsweise:** Cursor für ~80 % Code
- **Strategie:** Start simpel, später ausbauen
- **Fokus:** Übersicht, nicht Gamification

### 1.13 Tech-Stack: kompatible Versionen

Damit Backend, Frontend, Timeline/Charts und Docker stabil zusammenlaufen, sind folgende Versionen aufeinander abgestimmt. Bei Problemen zuerst auf diesen Satz zurückgehen.

**Backend (Python)**

| Software | Version | Anmerkung |
|----------|---------|-----------|
| Python | 3.12 | In Docker z. B. `python:3.12-slim`. 3.11 geht auch. |
| FastAPI | 0.115–0.127 | Ab 0.128 nur Pydantic v2. Mit 0.115.x / 0.127.x sicher. |
| uvicorn | ≥0.32 | ASGI-Server für FastAPI. |
| Pydantic | ≥2.8 | FastAPI nutzt Pydantic v2. |
| SQLAlchemy | ≥2.0.35 | SQLite, ORM 2.0 (z. B. `select()`). |

**Beispiel backend/requirements.txt:** `fastapi>=0.115,<0.129` · `uvicorn[standard]>=0.32` · `sqlalchemy>=2.0.35` · `pydantic>=2.8`

**Frontend (Node / React)**

| Software | Version | Anmerkung |
|----------|---------|-----------|
| Node.js | 20 LTS | Vite 5 braucht Node 18+; 20 LTS stabil für Docker. |
| Vite | 5.4.x | React-Plugin inklusive. |
| React | 18.3.x | Gemeinsamer Nenner für alle UI-Libraries. |
| TypeScript | 5.6.x | Üblich mit Vite-React-Template. |
| TailwindCSS | 3.4.x | Bewährt; v4 nutzt anderen Setup. |
| Axios | 1.7.x | Für API-Calls. |
| React Router | 6.28.x | `react-router-dom` für SPA. |
| vis-timeline | 8.5.x | In React per `useRef` + `useEffect` einbinden (kein ReactDOM in Items). |
| Zielbaum | @xyflow/react 12.x | Neuer Name von React Flow; nicht altes `reactflow` 11.x. |
| recharts | 2.14.x oder 3.x | Beide unterstützen React 18. |

**vis-timeline:** Vanilla-JS-Library; Container per `ref`, Timeline in `useEffect` erzeugen. Wrapper wie `react-vis-timeline` sind optional und weniger gepflegt. **Zielbaum:** Im Konzept „react-flow“ = Paket **@xyflow/react** verwenden.

**Docker-Basisimages**

| Verwendung | Image |
|------------|--------|
| Backend | `python:3.12-slim` |
| Frontend Build | `node:20-alpine` |
| Frontend Serve | `nginx:alpine` |

**Zusammenpassen:** Python 3.12 ↔ FastAPI ↔ Pydantic v2 ↔ SQLAlchemy 2.x. Node 20 ↔ Vite 5 ↔ React 18. React 18 ↔ vis-timeline (über Ref), @xyflow/react 12.x, recharts 2.x/3.x.

**Zum Kopieren:** Backend: `fastapi>=0.115,<0.129` `uvicorn[standard]>=0.32` `sqlalchemy>=2.0.35`. Frontend: `"vite": "^5.4"` `"react": "^18.3"` `"typescript": "~5.6"` `"tailwindcss": "^3.4"` `"axios": "^1.7"` `"react-router-dom": "^6.28"` `"vis-timeline": "^8.5"` `"@xyflow/react": "^12.10"` `"recharts": "^2.14"`. Docker: Backend `FROM python:3.12-slim`, Frontend Build `FROM node:20-alpine`. Cursor-Prompts können auf „wie in KONZEPT 1.13“ verweisen.

### 1.14 Versionierung & GitHub

**Ziel:** Einheitliche Commits, nachvollziehbare Historie, einfache CI (Lint/Build) per GitHub Actions. Start simpel, später erweiterbar.

---

#### Commit-Standards (Conventional Commits)

Format: **`<type>(<scope>): <Kurzbeschreibung>`**  
Optional in der nächsten Zeile: ausführliche Beschreibung oder `BREAKING CHANGE:`.

**Types (Pflicht):**

| Type     | Bedeutung |
|----------|-----------|
| `feat`   | Neue Funktion |
| `fix`    | Bugfix |
| `docs`   | Nur Dokumentation (z. B. README, Konzept) |
| `style`  | Formatierung, keine Logik (z. B. Prettier/Black) |
| `refactor` | Umstrukturierung ohne neues Verhalten |
| `test`   | Tests hinzufügen oder anpassen |
| `chore`  | Build, Tooling, Dependencies (z. B. package.json, Docker) |

**Scope (optional, für dieses Projekt):**

| Scope     | Bereich |
|-----------|---------|
| `backend` | Python/FastAPI/SQLite |
| `frontend`| React/Vite/UI |
| `docker`  | Dockerfile, docker-compose |
| `docs`    | Konzept, README, Kommentare |

**Beispiele:**

```
feat(backend): POST /ziele mit parent_id
fix(frontend): Timeline-Zoom auf Mobile
docs(docs): Abschnitt 1.14 Versionierung ergänzt
chore(docker): Node 20 in Frontend-Dockerfile
refactor(frontend): API-Client in src/api/goals.ts auslagern
```

**Regeln:** Klein schreiben nach dem Doppelpunkt, kein Punkt am Ende. Imperativ: „Add …“ / „Fix …“ (oder auf Deutsch: „Neues …“ / „Korrigiere …“). Bei Breaking Changes: `feat(api)!: ...` oder in der Body-Zeile `BREAKING CHANGE: ...`.

---

#### Branch-Strategie (einfach)

- **`main`** = lauffähiger Stand; nach jedem Merge soll `docker compose up` funktionieren.
- **Feature-/Fix-Branches:** von `main` abzweigen, Namen z. B. `feat/timeline-zoom`, `fix/cors-frontend`, `docs/versioning`.
- **Merge:** per Pull Request (PR) nach `main`; optional „Squash and merge“, damit ein Feature = ein Commit auf `main`.

Kein zwingendes `develop`-Branch – so bleibt es simpel. Später bei Bedarf: `main` = Produktion, `develop` = Integration.

---

#### GitHub-Workflows (einfach, definiert)

Alle Workflows liegen unter **`.github/workflows/`**. Trigger: Push und Pull Request auf `main` (und optional auf andere Branches).

**1) Backend-CI** (Datei: `.github/workflows/backend-ci.yml`)

| Schritt | Inhalt |
|---------|--------|
| Trigger | `push` / `pull_request` auf `main`, Pfade `backend/**` |
| Job | Python 3.12, `pip install -r backend/requirements.txt`, optional: Ruff/Black (lint), pytest (test) |
| Ziel | Lint und Tests laufen bei jedem Commit, der Backend-Code betrifft |

**2) Frontend-CI** (Datei: `.github/workflows/frontend-ci.yml`)

| Schritt | Inhalt |
|---------|--------|
| Trigger | `push` / `pull_request` auf `main`, Pfade `frontend/**` |
| Job | Node 20, `npm ci`, `npm run lint`, `npm run build` |
| Ziel | Lint und Build laufen bei jedem Commit, der Frontend-Code betrifft |

**3) Docker-Check (optional)** (Datei: `.github/workflows/docker-check.yml`)

| Schritt | Inhalt |
|---------|--------|
| Trigger | `push` / `pull_request` auf `main` |
| Job | `docker compose build` (oder `docker compose up --build` kurz prüfen) |
| Ziel | Stellen sicher, dass Images bauen und die App im Container startet |

**Konfiguration:** In allen Workflows Working-Directory auf Projekt-Root setzen; Backend-Job: `defaults.run.working-directory: backend` nur für `pip install`/Test, nicht für Pfad-Trigger. Pfad-Filter mit `paths:` spart Laufzeit. **Frontend-CI:** `cache-dependency-path: frontend/package-lock.json` bei **npm**; bei pnpm bzw. yarn auf `frontend/pnpm-lock.yaml` bzw. `frontend/yarn.lock` und Install-Befehl anpassen (siehe auch Abschnitt 2.0 Phase 7).

---

#### Konkrete Workflow-Definitionen (zum Anlegen)

**Backend-CI (Minimalversion):**

```yaml
# .github/workflows/backend-ci.yml
name: Backend CI
on:
  push:
    branches: [main]
    paths: ['backend/**', '.github/workflows/backend-ci.yml']
  pull_request:
    branches: [main]
    paths: ['backend/**', '.github/workflows/backend-ci.yml']
jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - name: Install dependencies
        run: pip install -r backend/requirements.txt
        working-directory: .
      - name: Lint (Ruff)
        run: pip install ruff && ruff check backend/
        working-directory: .
      - name: Test (optional)
        run: pytest backend/ -v
        working-directory: .
        continue-on-error: true   # bis Tests existieren
```

**Frontend-CI (Minimalversion):**

```yaml
# .github/workflows/frontend-ci.yml
name: Frontend CI
on:
  push:
    branches: [main]
    paths: ['frontend/**', '.github/workflows/frontend-ci.yml']
  pull_request:
    branches: [main]
    paths: ['frontend/**', '.github/workflows/frontend-ci.yml']
jobs:
  lint-and-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      - name: Install and build
        run: npm ci && npm run build
        working-directory: frontend
      - name: Lint
        run: npm run lint
        working-directory: frontend
        continue-on-error: true   # bis ESLint konfiguriert
```

**Docker-Check (optional, simpel):**

```yaml
# .github/workflows/docker-check.yml
name: Docker Check
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build containers
        run: docker compose build
      - name: Start and health-check (optional)
        run: |
          docker compose up -d
          sleep 10
          curl -sf http://localhost:8000/health || true
          docker compose down
        continue-on-error: true   # wenn Backend noch kein /health hat
```

---

#### Kurzfassung Versionierung

- **Commits:** Conventional Commits, z. B. `feat(frontend): Timeline mit vis-timeline`.
- **Branches:** `main` = stabil; Features/Fixes auf eigenen Branches, Merge per PR.
- **Workflows:** Backend-CI (Lint/Test), Frontend-CI (Lint/Build), optional Docker-Check; alle unter `.github/workflows/`, Pfad-Filter nutzen.

Cursor-Prompts können auf „Commit-Standards und Workflows wie in KONZEPT 1.14“ bzw. „@KONZEPT-CURSOR-WEBSEITE.md Abschnitt 1.14“ verweisen. Die YAML-Blöcke können 1:1 als Dateien angelegt werden.

---

## 2. Cursor-Workflow: Phasen des Aufbaus

*Reihenfolge: erst Backend, dann Frontend, dann Visualisierung. Siehe Abschnitt 1.*

---

### 2.0 Phasen-Check: Abhängigkeiten, Risiken & Vorbereitungen

Damit keine Phase an versteckten Abhängigkeiten oder Technik-Fallstricken scheitert, sind hier die kritischen Punkte gebündelt. **Vor dem Start einer Phase** die zugehörigen Einträge prüfen; **bei Problemen** zuerst hier nachsehen.

---

#### Abhängigkeiten zwischen Phasen

| Phase | Braucht abgeschlossen | Wichtig für |
|-------|------------------------|-------------|
| 1 | — | Ordner, Backend läuft in Docker, Port 8000, /health |
| 2 | Phase 1 | CRUD + DB; Backend muss laufen, DB-Pfad/Volume klären |
| 3 | Phase 1 (Backend-URL), Phase 2 (API-Contract) | Frontend baut gegen echte API; CORS + VITE_API_URL früh setzen |
| 4 | Phase 3 | Layout/Routing baut auf bestehenden Routes auf |
| 5 | Phase 2 + 3 + 4 | Timeline/Baum/Detail brauchen API-Client und Layout |
| 6 | Phase 5 | Abhaken/Fortschritt/Drag bauen auf bestehenden Views auf |
| 7 | Phase 1–6 | Lint/Workflows brauchen existierende Ordner und Skripte |
| 8 | Phase 1–7 | Deployment baut auf funktionierendem Docker + Env auf |

**Faustregel:** Phase 2 (CRUD) sollte **vor** dem Frontend-Bau (Phase 3) stehen, damit der API-Client von Anfang an gegen echte Endpunkte geht. Optional: Phase 3.1–3.3 (Vite, Tailwind, Routing) parallel zu Phase 2, API-Client (3.4) aber erst nach 2.4.

---

#### Risiken & Vorbereitungen nach Phase

**Phase 1**

- **docker-compose:** In Phase 1 **nur** den Backend-Service definieren. Einen Frontend-Service erst in Phase 3.6 hinzufügen, sonst schlägt `docker compose up --build` fehl (kein Frontend-Dockerfile).
- **CORS:** In Phase 1 reicht z. B. `allow_origins=["*"]` oder `allow_origins=["http://localhost:5173","http://localhost"]`. In Phase 3 und 8 für Produktion auf konkrete Origins einschränken.
- **Port:** Backend in Docker auf **8000** exponieren; in `docker-compose` `ports: ["8000:8000"]` für den Backend-Service.
- **requirements.txt:** Von Anfang an **pydantic** und Versionen wie in Konzept 1.13 eintragen (nicht nur fastapi, uvicorn, sqlalchemy).

**Phase 2**

- **SQLite-Pfad:** Backend soll DB-Pfad aus Umgebungsvariable lesen (z. B. `DB_PATH` oder `DATABASE_URL`), Default z. B. `./database.db`. In Docker später Volume z. B. `/app/data` und `DB_PATH=/app/data/database.db`, damit Daten persistent sind.
- **Tabellen anlegen:** Beim ersten Start `Base.metadata.create_all(engine)` aufrufen, damit die Tabelle `ziel` existiert.
- **Hierarchisch laden:** Klarheit schaffen: z. B. `GET /ziele?tree=1` oder `GET /ziele/tree` für Baum; flache Liste über `GET /ziele`.

**Phase 3**

- **Vite-Version:** Konzept nutzt Vite 5.4 (Konzept 1.13). Nach `npm create vite@latest …` in `package.json` prüfen; bei Vite 6/7 ggf. auf `"vite": "^5.4"` zurückstufen oder Node-Version anpassen.
- **VITE_API_URL und CORS (wichtig):**  
  - **Lokal (npm run dev):** Frontend auf 5173, Backend auf 8000. `VITE_API_URL=http://localhost:8000`. CORS im Backend: `allow_origins=["http://localhost:5173"]`.  
  - **Docker (Frontend wird auf Port 80 ausgeliefert):** Browser öffnet z. B. `http://localhost` (Frontend). API-Aufrufe gehen vom Browser aus → Backend muss unter einer für den Browser erreichbaren URL laufen, z. B. `http://localhost:8000`. Beim Build des Frontend-Images also `VITE_API_URL=http://localhost:8000` als Build-Arg setzen (oder spätere Produktions-URL).  
  - **Produktion:** `VITE_API_URL` = öffentliche Backend-URL (z. B. `https://api.meinedomain.de`). CORS im Backend auf diese Frontend-Origin beschränken.
- **Frontend-Dockerfile:** `npm ci` verlangt **package-lock.json**. Nach dem Anlegen des Vite-Projekts einmal `npm install` im Frontend ausführen, damit die Lock-Datei existiert.

**Phase 5**

- **vis-timeline:** API liefert z. B. `start_datum` / `end_datum` (Snake Case). vis-timeline erwartet oft `start` / `end`. Im Frontend die API-Daten vor der Übergabe an die Timeline auf `start`/`end` mappen (oder Aliase im Backend).
- **Zielbaum-Paket:** Im Code **@xyflow/react** (React Flow v12) verwenden, **nicht** das alte Paket `reactflow` 11.x. Konzept 1.6/1.13.

**Phase 6**

- **Fortschritt:** Entweder (a) Backend berechnet Fortschritt und liefert ihn in `GET /ziele/{id}` oder in einem eigenen Feld mit, oder (b) Frontend berechnet aus `children` und deren Status. Einmal festlegen und in API-Client + UI konsequent nutzen.
- **Drag & Drop:** vis-timeline und @xyflow/react bringen eigene Drag-Events. Nach Verschieben (Datum oder parent_id) die Änderung per PUT/PATCH an die API schicken.

**Phase 7**

- **Frontend-CI:** Workflow nutzt `cache-dependency-path: frontend/package-lock.json`. Bei **pnpm** bzw. **yarn** auf `pnpm-lock.yaml` bzw. `yarn.lock` und ggf. `pnpm install` / `yarn install` umstellen.
- **Backend-CI:** `pytest backend/` findet Tests unter `backend/` bzw. `backend/tests/`. Bis Tests existieren, Schritt mit `continue-on-error: true` lassen. Später ggf. `pytest.ini` oder `pyproject.toml` im Backend mit Testpfad setzen.

**Phase 8**

- **SQLite in Docker:** Backend-Container braucht ein **Volume** für die DB (z. B. `backend_data:/app/data`) und Umgebungsvariable `DB_PATH=/app/data/database.db` (oder wie in Phase 2 vereinbart). Ohne Volume geht die DB beim Neustart verloren.

---

#### Kurz-Check vor Phase-Start

- **Phase 1:** Ordner `backend/` und `frontend/` (mit src/components, src/pages) angelegt? Nur Backend in docker-compose?
- **Phase 2:** Backend startet, /health antwortet? DB-Pfad und Tabellen-Init geklärt?
- **Phase 3:** API-Endpunkte (mind. GET /ziele, POST /ziele) existieren? CORS und VITE_API_URL für Dev/Docker geplant?
- **Phase 5:** API-Client (getGoals, getGoal) und Routen (/tree, /ziel/:id) vorhanden? Paket @xyflow/react, nicht reactflow?
- **Phase 7:** `frontend/package-lock.json` vorhanden (npm)? Backend hat requirements.txt mit allen Paketen?

---

### Phase 1: Projektstruktur, Backend-Grundgerüst & Docker

**Ziel:** Ordner `backend/` und `frontend/` existieren, Backend läuft (lokal oder in Docker), GET /health antwortet. Die App ist von Anfang an containerisiert.

| Schritt | Aufgabe | Cursor-Prompt-Idee |
|--------|---------|---------------------|
| 1.1 | Ordnerstruktur anlegen | *„Erstelle die Struktur backend/ und frontend/src/components, frontend/src/pages wie in KONZEPT-CURSOR-WEBSEITE.md.“* |
| 1.2 | FastAPI-Projekt | *„Erstelle backend/main.py mit FastAPI, CORS (z. B. allow_origins=['*'] oder ['http://localhost:5173']), und GET /health. Nutze uvicorn, Port 8000.“* |
| 1.3 | Abhängigkeiten | *„Lege backend/requirements.txt an: fastapi, uvicorn, sqlalchemy, pydantic — Versionen wie in Konzept 1.13.“* |
| 1.4 | Backend-Dockerfile | *„Erstelle backend/Dockerfile: FROM python:3.12-slim, requirements installieren, uvicorn starten auf Port 8000.“* |
| 1.5 | docker-compose | *„Erstelle docker-compose.yml im Root **nur mit Backend-Service** (build: ./backend, ports: 8000:8000). Frontend-Service erst in Phase 3.6 hinzufügen.“* |
| 1.6 | App in Docker starten | Im Terminal: `docker compose up --build` — Backend unter http://localhost:8000, GET /health prüfen |

**Cursor-Tipps:** Mit @KONZEPT-CURSOR-WEBSEITE.md referenzieren. **Vorbereitung:** Siehe Abschnitt 2.0 (docker-compose nur Backend, CORS, Port 8000).

---

### Phase 2: Datenmodell & CRUD-API

**Ziel:** SQLite-Datenbank, Pydantic-Modelle, CRUD-Endpunkte für Ziele (inkl. hierarchisch laden).

| Schritt | Aufgabe | Cursor-Prompt-Idee |
|--------|---------|---------------------|
| 2.1 | DB-Modell | *„Erstelle backend/models.py: SQLAlchemy-Modell Ziel mit id, titel, beschreibung, start_datum, end_datum, status, parent_id. SQLite. DB-Pfad aus Umgebungsvariable (z. B. DB_PATH), Default ./database.db.“* |
| 2.2 | Pydantic-Schemas | *„Pydantic-Modelle für Ziel (Create, Read, ReadWithChildren). parent_id optional.“* |
| 2.3 | CRUD-Endpunkte | *„CRUD in main.py: POST /ziele, GET /ziele (flach; hierarchisch z. B. über GET /ziele?tree=1 oder GET /ziele/tree), GET /ziele/{id}, PUT /ziele/{id}, PATCH /ziele/{id} (Status), DELETE /ziele/{id}. Beim App-Start Base.metadata.create_all(engine), damit Tabelle existiert.“* |
| 2.4 | API testen | Browser/Postman: GET /ziele, POST /ziele mit JSON-Body |

**Cursor-Tipps:** „Lade Ziele hierarchisch: Kinder per parent_id, als Baum zurückgeben.“ **Vorbereitung:** Siehe Abschnitt 2.0 (DB-Pfad, Tabellen-Init, hierarchisch laden).

---

### Phase 3: Frontend-Grundgerüst (Vite + React) & Docker

**Ziel:** React-App startet (lokal und in Docker), TailwindCSS läuft, Axios vorbereitet, Routing zu Timeline / Baum / Detail. Frontend-Container baut und served die App.

| Schritt | Aufgabe | Cursor-Prompt-Idee |
|--------|---------|---------------------|
| 3.1 | Vite + React | *„Erstelle frontend mit Vite 5, React, TypeScript: npm create vite@5 frontend -- --template react-ts. Versionen wie Konzept 1.13; nach dem Anlegen package-lock.json per npm install erzeugen.“* |
| 3.2 | Tailwind + Axios | *„TailwindCSS 3.4 und Axios ins Frontend einbauen. API-Base-URL aus import.meta.env.VITE_API_URL (Dev: http://localhost:8000).“* |
| 3.3 | Routing | *„React Router: / (Timeline), /tree (Zielbaum), /ziel/:id (Detail). Layout mit Tabs oder Sidebar.“* |
| 3.4 | API-Client | *„Erstelle src/api/goals.ts: getGoals(), getGoal(id), createGoal(), updateGoal(), updateStatus(). Base-URL aus VITE_API_URL.“* |
| 3.5 | Frontend-Dockerfile | *„Erstelle frontend/Dockerfile: Multi-Stage – Stage 1: FROM node:20-alpine, npm ci, npm run build (Build-Arg VITE_API_URL=http://localhost:8000). Stage 2: nginx, Build-Artefakte kopieren, Port 80.“* |
| 3.6 | Frontend in docker-compose | *„Erweitere docker-compose.yml um Service frontend (build: ./frontend, ports: 80:80). Beim Build VITE_API_URL=http://localhost:8000 setzen, damit der Browser Backend erreicht. CORS im Backend auf http://localhost und http://localhost:5173 erweitern.“* |

**Cursor-Tipps:** **Vorbereitung:** Siehe Abschnitt 2.0 (VITE_API_URL/CORS für Lokal vs. Docker). Lokal: Frontend 5173, Backend 8000, CORS für 5173. Docker: Browser ruft Frontend auf localhost:80 und Backend auf localhost:8000; VITE_API_URL beim Frontend-Build = http://localhost:8000.

---

### Phase 4: Layout & Navigation

**Ziel:** Gemeinsames Layout, Umschaltung Timeline / Baum / Detail, konsistentes Styling.

| Schritt | Aufgabe | Cursor-Prompt-Idee |
|--------|---------|---------------------|
| 4.1 | Layout-Komponenten | *„Header mit App-Titel, Nav-Links: Timeline, Zielbaum. Main-Bereich für Outlet.“* |
| 4.2 | Tailwind-Basis | *„Layout mit Tailwind: saubere Abstände, lesbare Typo. Kein Gamification-Look.“* |
| 4.3 | Responsiv | *„Nav und Layout auf Desktop/Tablet/Mobile nutzbar.“* |

---

### Phase 5: Timeline & Zielbaum & Detail

**Ziel:** Timeline-View (vis-timeline), Baum-View (react-flow), Detail-View mit Bearbeiten.

| Schritt | Aufgabe | Cursor-Prompt-Idee |
|--------|---------|---------------------|
| 5.1 | Timeline | *„Integriere vis-timeline 8.5 (Konzept 1.13). Ziele von API laden; API liefert start_datum/end_datum → für vis-timeline auf start/end mappen. Items mit Farben nach Status. Zoom. Container per useRef, Timeline in useEffect.“* |
| 5.2 | Klick auf Ziel | *„Klick auf Timeline-Item öffnet Detail (/ziel/:id) oder zeigt Unterziele.“* |
| 5.3 | Zielbaum | *„Seite /tree: Paket @xyflow/react (React Flow v12) verwenden, nicht reactflow 11.x. Knoten = Ziel, Kanten = parent_id. Klick → Detail.“* |
| 5.4 | Detailansicht | *„Seite /ziel/:id: Titel, Beschreibung, Datum, Status. Button ‚Abhaken‘ → PATCH Status. Optional: Unterziele auflisten.“* |
| 5.5 | Fortschritt (optional) | *„Recharts: Fortschritt pro Ziel/Unterziele als Balken oder Pie.“* |

**Cursor-Tipps:** Sieh @KONZEPT-CURSOR-WEBSEITE.md Abschnitt 1.6 und 1.7 – Timeline, Farben nach Status, Zoom. **Vorbereitung:** Abschnitt 2.0 (API-Mapping start_datum→start, Paket @xyflow/react).

---

### Phase 6: Interaktion & Logik

**Ziel:** Abhaken, Fortschritt berechnen, Drag & Drop, ggf. JSON-Import.

| Schritt | Aufgabe | Cursor-Prompt-Idee |
|--------|---------|---------------------|
| 6.1 | Abhaken | *„Checkbox/Button ‚Erledigt‘ → PATCH /ziele/{id} mit status=erledigt. UI aktualisieren.“* |
| 6.2 | Fortschritt | *„Fortschritt: entweder Backend liefert ihn (z. B. in GET /ziele/{id}) oder Frontend berechnet aus children. Einmal festlegen und in Detail/Recharts anzeigen.“* |
| 6.3 | Drag & Drop | *„vis-timeline- und @xyflow/react-eigene Drag-Events nutzen; nach Verschieben (Datum/parent_id) PUT oder PATCH an API senden.“* |
| 6.4 | JSON-Import (optional) | *„Endpoint POST /ziele/import: JSON wie in KONZEPT 1.8. Ziele und subgoals anlegen.“* |

---

### Phase 7: Qualität & Feinschliff

**Ziel:** Linting, konsistente Fehlerbehandlung, ggf. A11y. Plus: Versionierung (Git, Commit-Standards, GitHub Actions) wie in Konzept 1.14.

| Schritt | Aufgabe | Cursor-Prompt-Idee |
|--------|---------|---------------------|
| 7.1 | ESLint/Prettier (Frontend) | *„ESLint und Prettier im Frontend einrichten.“* |
| 7.2 | Ruff/Black (Backend) | *„Ruff oder Black für Python im Backend.“* |
| 7.3 | Fehlerbehandlung | *„API-Fehler im Frontend anzeigen (Toast oder Inline).“* |
| 7.4 | Accessibility | *„Kontraste, fokussierbare Buttons, ARIA wo nötig.“* |
| 7.5 | Versionierung & GitHub | *„Lege .github/workflows/ an: backend-ci.yml, frontend-ci.yml (und optional docker-check.yml) wie in KONZEPT Abschnitt 1.14. Bei npm: cache-dependency-path frontend/package-lock.json; bei pnpm/yarn anpassen. Commit-Standards: Conventional Commits (feat/fix/docs/chore, scope backend|frontend|docker|docs).“* |

---

### Phase 8: Deployment (Docker-first, plattformunabhängig)

**Ziel:** Die gleichen Docker-Images laufen lokal und auf dem Ziel-Server. Plattformwechsel = nur neuer Host, gleiche `docker compose up`- bzw. Container-Orchestrierung.

| Schritt | Aufgabe | Cursor-Prompt-Idee |
|--------|---------|---------------------|
| 8.1 | Docker-Build prüfen | *„docker compose build und docker compose up sollen Backend + Frontend ohne Fehler starten. Backend: Volume z. B. backend_data:/app/data, Umgebungsvariable DB_PATH=/app/data/database.db (wie in Phase 2 vorbereitet).“* |
| 8.2 | Umgebungsvariablen | *„API-URL im Frontend aus VITE_API_URL (Build-Zeit). CORS im Backend auf Frontend-URL/Origin der Ziel-Plattform.“* |
| 8.3 | Produktions-Build | *„Frontend baut mit VITE_API_URL=https://api.meinedomain.de (oder relativer Pfad). Backend nutzt env für DB-Pfad, CORS-Origins.“* |
| 8.4 | Deployment auf beliebiger Plattform | *„README: Start mit docker compose up -d. Für Cloud: gleiche Images z. B. auf VM, AWS ECS, Azure Container Instances, Kubernetes – nur andere Orchestrierung, kein App-Code ändern.“* |

**Vorteil Docker:** Einmal `docker compose up` getestet → auf jedem Linux/Windows-Server mit Docker dasselbe Verhalten. **Vorbereitung:** Siehe Abschnitt 2.0 (SQLite-Volume, DB_PATH).

---

## 3. Cursor-Befehle & Gewohnheiten

- **@-Erwähnungen:** Dateien/Ordner mit @ einbinden, damit Cursor Kontext hat.
- **Kurz und stückweise:** Ein großes „Baue die ganze Seite“-Prompt ist schwer steuerbar; besser: „Baue jetzt nur Header und Navigation“.
- **Fehler beheben:** Fehlermeldung oder Linter-Output kopieren und z. B. „Behebe diesen Fehler in [Datei].“ prompten.
- **Refactoring:** „Fasse die Logik für Ziele in einen eigenen Hook/Service zusammen.“

---

## 4. Checkliste „Goal Tracker fertig“

- [ ] **Docker:** `docker compose up --build` startet Backend + Frontend ohne Fehler. SQLite-Daten per Volume persistent.
- [ ] Backend (FastAPI + SQLite) läuft im Container, CRUD für Ziele inkl. hierarchisch.
- [ ] Frontend (Vite + React + Tailwind) läuft im Container, API-Client (Axios) verbunden (VITE_API_URL auf Backend-URL).
- [ ] Timeline-View (vis-timeline) zeigt Ziele mit Farben nach Status, Zoom.
- [ ] Zielbaum (react-flow) zeigt Hierarchie, Klick öffnet Detail.
- [ ] Detailansicht: Bearbeiten, Abhaken, Unterziele sichtbar.
- [ ] Fortschritt (automatisch oder Recharts) funktioniert.
- [ ] Optional: Drag & Drop, JSON-Import.
- [ ] Keine groben Linter-Fehler, Backend- und Frontend-Build laufen.
- [ ] **Versionierung:** Commits nach Conventional Commits (Konzept 1.14), GitHub Actions für Backend-CI und Frontend-CI (optional Docker-Check) laufen.
- [ ] **Phasen-Check:** Vor Phase-Start Abschnitt 2.0 (Abhängigkeiten, Risiken, Vorbereitungen) berücksichtigt; keine offenen Fallstricke (CORS, VITE_API_URL, DB-Pfad/Volume, Paket @xyflow/react).
- [ ] Deployment plattformunabhängig: gleiche Docker-Images auf neuem Host lauffähig, CORS/URL für Ziel-Plattform angepasst.

---

## 5. Deine Notizen & Änderungen

*Hier kannst du eigene Notizen, Links zu Referenzseiten oder spätere Anpassungen festhalten.*

- 
- 
- 

---

*Konzept: Goal Tracker mit FastAPI + React, Timeline, Unterzielen. Abschnitt 1 ist ausgefüllt; Phasen 1–8 nacheinander mit Cursor abarbeiten.*
