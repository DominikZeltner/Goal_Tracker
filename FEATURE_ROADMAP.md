# Goal Tracker - Feature Roadmap

## ✅ Status: Timeline funktioniert!

Die Basis-Funktionalität ist implementiert und läuft. Jetzt folgt der Ausbau.

---

## 📋 Fehlende Features - Übersicht

### Kategorie A: Basis-Funktionalität (KRITISCH)
1. ✅ Timeline anzeigen → **ERLEDIGT**
2. ⏳ Schweizer Datumsformat (DD.MM.YYYY)
3. ⏳ Ziele bearbeiten (Edit-Modus)
4. ⏳ Ziele löschen (mit Popup & Unterziel-Handling)
5. ⏳ Unterziel-Datums-Synchronisation
6. ⏳ Abhängigkeiten visualisieren (Timeline & Zielbaum)

### Kategorie B: Erweiterte Funktionen
7. ⏳ Änderungshistory pro Ziel
8. ⏳ Kommentare pro Ziel
9. ⏳ Erfolgs-Animationen (Meilenstein/Pokal)
10. ⏳ Numerische Ziele (KPI-Tracking)

### Kategorie C: Benachrichtigungen & Kommunikation
11. ⏳ Message-App / Notification-System

### Kategorie D: AI/LLM-Integration
12. ⏳ LLM-Anbindung
13. ⏳ Chatbot-Steuerung
14. ⏳ Ziel-Analyse durch LLM
15. ⏳ GPT-Integration (MVP)

---

## 🎯 Implementierungs-Plan

## Phase 9: Basis-Verbesserungen & CRUD-Vervollständigung
**Dauer:** 3-4 Sessions  
**Ziel:** Vollständige CRUD-Funktionalität mit gutem UX

### Sprint 9.1: Datumsformat & Bearbeiten (1 Session)
**Priorität:** HOCH  
**Aufgaben:**
- [ ] Schweizer Datumsformat implementieren (DD.MM.YYYY)
  - Frontend: Datepicker mit `de-CH` Locale
  - API: Akzeptiert weiterhin ISO (YYYY-MM-DD)
  - Formatierung nur im Frontend
- [ ] Edit-Modus für Ziele erstellen
  - Edit-Button auf Detail-Seite
  - Formular wie "Neues Ziel", aber vorausgefüllt
  - PUT Request an `/ziele/{id}`
  - Route: `/ziel/{id}/bearbeiten`

**Technische Details:**
- Library: `date-fns` für Formatierung
- Schweizer Format: `dd.MM.yyyy`
- Datepicker: `react-datepicker` mit `de-CH` Locale

**Dateien:**
- `frontend/src/pages/EditGoal.tsx` (neu)
- `frontend/src/pages/Detail.tsx` (Edit-Button)
- `frontend/src/utils/dateFormat.ts` (neu)

---

### Sprint 9.2: Löschen mit Unterziel-Handling (1 Session)
**Priorität:** HOCH  
**Aufgaben:**
- [ ] Löschen-Button auf Detail-Seite
- [ ] Confirmation-Modal/Dialog
  - "Ziel wirklich löschen?"
  - Falls Unterziele vorhanden:
    - Option A: "Nur dieses Ziel löschen (Unterziele bleiben)"
    - Option B: "Ziel und alle Unterziele löschen"
- [ ] Backend: DELETE Endpoint erweitern
  - Parameter: `delete_children=true/false`
  - Logik: Cascade Delete oder nur Parent löschen
- [ ] Frontend: DELETE Request

**Technische Details:**
- Modal-Library: `react-modal` oder eigene Implementierung
- Backend: Cascade Delete über SQLAlchemy
- Redirect nach Löschen: zu `/` (Timeline)

**Dateien:**
- `frontend/src/components/DeleteModal.tsx` (neu)
- `frontend/src/pages/Detail.tsx` (Delete-Button)
- `backend/main.py` (DELETE /ziele/{id}?delete_children=true)

---

### Sprint 9.3: Unterziel-Datums-Synchronisation (1 Session)
**Priorität:** MITTEL  
**Aufgaben:**
- [ ] Backend-Logik:
  - Wenn Unterziel gespeichert/bearbeitet wird
  - Prüfe Parent-Ziel
  - Finde MIN(start_datum) und MAX(end_datum) aller Unterziele
  - Aktualisiere Parent automatisch
- [ ] Frontend: Info-Hinweis
  - "Hauptziel-Daten werden automatisch angepasst"

**Technische Details:**
- Trigger nach Unterziel-Update
- Query: `SELECT MIN(start_datum), MAX(end_datum) FROM ziel WHERE parent_id = ?`
- Update Parent nur, wenn sich Daten ändern

**Dateien:**
- `backend/main.py` (update_goal, create_goal)
- Helper-Funktion: `sync_parent_dates(parent_id)`

---

### Sprint 9.4: Abhängigkeiten visualisieren (1 Session)
**Priorität:** MITTEL  
**Aufgaben:**
- [ ] Timeline: Parent-Child-Linien
  - Gestrichelte Linien zwischen Haupt- und Unterzielen
  - Farbe: hellgrau
- [ ] Zielbaum: Bereits visualisiert durch Hierarchie
  - Optional: Zusätzliche visuelle Marker

**Technische Details:**
- vis-timeline: Custom Groups für Parent-Child
- Alternativ: SVG-Overlay für Linien
- React Flow: Bereits hierarchisch

**Dateien:**
- `frontend/src/pages/Timeline.tsx` (Custom Rendering)

---

## Phase 10: History & Kommentare
**Dauer:** 2-3 Sessions  
**Ziel:** Nachvollziehbarkeit & Kollaboration

### Sprint 10.1: Änderungshistory (1 Session)
**Priorität:** MITTEL  
**Aufgaben:**
- [ ] Backend: History-Tabelle
  - Schema:
    ```sql
    CREATE TABLE ziel_history (
      id INTEGER PRIMARY KEY,
      ziel_id INTEGER NOT NULL,
      changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      changed_by VARCHAR(100),  -- später: User-System
      change_type VARCHAR(50),  -- 'created', 'updated', 'status_changed', 'deleted'
      old_value TEXT,           -- JSON
      new_value TEXT,           -- JSON
      FOREIGN KEY (ziel_id) REFERENCES ziel(id)
    )
    ```
- [ ] Backend: History bei jedem Update speichern
- [ ] Frontend: History-Tab auf Detail-Seite
  - Chronologische Liste
  - Diff-Anzeige (optional)

**Dateien:**
- `backend/models.py` (ZielHistory)
- `backend/main.py` (GET /ziele/{id}/history)
- `frontend/src/pages/Detail.tsx` (History-Tab)

---

### Sprint 10.2: Kommentare (1-2 Sessions)
**Priorität:** MITTEL  
**Aufgaben:**
- [ ] Backend: Comment-Tabelle
  - Schema:
    ```sql
    CREATE TABLE kommentar (
      id INTEGER PRIMARY KEY,
      ziel_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      author VARCHAR(100),      -- später: User-System
      content TEXT NOT NULL,
      FOREIGN KEY (ziel_id) REFERENCES ziel(id)
    )
    ```
- [ ] Backend: CRUD für Kommentare
  - POST /ziele/{id}/kommentare
  - GET /ziele/{id}/kommentare
  - DELETE /kommentare/{id}
- [ ] Frontend: Kommentar-Sektion
  - Textarea + Submit-Button
  - Liste aller Kommentare (chronologisch)
  - Löschen-Button pro Kommentar

**Dateien:**
- `backend/models.py` (Kommentar)
- `backend/schemas.py` (KommentarCreate, Kommentar)
- `backend/main.py` (Comment-Endpoints)
- `frontend/src/components/CommentSection.tsx` (neu)
- `frontend/src/pages/Detail.tsx` (CommentSection einbinden)

---

## Phase 11: UX-Verbesserungen & Animationen
**Dauer:** 1-2 Sessions  
**Ziel:** Motivierende User Experience

### Sprint 11.1: Erfolgs-Animationen (1 Session)
**Priorität:** NIEDRIG (Nice-to-have)  
**Aufgaben:**
- [ ] Meilenstein-Animation (Unterziel erledigt)
  - Icon: 🎯 oder 🏁
  - Animation: Confetti oder Fade-in/out
  - Dauer: 3 Sekunden
  - Trigger: Status → "erledigt"
- [ ] Pokal-Animation (Hauptziel erledigt)
  - Icon: 🏆
  - Animation: Größer, mit Glitzer
  - Dauer: 3 Sekunden
- [ ] Frontend: Toast-Notification
  - Library: `react-toastify` oder `react-hot-toast`

**Technische Details:**
- Trigger: Nach Status-Update (Detail-Seite)
- Check: Ist es Unterziel oder Hauptziel?
- Animation: CSS + React

**Dateien:**
- `frontend/src/components/SuccessAnimation.tsx` (neu)
- `frontend/src/pages/Detail.tsx` (Animation-Trigger)

---

## Phase 12: Numerische Ziele & KPI-Tracking
**Dauer:** 2 Sessions  
**Ziel:** Messbare Ziele (z.B. "10 kg abnehmen", "100.000€ Umsatz")

### Sprint 12.1: Datenmodell erweitern (1 Session)
**Priorität:** MITTEL  
**Aufgaben:**
- [ ] Backend: Ziel-Tabelle erweitern
  - `ziel_typ` ENUM('zeitbasiert', 'numerisch', 'hybrid')
  - `ziel_wert` FLOAT (Zielwert, z.B. 100000)
  - `aktueller_wert` FLOAT (Fortschritt, z.B. 45000)
  - `einheit` VARCHAR(50) (z.B. "kg", "€", "%")
- [ ] Backend: Update-Endpoint für Fortschritt
  - PUT /ziele/{id}/fortschritt
  - Body: `{ aktueller_wert: 50000 }`
- [ ] Frontend: Numerisches Ziel erstellen
  - Zusätzliche Felder im "Neues Ziel"-Form
  - Toggle: "Zeitbasiert" / "Numerisch" / "Hybrid"

**Dateien:**
- `backend/models.py` (Ziel erweitern)
- `backend/schemas.py` (ZielCreate erweitern)
- `frontend/src/pages/NewGoal.tsx` (Zusatzfelder)

---

### Sprint 12.2: Fortschritts-Visualisierung (1 Session)
**Priorität:** MITTEL  
**Aufgaben:**
- [ ] Frontend: Progress-Bar
  - Zeige `aktueller_wert / ziel_wert` als %
  - Farbe: 0-30% rot, 30-70% gelb, 70-100% grün
- [ ] Timeline: Zusätzliche Info
  - Zeige Fortschritt im Tooltip
- [ ] Detail-Seite: Fortschritt aktualisieren
  - Input-Feld für neuen Wert
  - Button "Fortschritt aktualisieren"

**Dateien:**
- `frontend/src/components/ProgressBar.tsx` (neu)
- `frontend/src/pages/Detail.tsx` (ProgressBar einbinden)
- `frontend/src/pages/Timeline.tsx` (Tooltip erweitern)

---

## Phase 13: Notification-System
**Dauer:** 3 Sessions  
**Ziel:** Benachrichtigungen & Erinnerungen

### Sprint 13.1: Message-App evaluieren (0.5 Session)
**Priorität:** NIEDRIG  
**Aufgaben:**
- [ ] Recherche: Message-App-Optionen
  - **Telegram Bot:** Einfach, kostenlos, API gut dokumentiert
  - **Slack Bot:** Gut für Teams
  - **Discord Bot:** Gut für Communities
  - **WhatsApp Business API:** Komplex, kostenpflichtig
  - **E-Mail:** Einfach, aber weniger interaktiv
- [ ] Entscheidung treffen
- [ ] POC: Einfache Test-Nachricht senden

**Empfehlung:** **Telegram Bot** (einfach, gratis, API exzellent)

---

### Sprint 13.2: Telegram Bot implementieren (1.5 Sessions)
**Priorität:** NIEDRIG  
**Aufgaben:**
- [ ] Telegram Bot erstellen (@BotFather)
- [ ] Backend: Telegram-Integration
  - Library: `python-telegram-bot`
  - Endpoint: POST /notifications/send
  - Webhook für Antworten (optional)
- [ ] Benachrichtigungen implementieren
  - Ziel-Deadline naht (7 Tage vorher)
  - Ziel überfällig
  - Unterziel erledigt (an Parent-Owner)
- [ ] Frontend: Telegram-ID konfigurieren
  - Settings-Seite (später User-Profil)

**Dateien:**
- `backend/telegram_bot.py` (neu)
- `backend/notifications.py` (neu)
- `backend/main.py` (Notification-Endpoints)

---

### Sprint 13.3: Notification-Scheduler (1 Session)
**Priorität:** NIEDRIG  
**Aufgaben:**
- [ ] Backend: Cron-Job oder Scheduler
  - Library: `APScheduler` (Python)
  - Daily Check: Welche Ziele laufen bald ab?
  - Sende Benachrichtigungen
- [ ] Database: Notification-Log
  - Vermeide Duplikate
  - Schema: `notification_id`, `ziel_id`, `sent_at`, `type`

**Dateien:**
- `backend/scheduler.py` (neu)
- `backend/models.py` (NotificationLog)

---

## Phase 14: LLM/AI-Integration
**Dauer:** 4-6 Sessions  
**Ziel:** Chatbot-Steuerung & intelligente Analysen

### Sprint 14.1: LLM-Anbindung (1 Session)
**Priorität:** NIEDRIG  
**Aufgaben:**
- [ ] LLM-Provider wählen
  - **OpenAI (GPT-4):** Beste Qualität, kostenpflichtig
  - **Anthropic (Claude):** Sehr gut, kostenpflichtig
  - **Groq (Llama 3):** Schnell, gratis-Tier
  - **Ollama (lokal):** Kostenlos, offline, langsamer
- [ ] Backend: LLM-Integration
  - Library: `openai` oder `anthropic`
  - Endpoint: POST /ai/query
  - Context: Alle Ziele des Users als JSON
- [ ] Frontend: Chatbot-UI (einfach)
  - Chatbox-Komponente
  - Send-Button
  - Response anzeigen

**Dateien:**
- `backend/llm_service.py` (neu)
- `backend/.env` (API-Keys)
- `frontend/src/components/Chatbot.tsx` (neu)
- `frontend/src/pages/ChatPage.tsx` (neu)

---

### Sprint 14.2: Natürlichsprachliche Ziel-Erstellung (1-2 Sessions)
**Priorität:** NIEDRIG  
**Aufgaben:**
- [ ] LLM-Prompt Engineering
  - Input: "Ich will bis Ende März 5 kg abnehmen"
  - Output: Strukturiertes Ziel-JSON
    ```json
    {
      "titel": "5 kg abnehmen",
      "start_datum": "2026-02-01",
      "end_datum": "2026-03-31",
      "ziel_typ": "numerisch",
      "ziel_wert": 5,
      "einheit": "kg"
    }
    ```
- [ ] Backend: Parse & Validate LLM-Output
- [ ] Frontend: "Ziel mit KI erstellen"-Button
  - Textarea für freien Text
  - LLM generiert Vorschlag
  - User kann bearbeiten & bestätigen

**Dateien:**
- `backend/llm_service.py` (goal_from_text)
- `frontend/src/pages/NewGoalAI.tsx` (neu)

---

### Sprint 14.3: Ziel-Analyse durch LLM (1 Session)
**Priorität:** NIEDRIG  
**Aufgaben:**
- [ ] Analyse-Funktionen
  - "Sind meine Ziele realistisch?"
  - "Welche Ziele sind gefährdet?"
  - "Empfehlungen für Priorisierung"
- [ ] Backend: Analyse-Endpoint
  - POST /ai/analyze
  - Context: Alle Ziele + Fortschritt
  - Response: LLM-Analyse als Text
- [ ] Frontend: Analyse-Button auf Timeline
  - Modal mit LLM-Response

**Dateien:**
- `backend/llm_service.py` (analyze_goals)
- `frontend/src/components/AnalysisModal.tsx` (neu)

---

### Sprint 14.4: Chatbot-Steuerung (1-2 Sessions)
**Priorität:** NIEDRIG  
**Aufgaben:**
- [ ] Natürlichsprachliche Befehle
  - "Zeige mir alle offenen Ziele"
  - "Wie ist der Status von Projekt X?"
  - "Erstelle ein Ziel: ..."
  - "Markiere Ziel X als erledigt"
- [ ] Backend: Intent-Recognition
  - LLM erkennt Intent (show, create, update, delete, analyze)
  - Führt entsprechende API-Calls aus
  - Formatiert Response für User
- [ ] Frontend: Chatbot-Interface
  - Wie Messenger-App
  - User-Nachrichten rechts, Bot links
  - Auto-Scroll

**Dateien:**
- `backend/chatbot.py` (neu)
- `backend/llm_service.py` (execute_command)
- `frontend/src/pages/ChatPage.tsx` (erweitern)

---

### Sprint 14.5: GPT-Integration (MVP) (1 Session)
**Priorität:** NIEDRIG  
**Aufgaben:**
- [ ] Custom GPT erstellen (ChatGPT)
  - Name: "Goal Tracker Assistant"
  - Instructions: System-Prompt mit API-Beschreibung
  - Actions: OpenAPI-Spec für deine API
- [ ] Backend: API-Endpoints für GPT
  - Müssen öffentlich erreichbar sein
  - Auth: API-Key
- [ ] Testing: GPT mit echten Daten
  - "Zeige mir meine Ziele"
  - "Erstelle ein neues Ziel"

**Dateien:**
- `GPT_CONFIG.md` (Dokumentation)
- `openapi.json` (API-Spec für GPT)
- `backend/main.py` (API-Key-Auth)

---

## 📊 Priorisierungs-Matrix

| Phase | Priorität | Impact | Effort | Empfohlene Reihenfolge |
|-------|-----------|--------|--------|------------------------|
| **Phase 9** (CRUD) | ⭐⭐⭐ HOCH | Hoch | Mittel | **1** |
| **Phase 10** (History) | ⭐⭐ MITTEL | Mittel | Mittel | **2** |
| **Phase 11** (Animationen) | ⭐ NIEDRIG | Niedrig | Niedrig | **5** |
| **Phase 12** (Numerisch) | ⭐⭐ MITTEL | Hoch | Mittel | **3** |
| **Phase 13** (Notifications) | ⭐ NIEDRIG | Mittel | Mittel | **4** |
| **Phase 14** (AI/LLM) | ⭐ NIEDRIG | Hoch | Hoch | **6** |

---

## 🚀 Empfohlener Start: Phase 9 - Sprint 9.1

**Nächste Session:**
1. Schweizer Datumsformat implementieren
2. Edit-Modus für Ziele erstellen

**Grund:** Diese Features sind **essentiell** für die tägliche Nutzung und bauen auf der bestehenden Funktionalität auf.

---

## 📝 Entscheidungen für dich

Bevor wir starten, bitte entscheide:

1. **Datumsformat:** Bestätigung Schweizer Format (DD.MM.YYYY)?
2. **LLM-Provider:** Welchen bevorzugst du? (OpenAI, Claude, Groq, Ollama)
3. **Message-App:** Telegram OK? Oder andere Präferenz?
4. **Priorisierung:** Stimmt die vorgeschlagene Reihenfolge?

---

**Sollen wir mit Phase 9 - Sprint 9.1 starten?** (Schweizer Datumsformat + Edit-Modus)
