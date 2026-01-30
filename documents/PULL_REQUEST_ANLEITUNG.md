# Pull Request Anleitung

Da GitHub CLI (`gh`) nicht installiert ist, erstelle den Pull Request manuell:

## Pull Request erstellen

### 1. Zu GitHub navigieren

Öffne in deinem Browser:
```
https://github.com/DominikZeltner/Goal_Tracker/compare/main...feat/frontend-setup
```

### 2. PR-Details ausfüllen

**Titel:**
```
feat: vollständiges Frontend mit Timeline, Zielbaum und Production-Deployment
```

**Beschreibung:**
Die Beschreibung findest du in der Datei `PR_DESCRIPTION.md` - kopiere den gesamten Inhalt (ab "## Zusammenfassung").

### 3. Pull Request erstellen

- Klicke auf "Create Pull Request"
- Warte auf CI-Checks (sollten grün werden)
- Review und ggf. anpassen
- Merge in main

## Nach dem Merge

### Branch aufräumen

```bash
# Lokal auf main wechseln
git checkout main
git pull origin main

# Feature-Branch löschen (lokal)
git branch -d feat/frontend-setup

# Feature-Branch löschen (remote)
git push origin --delete feat/frontend-setup
```

## Nächster Schritt

Siehe **PRODUCTION_DEPLOYMENT_CHECKLIST.md** für die genauen Schritte zum Deployment auf einem Server.
