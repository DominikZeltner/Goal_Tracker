# Goal Tracker

Eine moderne Webanwendung zur Verwaltung hierarchischer Ziele mit Timeline- und Baumansicht.

**Status:** In Weiterentwicklung (Kernfunktionen umgesetzt, Roadmap aktiv)

## 🚀 Features

- **Timeline-Ansicht**: Visualisierung aller Ziele auf einer interaktiven Zeitachse
- **Zielbaum-Ansicht**: Hierarchische Darstellung von Zielen und Unterzielen
- **Drag & Drop**: Einfaches Verschieben von Zielen und Ändern von Beziehungen
- **Status-Tracking**: Verfolgung des Fortschritts (offen, in Arbeit, erledigt)
- **Änderungshistorie**: Nachvollziehbarkeit pro Ziel
- **Kommentare**: Austausch direkt am Ziel
- **Responsive Design**: Optimiert für Desktop und Mobile
- **Docker-Ready**: Einfaches Deployment mit Docker Compose

## 🛠️ Technologie-Stack

### Backend
- **FastAPI** (Python 3.12)
- **SQLAlchemy** (ORM)
- **SQLite** (Datenbank)
- **Uvicorn** (ASGI Server)

### Frontend
- **React 18** mit TypeScript
- **Vite 5** (Build-Tool)
- **TailwindCSS 3.4** (Styling)
- **React Router 6** (Routing)
- **vis-timeline 8.5** (Timeline-Visualisierung)
- **@xyflow/react 12** (Flow-Diagramme)
- **Axios** (HTTP-Client)

## 📋 Voraussetzungen

- **Docker** und **Docker Compose** installiert
- **Node.js 20+** und **npm** (nur für lokale Entwicklung)
- **Python 3.12+** (nur für lokale Entwicklung)

## 🚀 Schnellstart mit Docker

### 1. Repository klonen

```bash
git clone https://github.com/DominikZeltner/Goal_Tracker.git
cd Goal_Tracker
```

### 2. Anwendung starten

```bash
docker compose up -d
```

Die Anwendung ist nun verfügbar:
- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **API-Dokumentation**: http://localhost:8000/docs

### 3. Anwendung stoppen

```bash
docker compose down
```

**Wichtig**: Die Daten bleiben in einem Docker-Volume gespeichert und gehen beim Stoppen nicht verloren.

### 4. Daten vollständig löschen (inkl. Volume)

```bash
docker compose down -v
```

## 🔧 Entwicklung

### Backend lokal entwickeln

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend läuft auf http://localhost:8000

### Frontend lokal entwickeln

```bash
cd frontend
npm install
npm run dev
```

Frontend läuft auf http://localhost:5173

### Linting

**Frontend:**
```bash
cd frontend
npm run lint        # ESLint prüfen
npm run lint:fix    # ESLint auto-fix
npm run format      # Prettier formatieren
npm run format:check # Prettier prüfen
```

**Backend:**
```bash
cd backend
pip install ruff
ruff check .        # Ruff prüfen
ruff check --fix .  # Ruff auto-fix
ruff format .       # Ruff formatieren
```

## 📚 Dokumentation

- **Quickstart**: [DEV_QUICKSTART.md](DEV_QUICKSTART.md)
- **Development-Setup**: [DEV_SETUP.md](DEV_SETUP.md)
- **Befehle (Single Source of Truth)**: [COMMANDS_CHEATSHEET.md](COMMANDS_CHEATSHEET.md)
- **Deployment-Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Production-Checkliste**: [PRODUCTION_DEPLOYMENT_CHECKLIST.md](PRODUCTION_DEPLOYMENT_CHECKLIST.md)
- **Backup/Restore**: [BACKUP_README.md](BACKUP_README.md)
- **Dokumentationsrichtlinie**: [DOCS_STYLE_GUIDE.md](DOCS_STYLE_GUIDE.md)
- **Roadmap**: [FEATURE_ROADMAP.md](../FEATURE_ROADMAP.md)
- **Nächste Schritte**: [NAECHSTE_SCHRITTE.md](NAECHSTE_SCHRITTE.md)

## 🌐 Production Deployment

### Production-Build (Kurzform)

```bash
docker compose -f docker-compose.prod.yml up -d
```

**Details zu Umgebungsvariablen, CORS und Production-Setups:**  
Siehe [DEPLOYMENT.md](DEPLOYMENT.md)

## 🗄️ Datenbank

Die SQLite-Datenbank wird im Docker-Volume `backend_data` gespeichert:
- Pfad im Container: `/app/data/database.db`
- Automatisch erstellt beim ersten Start
- Persistent über Container-Neustarts hinweg

### Datenbank-Backup erstellen
Siehe [BACKUP_README.md](BACKUP_README.md)

### Datenbank wiederherstellen
Siehe [BACKUP_README.md](BACKUP_README.md)

## 📦 Deployment auf Cloud-Plattformen

Die Docker-Container sind plattformunabhängig. Für Details siehe [DEPLOYMENT.md](DEPLOYMENT.md).

## 🏗️ Projektstruktur

```
Goal_Tracker/
├── backend/                 # FastAPI Backend
│   ├── main.py             # API Endpoints
│   ├── models.py           # SQLAlchemy Models
│   ├── schemas.py          # Pydantic Schemas
│   ├── requirements.txt    # Python Dependencies
│   ├── Dockerfile          # Backend Docker Image
│   └── pyproject.toml      # Ruff Configuration
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── api/           # API Client
│   │   ├── components/    # React Components
│   │   ├── pages/         # Page Components
│   │   └── utils/         # Utility Functions
│   ├── package.json       # NPM Dependencies
│   ├── Dockerfile         # Frontend Docker Image
│   ├── nginx.conf         # Nginx Configuration
│   ├── .prettierrc        # Prettier Configuration
│   └── eslint.config.js   # ESLint Configuration
├── .github/workflows/     # CI/CD Workflows
├── docker-compose.yml     # Development Compose
├── docker-compose.prod.yml # Production Compose
└── README.md              # Diese Datei
```

## 🧪 Testing

CI/CD-Workflows prüfen automatisch:
- ESLint (Frontend)
- TypeScript Compilation
- Ruff Linting (Backend)
- Docker Build

## 📝 Commit-Standards

Das Projekt verwendet [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(frontend): neue Timeline-Komponente
fix(backend): CORS-Konfiguration korrigiert
docs: README aktualisiert
chore(deps): Dependencies aktualisiert
```

## 🤝 Contributing

1. Fork das Repository
2. Erstelle einen Feature-Branch (`git checkout -b feat/amazing-feature`)
3. Commit deine Änderungen (`git commit -m 'feat: add amazing feature'`)
4. Push zum Branch (`git push origin feat/amazing-feature`)
5. Öffne einen Pull Request

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert.

## 👤 Autor

Dominik Zeltner - [GitHub](https://github.com/DominikZeltner)

## 🙏 Danksagungen

- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://react.dev/)
- [vis-timeline](https://visjs.github.io/vis-timeline/)
- [@xyflow/react](https://reactflow.dev/)
- [TailwindCSS](https://tailwindcss.com/)
