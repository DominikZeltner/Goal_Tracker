# Contributing zum Goal Tracker

Vielen Dank für dein Interesse an diesem Projekt! 🎉

## 📋 Inhaltsverzeichnis

- [Code of Conduct](#code-of-conduct)
- [Wie kann ich beitragen?](#wie-kann-ich-beitragen)
- [Development Setup](#development-setup)
- [Commit-Standards](#commit-standards)
- [Pull Request Process](#pull-request-process)
- [Code-Stil](#code-stil)
- [Testing](#testing)

## 🤝 Code of Conduct

- Sei respektvoll und konstruktiv
- Akzeptiere konstruktive Kritik
- Fokussiere dich auf das Beste für das Projekt
- Zeige Empathie gegenüber anderen Community-Mitgliedern

## 🚀 Wie kann ich beitragen?

### Bugs melden

Wenn du einen Bug findest:
1. Prüfe, ob der Bug bereits als Issue existiert
2. Falls nicht, erstelle ein neues Issue mit:
   - Klare Beschreibung des Problems
   - Schritte zur Reproduktion
   - Erwartetes vs. tatsächliches Verhalten
   - Screenshots (falls hilfreich)
   - Umgebung (OS, Browser, Docker-Version)

### Features vorschlagen

Feature-Requests sind willkommen! Bitte beschreibe:
- Das Problem, das das Feature lösen würde
- Deine vorgeschlagene Lösung
- Alternative Lösungen, die du in Betracht gezogen hast

### Code beitragen

1. Fork das Repository
2. Erstelle einen Feature-Branch
3. Implementiere deine Änderungen
4. Schreibe/aktualisiere Tests
5. Stelle sicher, dass alle Tests durchlaufen
6. Committe mit aussagekräftigen Messages
7. Pushe zu deinem Fork
8. Erstelle einen Pull Request

## 🛠️ Development Setup

### Voraussetzungen

- **Docker** & **Docker Compose** (empfohlen)
- **Node.js 20+** & **npm** (für Frontend)
- **Python 3.12+** (für Backend)
- **Git**

### Setup mit Docker

```bash
# Repository klonen
git clone https://github.com/DominikZeltner/Goal_Tracker.git
cd Goal_Tracker

# Starten
docker compose up -d

# Logs verfolgen
docker compose logs -f
```

### Setup ohne Docker

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 📝 Commit-Standards

Wir verwenden [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: Neue Funktion
- `fix`: Bugfix
- `docs`: Dokumentation
- `style`: Formatierung, fehlende Semikolons, etc.
- `refactor`: Code-Refactoring
- `test`: Tests hinzufügen/korrigieren
- `chore`: Build-Prozess, Dependencies, etc.
- `perf`: Performance-Verbesserung

### Scopes

- `frontend`: Frontend-Änderungen
- `backend`: Backend-Änderungen
- `docker`: Docker-Konfiguration
- `docs`: Dokumentation
- `ci`: CI/CD-Änderungen

### Beispiele

```bash
feat(frontend): add dark mode toggle
fix(backend): correct CORS configuration
docs: update deployment guide
chore(deps): update React to 18.3.1
refactor(frontend): extract timeline logic to custom hook
```

### Subject-Richtlinien

- Verwende Imperativ ("add" nicht "added")
- Beginne klein (lowercase)
- Kein Punkt am Ende
- Maximal 50 Zeichen

### Body (optional)

- Erkläre **warum** nicht **was**
- Verweise auf Issues: `Closes #123`

## 🔄 Pull Request Process

### Vor dem PR

1. **Rebase** auf den aktuellen `main`-Branch
2. **Linting** durchführen:
   ```bash
   # Frontend
   cd frontend && npm run lint && npm run format:check
   
   # Backend
   cd backend && ruff check .
   ```
3. **Build** prüfen:
   ```bash
   docker compose build
   ```
4. **Eigenen Code reviewen** - gehe deine Änderungen selbst durch

### PR erstellen

1. Gehe zu https://github.com/DominikZeltner/Goal_Tracker/pulls
2. Klicke "New Pull Request"
3. Wähle deinen Branch
4. Fülle die PR-Vorlage aus:
   - **Titel**: Folge Conventional Commits Format
   - **Beschreibung**: Was wurde geändert und warum?
   - **Screenshots**: Falls UI-Änderungen
   - **Testing**: Wie wurde getestet?
   - **Checklist**: Alle Punkte abhaken

### PR-Template

```markdown
## Beschreibung
<!-- Was wurde geändert und warum? -->

## Type
- [ ] Feature
- [ ] Bugfix
- [ ] Refactoring
- [ ] Dokumentation
- [ ] Chore

## Änderungen
<!-- Liste der wichtigsten Änderungen -->
- 
- 

## Screenshots
<!-- Falls UI-Änderungen -->

## Testing
<!-- Wie wurde getestet? -->
- [ ] Manuell getestet
- [ ] Unit Tests hinzugefügt
- [ ] Docker-Build erfolgreich

## Checklist
- [ ] Code folgt dem Projekt-Stil
- [ ] Selbst-Review durchgeführt
- [ ] Kommentare hinzugefügt (wo nötig)
- [ ] Dokumentation aktualisiert
- [ ] Keine neuen Warnings
- [ ] Tests durchlaufen
- [ ] Commit-Messages folgen Conventional Commits

## Related Issues
<!-- z.B. Closes #123 -->
```

### Review-Prozess

- Mindestens 1 Approval erforderlich
- CI muss grün sein
- Alle Kommentare müssen aufgelöst sein
- Merge durch Maintainer

## 🎨 Code-Stil

### Frontend (TypeScript/React)

**ESLint & Prettier:**
```bash
npm run lint:fix
npm run format
```

**Konventionen:**
- Functional Components mit Hooks
- TypeScript für alle neuen Files
- Props-Interfaces exportieren
- Aussagekräftige Komponentennamen
- Keine `any` Types (außer absolut notwendig)

**Beispiel:**
```typescript
interface ButtonProps {
  onClick: () => void;
  label: string;
  disabled?: boolean;
}

export default function Button({ onClick, label, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
```

### Backend (Python/FastAPI)

**Ruff:**
```bash
ruff check --fix .
ruff format .
```

**Konventionen:**
- Type Hints für alle Funktionen
- Pydantic Models für Validierung
- Docstrings für komplexe Funktionen
- PEP 8 Style Guide

**Beispiel:**
```python
from pydantic import BaseModel

class ZielCreate(BaseModel):
    """Schema zum Erstellen eines Ziels."""
    
    titel: str
    beschreibung: str | None = None
    start_datum: date
    end_datum: date
    status: str

@app.post("/ziele", response_model=ZielRead)
def create_ziel(ziel: ZielCreate, db: Session = Depends(get_db)) -> ZielRead:
    """Neues Ziel erstellen."""
    db_ziel = Ziel(**ziel.model_dump())
    db.add(db_ziel)
    db.commit()
    db.refresh(db_ziel)
    return db_ziel
```

## 🧪 Testing

### Manuelles Testing

Vor jedem PR:
1. **Alle Features** in beiden Ansichten (Timeline, Tree) testen
2. **Drag & Drop** funktioniert
3. **Status-Änderungen** funktionieren
4. **Responsive Design** auf Mobile prüfen
5. **Console Errors** prüfen

### Automatisierte Tests

**Frontend:**
```bash
cd frontend
npm run lint
npm run build  # TypeScript-Check
```

**Backend:**
```bash
cd backend
ruff check .
# TODO: pytest implementieren
```

### Docker-Tests

```bash
# Build testen
docker compose build

# Starten und prüfen
docker compose up -d
docker compose ps  # Alle Container "healthy"?
docker compose logs  # Keine Errors?
```

## 📚 Dokumentation

### Code-Kommentare

- Schreibe **warum**, nicht **was**
- Komplexe Algorithmen erklären
- TODOs mit Ticket-Nummer: `// TODO(#123): ...`

### Dokumentation aktualisieren

Bei Änderungen aktualisieren:
- `README.md` - Haupt-Dokumentation
- `DEPLOYMENT.md` - Deployment-Prozesse
- `CONTRIBUTING.md` - Dieses Dokument
- API-Docs - FastAPI Auto-Docs

## 🐛 Bug Triage

### Priority Labels

- `P0: Critical` - Produktions-Breaking, sofort fixen
- `P1: High` - Major Feature broken
- `P2: Medium` - Minor Feature broken
- `P3: Low` - Nice-to-have, kein Blocker

### Type Labels

- `bug` - Etwas funktioniert nicht
- `feature` - Neue Funktionalität
- `enhancement` - Verbesserung bestehender Funktion
- `documentation` - Doku-Änderung
- `question` - Frage zum Projekt

## ❓ Fragen?

- **GitHub Issues**: Für Bugs und Features
- **GitHub Discussions**: Für allgemeine Fragen
- **Email**: [deine-email@example.com]

## 📜 Lizenz

Durch dein Beitragen stimmst du zu, dass deine Beiträge unter der MIT-Lizenz lizenziert werden.

---

**Vielen Dank für deinen Beitrag!** 🚀
