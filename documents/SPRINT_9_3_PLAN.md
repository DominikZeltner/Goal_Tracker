# 🎯 Sprint 9.3 - History, Dependencies & Kommentare

**Status:** 🚧 In Arbeit  
**Start:** 30.01.2026  
**Geschätzte Dauer:** 2-3 Sessions

---

## 📋 Übersicht

Sprint 9.3 fügt drei wichtige Features hinzu:
1. **Änderungs-History** pro Ziel → Nachvollziehbarkeit
2. **Abhängigkeiten visualisieren** → Timeline & Zielbaum
3. **Kommentar-System** → Kollaboration & Notizen

---

## 🎯 Feature 1: Änderungs-History

### Ziel
Jede Änderung an einem Ziel wird protokolliert und ist auf der Detail-Seite einsehbar.

### Backend

**Neue Tabelle: `ziel_history`**
```python
class ZielHistory(Base):
    __tablename__ = "ziel_history"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ziel_id: Mapped[int] = mapped_column(Integer, ForeignKey("ziel.id"), nullable=False)
    changed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    change_type: Mapped[str] = mapped_column(String(50), nullable=False)
    # 'created', 'updated', 'status_changed', 'deleted', 'comment_added'
    field_name: Mapped[str | None] = mapped_column(String(100))
    old_value: Mapped[str | None] = mapped_column(Text)
    new_value: Mapped[str | None] = mapped_column(Text)
    
    # Relationship
    ziel: Mapped["Ziel"] = relationship("Ziel", back_populates="history")
```

**Neue Endpoints:**
```python
# GET /ziele/{id}/history
# Gibt chronologische Liste aller Änderungen zurück
```

**Automatisches Logging:**
- Bei `create_ziel()` → History-Eintrag "created"
- Bei `update_ziel()` → History-Einträge für geänderte Felder
- Bei `update_status()` → History-Eintrag "status_changed"
- Bei `delete_ziel()` → History-Eintrag "deleted" (vor dem Löschen)

### Frontend

**UI-Komponente: History-Tab**
```
┌────────────────────────────────────────┐
│ Ziel: Karriere-Entwicklung            │
│                                        │
│ [Detail] [History] [Kommentare]       │
│                                        │
│ 📜 Änderungshistorie                   │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ 30.01.2026 14:30                  │ │
│ │ Status geändert: offen → in Arbeit│ │
│ └────────────────────────────────────┘ │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ 29.01.2026 10:15                  │ │
│ │ End-Datum geändert:                │ │
│ │ 28.02.2026 → 15.03.2026           │ │
│ └────────────────────────────────────┘ │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ 28.01.2026 16:45                  │ │
│ │ Ziel erstellt                      │ │
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘
```

**Komponenten:**
- `frontend/src/components/HistoryTab.tsx` (neu)
- `frontend/src/pages/Detail.tsx` (Tab-Navigation)

---

## 🎯 Feature 2: Abhängigkeiten visualisieren

### Ziel
Parent-Child-Beziehungen sind in Timeline und Zielbaum **visuell erkennbar**.

### Timeline

**Implementierung:**
- Gestrichelte Linien zwischen Haupt- und Unterzielen
- Farbe: Hellgrau (#CBD5E1)
- Optional: SVG-Overlay oder `vis-timeline` Custom Groups

**UI-Beispiel:**
```
Timeline:
┌────────────────────────────────────────┐
│ Karriere ████████████████████          │
│    ┊                                   │
│    ┊── Excel-Kurs ████                 │
│    ┊                                   │
│    └── Bewerbungen ██████              │
└────────────────────────────────────────┘
```

### Zielbaum

**Status:** Bereits visualisiert durch React Flow!
- Hierarchie ist bereits durch Kanten (Edges) sichtbar
- **Verbesserung:** Kantenfarben nach Status
  - Parent "erledigt" → grüne Kante
  - Parent "in Arbeit" → blaue Kante
  - Parent "offen" → graue Kante

**Komponenten:**
- `frontend/src/pages/Timeline.tsx` (Custom Rendering)
- `frontend/src/pages/Tree.tsx` (Edge-Styling)

---

## 🎯 Feature 3: Kommentar-System

### Ziel
User können Notizen/Kommentare zu jedem Ziel hinterlassen.

### Backend

**Neue Tabelle: `kommentar`**
```python
class Kommentar(Base):
    __tablename__ = "kommentar"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ziel_id: Mapped[int] = mapped_column(Integer, ForeignKey("ziel.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Relationship
    ziel: Mapped["Ziel"] = relationship("Ziel", back_populates="kommentare")
```

**Neue Endpoints:**
```python
# POST /ziele/{id}/kommentare
# GET /ziele/{id}/kommentare
# DELETE /kommentare/{id}
```

**Integration mit History:**
- Beim Erstellen eines Kommentars → History-Eintrag "comment_added"

### Frontend

**UI-Komponente: Kommentar-Sektion**
```
┌────────────────────────────────────────┐
│ 💬 Kommentare                          │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ Neuer Kommentar...                │ │
│ │                                    │ │
│ └────────────────────────────────────┘ │
│ [Kommentar hinzufügen]                │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ 30.01.2026 14:30                  │ │
│ │ Excel-Kurs ist sehr wichtig für   │ │
│ │ neue Position.              [🗑️]  │ │
│ └────────────────────────────────────┘ │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ 29.01.2026 10:00                  │ │
│ │ Termin für Bewerbungsgespräch     │ │
│ │ vereinbart.                 [🗑️]  │ │
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘
```

**Komponenten:**
- `frontend/src/components/CommentSection.tsx` (neu)
- `frontend/src/pages/Detail.tsx` (CommentSection einbinden)

---

## 🔧 Implementierungs-Reihenfolge

### Session 1: History (Backend + Frontend)
1. Backend: `ZielHistory`-Modell erstellen
2. Backend: Migrationen durchführen
3. Backend: History-Logging in allen Update-Funktionen
4. Backend: GET `/ziele/{id}/history` Endpoint
5. Frontend: `HistoryTab.tsx` Komponente
6. Frontend: Tab-Navigation in `Detail.tsx`
7. Testing

### Session 2: Kommentare (Backend + Frontend)
1. Backend: `Kommentar`-Modell erstellen
2. Backend: Migrationen durchführen
3. Backend: Kommentar-Endpoints (POST, GET, DELETE)
4. Backend: History-Integration (comment_added)
5. Frontend: `CommentSection.tsx` Komponente
6. Frontend: Integration in `Detail.tsx`
7. Testing

### Session 3: Dependencies-Visualisierung
1. Timeline: Recherche zu `vis-timeline` Custom Rendering
2. Timeline: SVG-Overlay oder Custom Groups
3. Zielbaum: Edge-Styling nach Parent-Status
4. Testing & Feintuning

---

## 📊 Technische Details

### History-Logging-Helper

```python
def log_history(
    db: Session,
    ziel_id: int,
    change_type: str,
    field_name: str | None = None,
    old_value: str | None = None,
    new_value: str | None = None
) -> None:
    """Helper-Funktion zum Logging von Änderungen."""
    history_entry = ZielHistory(
        ziel_id=ziel_id,
        change_type=change_type,
        field_name=field_name,
        old_value=old_value,
        new_value=new_value
    )
    db.add(history_entry)
    # Kein commit hier - wird vom Haupt-Endpoint gemacht
```

### Kommentar-Schema

```python
class KommentarCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000)

class KommentarRead(BaseModel):
    id: int
    ziel_id: int
    created_at: datetime
    content: str

    model_config = ConfigDict(from_attributes=True)
```

---

## 🧪 Test-Szenarien

### History
1. Erstelle ein neues Ziel → Prüfe History-Eintrag "created"
2. Ändere Titel → Prüfe History-Eintrag mit old/new value
3. Ändere Status → Prüfe History-Eintrag "status_changed"
4. Öffne Detail-Seite → History-Tab zeigt alle Einträge chronologisch

### Kommentare
1. Erstelle Kommentar → Erscheint sofort in Liste
2. Erstelle Kommentar → History-Eintrag "comment_added"
3. Lösche Kommentar → Verschwindet aus Liste
4. Mehrere Kommentare → Chronologisch sortiert

### Dependencies
1. Timeline: Parent-Child-Linien sichtbar
2. Zielbaum: Kanten farbcodiert nach Status
3. Verschachtelte Hierarchien: Alle Verbindungen sichtbar

---

## 📝 Offene Fragen

1. **History-Retention:** Wie lange History speichern?
   - Option A: Unbegrenzt
   - Option B: Letzte 100 Einträge
   - Option C: Letzte 6 Monate
   - **Empfehlung:** Unbegrenzt (erst optimieren wenn nötig)

2. **Kommentar-Autor:** Später User-System?
   - Aktuell: Kein Autor (Single-User-App)
   - Später: `author_id` Feld hinzufügen
   - **Empfehlung:** Erst ohne Autor, später erweitern

3. **Timeline-Dependencies:** Welche Library?
   - Option A: SVG-Overlay (Custom)
   - Option B: vis-timeline Custom Groups
   - **Empfehlung:** Erst SVG-Overlay (einfacher), später Custom Groups

---

## 🚀 Ready to Start?

**Nächste Schritte:**
1. Session 1 starten: History implementieren
2. Code schreiben & testen
3. Commit & Push
4. Session 2: Kommentare
5. Session 3: Dependencies

---

**Status:** Bereit zum Start! 🎉
