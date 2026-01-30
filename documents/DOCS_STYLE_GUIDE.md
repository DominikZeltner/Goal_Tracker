# Dokumentationsrichtlinie

Diese Richtlinie sorgt für konsistente und wartbare Dokumentation im Projekt.

---

## 1. Datum

- Verwende ausschließlich ISO-Format: `YYYY-MM-DD`
- Beispiele: `2026-01-30`, `2026-02-05`

---

## 2. Überschriften

- `#` nur für den Dokumenttitel
- `##` für Hauptabschnitte
- `###` für Unterabschnitte
- Keine Sprünge (z. B. nicht von `#` direkt zu `###`)

---

## 3. Links

- Interne Links als relative Markdown-Links
  - Beispiel: `[DEPLOYMENT.md](DEPLOYMENT.md)`
- Externe Links als vollständige URL
  - Beispiel: `https://example.com`

---

## 4. Emojis

- Emojis sind optional und sparsam verwenden
- Wenn Emojis genutzt werden, dann nur in Überschriften
- Pro Überschrift maximal 1 Emoji

---

## 5. Codeblöcke

- Verwende Sprache für Syntax-Highlighting (`bash`, `powershell`, `python`, `yaml`)
- Halte Beispiele kurz und zielgerichtet

---

## 6. Status-Hinweise

- Einheitliches Format:
  - `**Status:** In Arbeit`
  - `**Status:** Abgeschlossen`
  - `**Status:** Geplant`

---

## 7. Redundanzen vermeiden

- Befehle: zentral in `COMMANDS_CHEATSHEET.md`
- Backup/Restore: zentral in `BACKUP_README.md`
- Deployment-Details: zentral in `DEPLOYMENT.md`
- Andere Dokumente verlinken dorthin statt Inhalte zu duplizieren
