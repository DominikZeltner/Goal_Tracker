# Quick Reference - Übersicht

Kurzer Index auf zentrale Dokumente ohne Redundanzen.

## 🔗 Zentrale Quellen

- **Befehle (Single Source of Truth)**: [COMMANDS_CHEATSHEET.md](COMMANDS_CHEATSHEET.md)
- **Deployment-Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Production-Checkliste**: [PRODUCTION_DEPLOYMENT_CHECKLIST.md](PRODUCTION_DEPLOYMENT_CHECKLIST.md)
- **Backup/Restore**: [BACKUP_README.md](BACKUP_README.md)
- **Development**: [DEV_QUICKSTART.md](DEV_QUICKSTART.md), [DEV_SETUP.md](DEV_SETUP.md)
- **Projekt-Übersicht**: [README.md](README.md)

## ✅ Minimal-Check (Kurzbefehle)

```bash
# Development starten
docker compose -f docker-compose.dev.yml up

# Production starten
docker compose up -d

# Logs ansehen
docker compose logs -f
```

Für alle weiteren Befehle siehe [COMMANDS_CHEATSHEET.md](COMMANDS_CHEATSHEET.md).
