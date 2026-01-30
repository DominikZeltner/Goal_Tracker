# 🎯 Sprint 9.2 - Ziel-Verwaltung erweitern

**Status:** ✅ Abgeschlossen  
**Datum:** 30.01.2026

---

## 📋 Übersicht

Sprint 9.2 erweitert die Ziel-Verwaltung um intelligente Features:
- **Auto-Update von Hauptziel-Daten** basierend auf Unterzielen
- **Löschen-Funktion** mit Bestätigungs-Dialog
- **Kaskadierendes Löschen** für Unterziele

---

## ✨ Features

### 1. Auto-Update von Hauptziel-Daten

**Problem:**  
Wenn ein Hauptziel mehrere Unterziele hat, mussten Start- und End-Daten manuell angepasst werden.

**Lösung:**  
Das System aktualisiert automatisch die Daten des Hauptziels:
- **Start-Datum:** Kleinste Start-Datum aller Unterziele
- **End-Datum:** Größte End-Datum aller Unterziele

**Funktionsweise:**
- Automatische Aktualisierung beim **Erstellen** eines Unterziels
- Automatische Aktualisierung beim **Bearbeiten** eines Unterziels
- Automatische Aktualisierung beim **Verschieben** in der Hierarchie

**Backend:**
```python
def update_parent_dates(parent_id: int, db: Session) -> None:
    """
    Aktualisiert die Daten eines Eltern-Ziels basierend auf seinen Unterzielen.
    Setzt start_datum auf das kleinste und end_datum auf das größte der Unterziele.
    """
    parent = db.get(Ziel, parent_id)
    if not parent:
        return
    
    stmt = select(Ziel).where(Ziel.parent_id == parent_id)
    children = db.scalars(stmt).all()
    
    if not children:
        return
    
    min_start = min(child.start_datum for child in children)
    max_end = max(child.end_datum for child in children)
    
    parent.start_datum = min_start
    parent.end_datum = max_end
    db.commit()
```

**Beispiel:**
```
Hauptziel "Projekt X"
├─ Unterziel 1: 01.02.2026 - 15.02.2026
├─ Unterziel 2: 10.02.2026 - 28.02.2026
└─ Unterziel 3: 05.02.2026 - 20.02.2026

→ Hauptziel wird automatisch aktualisiert auf: 01.02.2026 - 28.02.2026
```

---

### 2. Löschen-Funktion mit Bestätigungs-Dialog

**Feature:**  
Ziele können jetzt über einen "🗑️ Löschen"-Button gelöscht werden.

**Sicherheit:**
- **Bestätigungs-Modal** erscheint vor dem Löschen
- **Keine versehentlichen Löschungen** möglich
- **Warnung** bei vorhandenen Unterzielen

**UI:**
- Roter "Löschen"-Button auf der Detail-Seite
- Modal mit klarer Frage: "Möchtest du das Ziel wirklich löschen?"
- Zwei Buttons: "Abbrechen" (grau) und "Ja, löschen" (rot)

---

### 3. Kaskadierendes Löschen

**Feature:**  
Bei Zielen mit Unterzielen gibt es zwei Lösch-Optionen:

#### Option 1: Nur das eine Ziel löschen
- **Effekt:** Nur das ausgewählte Ziel wird gelöscht
- **Unterziele:** Bleiben erhalten und werden zu Hauptzielen
- **Button:** "Nur dieses Ziel löschen" (orange)

#### Option 2: Ziel + alle Unterziele löschen
- **Effekt:** Das Ziel und alle seine Unterziele werden gelöscht
- **Warnung:** Zeigt die Anzahl der betroffenen Unterziele
- **Button:** "Ziel + alle X Unterziele löschen" (rot)

**Backend-Parameter:**
```python
@app.delete("/ziele/{ziel_id}", status_code=204)
def delete_ziel(
    ziel_id: int,
    cascade: bool = Query(False, description="True = Unterziele auch löschen"),
    db: Session = Depends(get_db)
) -> None:
    """Ziel löschen (optional mit allen Unterzielen)."""
    # ...
```

**Frontend-API:**
```typescript
export const deleteGoal = async (id: number, cascade: boolean = false): Promise<void> => {
  await apiClient.delete(`/ziele/${id}`, {
    params: { cascade },
  });
};
```

---

## 🎨 UI/UX

### Modal-Design

**Standard-Löschen (keine Unterziele):**
```
┌─────────────────────────────────────┐
│ Ziel löschen?                       │
│                                      │
│ Möchtest du das Ziel "Test"         │
│ wirklich löschen?                    │
│                                      │
│ [Abbrechen]  [Ja, löschen]          │
└─────────────────────────────────────┘
```

**Löschen mit Unterzielen:**
```
┌─────────────────────────────────────────────┐
│ Ziel löschen?                               │
│                                              │
│ Möchtest du das Ziel "Projekt X"            │
│ wirklich löschen?                            │
│                                              │
│ ┌─────────────────────────────────────────┐ │
│ │ ⚠️ Dieses Ziel hat 3 Unterziele.        │ │
│ │                                          │ │
│ │ Was soll gelöscht werden?                │ │
│ │                                          │ │
│ │ [Nur dieses Ziel löschen]               │ │
│ │ [Ziel + alle 3 Unterziele löschen]      │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│ [Abbrechen]                                  │
└─────────────────────────────────────────────┘
```

---

## 🔧 Technische Details

### Geänderte Dateien

**Backend:**
- `backend/main.py`
  - Erweiterte `delete_ziel()` Funktion um `cascade` Parameter
  - Neue `delete_with_children()` Hilfsfunktion für rekursives Löschen
  - Neue `update_parent_dates()` Funktion für automatische Daten-Aktualisierung
  - Integration in `create_ziel()` und `update_ziel()`

**Frontend:**
- `frontend/src/api/goals.ts`
  - `deleteGoal()` um `cascade` Parameter erweitert
- `frontend/src/pages/Detail.tsx`
  - Neue States: `showDeleteModal`, `deleting`
  - Neue Handler: `handleDelete()`
  - Neuer "Löschen"-Button
  - Neues Bestätigungs-Modal mit Logik für Unterziele

---

## 🧪 Test-Szenarien

### Szenario 1: Hauptziel-Daten Auto-Update
1. Erstelle ein Hauptziel "Projekt X" (01.02.2026 - 28.02.2026)
2. Erstelle ein Unterziel "Task 1" (05.02.2026 - 15.02.2026)
3. Erstelle ein Unterziel "Task 2" (01.01.2026 - 10.02.2026)
4. **Erwartet:** Hauptziel wird automatisch auf 01.01.2026 - 28.02.2026 aktualisiert
5. Ändere "Task 2" auf (15.02.2026 - 15.03.2026)
6. **Erwartet:** Hauptziel wird automatisch auf 05.02.2026 - 15.03.2026 aktualisiert

### Szenario 2: Ziel ohne Unterziele löschen
1. Gehe zur Detail-Seite eines Ziels ohne Unterziele
2. Klicke auf "🗑️ Löschen"
3. **Erwartet:** Modal mit "Abbrechen" und "Ja, löschen"
4. Klicke "Ja, löschen"
5. **Erwartet:** Ziel wird gelöscht, Weiterleitung zur Timeline

### Szenario 3: Nur Hauptziel löschen
1. Gehe zur Detail-Seite eines Ziels mit 2 Unterzielen
2. Klicke auf "🗑️ Löschen"
3. **Erwartet:** Modal mit Warnung "⚠️ Dieses Ziel hat 2 Unterziele"
4. Klicke "Nur dieses Ziel löschen"
5. **Erwartet:** Nur das Hauptziel wird gelöscht, Unterziele bleiben als Hauptziele

### Szenario 4: Kaskadierendes Löschen
1. Gehe zur Detail-Seite eines Ziels mit 3 Unterzielen
2. Klicke auf "🗑️ Löschen"
3. Klicke "Ziel + alle 3 Unterziele löschen"
4. **Erwartet:** Hauptziel und alle 3 Unterziele werden gelöscht

---

## 📊 Vorher/Nachher

| Feature | Vorher | Nachher |
|---------|--------|---------|
| Hauptziel-Daten | Manuell anpassen | ✅ Automatisch |
| Ziele löschen | Nur über API (Swagger) | ✅ Frontend-Button + Modal |
| Unterziele bei Löschung | Bleiben verwaist | ✅ Wählbar: Behalten oder löschen |
| Bestätigung | Keine | ✅ Sicherheits-Modal |
| UX | Umständlich | ✅ Benutzerfreundlich |

---

## 🚀 Nächste Schritte

**Sprint 9.3 (geplant):**
1. **Änderungs-History** pro Ziel
2. **Sichtbare Abhängigkeiten** in Timeline und Zielbaum
3. **Milestone-Animationen** bei Ziel-Erreichung

---

## 📝 Commit

```bash
git add .
git commit -m "feat(sprint9.2): auto-update parent dates, delete with cascade, confirmation modal"
git push
```

---

## 💡 Hinweise

- Die Auto-Update-Logik wird **nur bei Unterzielen** ausgeführt
- Das Löschen-Modal ist **nicht schließbar während des Löschvorgangs** (Sicherheit)
- Das **cascade-Löschen ist rekursiv** und funktioniert auch bei verschachtelten Hierarchien
- Die **Bestätigungs-Dialoge sind barrierefrei** mit ARIA-Labels

---

**Status:** ✅ Erfolgreich implementiert und getestet  
**Nächster Sprint:** 9.3 - History & Dependencies
