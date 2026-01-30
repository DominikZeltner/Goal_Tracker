# GitHub Workflows (CI) – Übersicht & Erweiterungsoptionen

Dieses Repository nutzt GitHub Actions Workflows unter `.github/workflows/`, um bei Änderungen automatisch zu prüfen, ob **Backend**, **Frontend** und **Docker-Setup** konsistent sind.

Die Workflows sind bewusst **minimal** gehalten (siehe Konzept) und können später schrittweise erweitert werden.

---

## Backend CI (`.github/workflows/backend-ci.yml`)

### Zweck
- Stellt sicher, dass Backend-Änderungen **installierbar** sind und grundlegende Qualitätschecks laufen.

### Trigger
- **Push** auf `main`, wenn sich `backend/**` oder die Workflow-Datei ändert
- **Pull Request** auf `main`, wenn sich `backend/**` oder die Workflow-Datei ändert

### Was passiert (vereinfacht)
- Repository auschecken
- Python (aktuell `3.12`) einrichten
- Dependencies via `pip install -r backend/requirements.txt` installieren
- Linting mit **Ruff**: `ruff check backend/`
- Optional Tests: `pytest backend/ -v` (aktuell mit `continue-on-error: true`, bis es Tests gibt)

### Typische Voraussetzungen
- `backend/requirements.txt` existiert und ist installierbar
- Falls Tests aktiv sind: `pytest` (oder via requirements) verfügbar und Tests laufen lokal

---

## Frontend CI (`.github/workflows/frontend-ci.yml`)

### Zweck
- Stellt sicher, dass Frontend-Änderungen **bauen** (Build) und **linten** (Code-Qualität).

### Trigger
- **Push** auf `main`, wenn sich `frontend/**` oder die Workflow-Datei ändert
- **Pull Request** auf `main`, wenn sich `frontend/**` oder die Workflow-Datei ändert

### Was passiert (vereinfacht)
- Repository auschecken
- Node.js (aktuell `20`) einrichten
- npm Cache aktivieren (über `frontend/package-lock.json`)
- Build: `npm ci && npm run build` im Ordner `frontend/`
- Lint: `npm run lint` im Ordner `frontend/` (aktuell mit `continue-on-error: true`, bis ESLint stabil ist)

### Typische Voraussetzungen
- `frontend/package.json` existiert
- i. d. R. `frontend/package-lock.json` (wenn npm verwendet wird)
- `npm run build` und `npm run lint` sind definiert (Scripts)

---

## Docker Check (`.github/workflows/docker-check.yml`)

### Zweck
- Prüft, ob das Projekt per **Docker Compose** grundsätzlich **buildbar** ist.
- Optional: kurzer Start/Health-Check, um offensichtliche Laufzeitprobleme früh zu erkennen.

### Trigger
- **Push** auf `main` (ohne Pfad-Filter)
- **Pull Request** auf `main` (ohne Pfad-Filter)

### Was passiert (vereinfacht)
- Repository auschecken
- `docker compose build`
- Optionaler Start + einfacher Health-Check:
  - `docker compose up -d`
  - warten
  - `curl http://localhost:8000/health`
  - `docker compose down`
  - (Health-Check Schritt aktuell mit `continue-on-error: true`, falls es noch keinen `/health` Endpoint gibt)

### Typische Voraussetzungen
- `docker-compose.yml` (oder `compose.yaml`) ist vorhanden und korrekt
- Images bauen ohne externe Secrets (oder Secrets sind als GitHub Secrets/Vars eingerichtet)
- Wenn Health-Check genutzt wird: Service ist auf `localhost:8000` erreichbar oder URL/Port werden angepasst

---

## Mögliche Erweiterungsoptionen (ohne Implementierung)

Die folgenden Optionen sind **Ideen**, die je nach Reifegrad/Bedarf ergänzt werden können. Hier wird nur beschrieben, *was* möglich wäre – nicht umgesetzt.

### Allgemein (für alle Workflows)
- **Manueller Start**: `workflow_dispatch` hinzufügen, um Workflows per Klick auszuführen.
- **Zeitplan**: `schedule` (Cron) für regelmäßige Checks (z. B. nightly).
- **Concurrency**: laufende Workflows pro Branch/PR automatisch abbrechen (z. B. bei neuen Commits).
- **Permissions härten**: `permissions:` minimal setzen (z. B. `contents: read`), Security Best Practice.
- **Paths/Ignore feiner steuern**: zusätzliche `paths`/`paths-ignore`, um unnötige Runs zu vermeiden.
- **Matrix Builds**: mehrere Versionen testen (z. B. Python 3.11/3.12, Node 18/20).
- **Caching**: Abhängigkeits-Caches (pip/npm) optimieren, Laufzeiten reduzieren.
- **Artefakte**: Build-Artefakte hochladen (z. B. Frontend `dist/`, Testreports).
- **Reports**: Test-/Coverage-Reports als PR-Annotationen/Checks ausgeben.
- **Benachrichtigungen**: Slack/Teams/Email (über Apps/Actions) bei Failures.
- **Security Scans**: z. B. Dependency Audit, SAST, Secret Scanning, SBOM (je nach Ziel).

### Backend CI – zusätzliche Checks
- **Ruff erweitern**: zusätzlich `ruff format` (oder Format-Check) als Gate.
- **Typing**: `mypy` oder `pyright` für Typprüfungen.
- **Tests als Pflicht**: `continue-on-error` entfernen, sobald Tests existieren.
- **Coverage**: `pytest --cov` + Mindest-Coverage-Schwelle.
- **Separate Jobs**: Lint und Tests getrennt (schnellere Feedback-Loops, parallele Ausführung).
- **Pinned Tooling**: Ruff/Pytest Versionen pinnen (stabilere CI-Ergebnisse).
- **Pre-Commit in CI**: `pre-commit run --all-files` (einheitliche lokale/CI Checks).

### Frontend CI – zusätzliche Checks
- **ESLint als Pflicht**: `continue-on-error` entfernen, sobald ESLint/Config stabil ist.
- **Typecheck**: `tsc --noEmit` (bei TypeScript) als eigener Schritt.
- **Tests**: Unit/Component Tests (z. B. Vitest/Jest) + Coverage.
- **Format-Check**: Prettier (check-only) oder Prettier via pre-commit.
- **Alternative Package Manager**: pnpm/yarn (Cache/Lockfile entsprechend anpassen).
- **Bundle-Analyse**: optionales Bundle-Reporting (Größe, Regressionen).

### Docker Check – zusätzliche Checks
- **Buildx / Multi-Arch**: Images für mehrere Architekturen bauen (z. B. amd64/arm64).
- **Docker Layer Cache**: beschleunigte Builds mit BuildKit/Cache (Actions + Registry Cache).
- **Compose Smoke Tests**: definierte Smoke-Requests gegen App (mehr als nur `/health`).
- **Healthchecks via Compose**: Container Healthchecks nutzen und in CI warten, bis `healthy`.
- **Linting**: Dockerfile/Compose-Linting (Hadolint, yamllint, etc.).
- **Sicherheitschecks**: Image Scans (Trivy o. ä.), SBOM Erstellung.
- **Nur bei relevanten Änderungen**: `paths:` Filter für Docker-Dateien (`Dockerfile*`, `docker-compose*`, `infra/**`).

---

## Hinweis zur Fehlersuche
- Ein Workflow kann **syntaktisch korrekt** sein, aber **trotzdem fehlschlagen**, wenn Verzeichnisse/Lockfiles fehlen (z. B. `frontend/`) oder Docker Compose noch nicht lauffähig ist.
- Für einen schrittweisen Aufbau ist es normal, dass man einzelne Schritte vorübergehend mit `continue-on-error` entschärft und später „hart“ macht.
