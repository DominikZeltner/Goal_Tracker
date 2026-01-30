# Browser-Test Anleitung

## Problem
CSP blockiert `eval()` trotz korrekter Header vom Server.

## Verdacht
Browser-Extension oder gecachte Policy überschreibt die CSP.

## Test 1: Neues Browser-Profil erstellen

### Edge/Chrome:
1. Klicke auf dein Profil-Icon (oben rechts)
2. Klicke auf "Neues Profil hinzufügen" oder "Add profile"
3. Wähle "Ohne Anmeldung fortfahren"
4. Gib einen Namen ein: "Test"
5. **Wichtig:** Keine Extensions installieren!
6. Gehe zu: `http://localhost`

### Firefox:
1. Gib ein: `about:profiles`
2. Klicke auf "Neues Profil erstellen"
3. Name: "Test"
4. Klicke auf "Profil starten"
5. Gehe zu: `http://localhost`

## Test 2: Anderer Browser

Falls du mehrere Browser hast:
- Edge → versuche Chrome oder Firefox
- Chrome → versuche Edge oder Firefox
- Firefox → versuche Edge oder Chrome

## Test 3: DevTools → Application → Clear Storage

1. F12 öffnen
2. Tab "Application" (oder "Anwendung")
3. Links: "Storage" → "Clear site data"
4. Alles auswählen
5. "Clear site data" klicken
6. Browser komplett schließen und neu öffnen
7. `http://localhost` aufrufen

## Ergebnis melden

**Falls es in einem neuen Profil/Browser funktioniert:**
→ Problem ist eine Browser-Extension im Hauptprofil

**Falls es immer noch nicht funktioniert:**
→ Wir müssen tiefer graben
