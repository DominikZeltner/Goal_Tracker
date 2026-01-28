# Goal Tracker

Eine einfache, interaktive Ziel-Webseite mit Timeline, Unterzielen und Visualisierung.

---

## Stack

| Schicht      | Technologie   |
|-------------|---------------|
| Backend     | Python + FastAPI |
| Frontend    | React (Vite)  |
| Daten       | SQLite        |
| Laufzeit    | **Docker**    |

---

## Schnellstart

```bash
docker compose up --build
```

- **Backend:** http://localhost:8000  
- **Frontend:** http://localhost (nach Phase 3.6)

---

## Funktionen

- **Timeline** – Ziele als Balken auf der Zeitachse (vis-timeline)
- **Zielbaum** – Hierarchie mit Unterzielen (@xyflow/react)
- **Detailansicht** – Bearbeiten, Abhaken, Fortschritt
- **REST-API** – CRUD für Ziele inkl. hierarchischer Struktur (`parent_id`)

---

## Projektstruktur

```
/backend     → FastAPI, SQLite, CRUD
/frontend    → Vite + React, Tailwind, Axios
docker-compose.yml
```

Detaillierte Phasen, Tech-Versionen und Cursor-Prompts: **KONZEPT-CURSOR-WEBSEITE.md**.

---

## Commit-Standards

Wir verwenden **Conventional Commits** im Format **`<type>(<scope>): <Beschreibung>`**.  
Die Beschreibung steht in Kleinbuchstaben, ohne Punkt am Ende, im Imperativ (z. B. „Add …“, „Fix …“).

**Types:** `feat` (neue Funktion), `fix` (Bugfix), `docs` (nur Dokumentation), `style` (Formatierung), `refactor` (Umstrukturierung), `test` (Tests), `chore` (Build, Dependencies, Tooling).

**Scopes:** `backend`, `frontend`, `docker`, `docs` – je nach geänderter Schicht oder Rolle.

Beispiele: `feat(backend): POST /ziele mit parent_id` · `fix(frontend): Timeline-Zoom auf Mobile` · `docs(docs): Commit-Standards ergänzt`

Vollständige Regeln, Beispiele und GitHub-Workflows siehe **KONZEPT-CURSOR-WEBSEITE.md**, Abschnitt 1.14.
