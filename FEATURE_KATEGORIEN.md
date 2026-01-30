# Feature: Kategorien & Filter

**Status:** 📋 Geplant (Phase 13.5)  
**Priorität:** ⭐⭐ MITTEL  
**Aufwand:** ~2 Sessions

---

## 🎯 Ziel

Ziele sollen kategorisierbar sein, und Timeline/Zielbaum-Ansichten sollen nach Kategorien filterbar sein.

---

## 📝 Feature-Beschreibung

### Kernfunktionalität

1. **Kategorien zuweisen**
   - Beim Erstellen eines Ziels kann eine Kategorie ausgewählt werden
   - Beim Bearbeiten kann die Kategorie geändert werden
   - Kategorien sind optional (NULL erlaubt für Legacy-Ziele)

2. **Filter in Ansichten**
   - **Timeline:** Filter-Dropdown zum Filtern nach Kategorien
   - **Zielbaum:** Gleicher Filter wie Timeline
   - **Multi-Select:** Mehrere Kategorien gleichzeitig wählbar
   - **Persistenz:** Letzte Auswahl im LocalStorage speichern

3. **Visuelle Darstellung**
   - Kategorie-Badge auf Detail-Seite
   - Farbcodierung pro Kategorie
   - Optional: Kategorie in Timeline-Items sichtbar

---

## 🔧 Technische Umsetzung

### Backend

**Datenmodell-Änderung:**
```python
# backend/models.py
class Ziel(Base):
    # ... existing fields ...
    kategorie: Mapped[str | None] = mapped_column(String(100), nullable=True)
```

**Neue Endpoints:**
```python
# GET /kategorien
# Gibt Liste aller verwendeten Kategorien zurück
@app.get("/kategorien")
def get_kategorien(db: Session = Depends(get_db)) -> list[str]:
    stmt = select(Ziel.kategorie).distinct().where(Ziel.kategorie.is_not(None))
    kategorien = db.scalars(stmt).all()
    return sorted(kategorien)

# GET /ziele?kategorie=Beruf
# Bestehender Endpoint mit neuem Query-Parameter
@app.get("/ziele")
def get_ziele(
    tree: int | None = Query(None),
    kategorie: str | None = Query(None),
    db: Session = Depends(get_db)
):
    stmt = select(Ziel)
    if kategorie:
        stmt = stmt.where(Ziel.kategorie == kategorie)
    # ... rest of logic
```

**Vordefinierte Kategorien:**
```python
# backend/constants.py
STANDARD_KATEGORIEN = [
    "Beruf",
    "Privat",
    "Gesundheit",
    "Finanzen",
    "Bildung",
    "Familie",
    "Hobby",
    "Sport",
    "Reisen",
    "Soziales"
]
```

---

### Frontend

**UI-Komponenten:**

1. **CategorySelect (Neues Ziel / Bearbeiten):**
```typescript
// frontend/src/components/CategorySelect.tsx
interface CategorySelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

export default function CategorySelect({ value, onChange }: CategorySelectProps) {
  // Dropdown mit Kategorien
  // "Keine Kategorie"-Option
  // Lade Kategorien via API
}
```

2. **CategoryFilter (Timeline / Zielbaum):**
```typescript
// frontend/src/components/CategoryFilter.tsx
interface CategoryFilterProps {
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
}

export default function CategoryFilter({ selectedCategories, onChange }: CategoryFilterProps) {
  // Multi-Select Dropdown
  // "Alle anzeigen"-Option
  // Persistenz via LocalStorage
}
```

3. **CategoryBadge (Detail-Seite):**
```typescript
// frontend/src/components/CategoryBadge.tsx
interface CategoryBadgeProps {
  category: string | null;
}

export default function CategoryBadge({ category }: CategoryBadgeProps) {
  if (!category) return null;
  
  // Badge mit Farbe
  const color = getCategoryColor(category);
  return <span style={{ backgroundColor: color }}>{category}</span>;
}
```

**Farb-Mapping:**
```typescript
// frontend/src/utils/categoryColors.ts
export const CATEGORY_COLORS: Record<string, string> = {
  'Beruf': '#3B82F6',      // Blau
  'Privat': '#8B5CF6',     // Lila
  'Gesundheit': '#10B981', // Grün
  'Finanzen': '#F59E0B',   // Orange
  'Bildung': '#06B6D4',    // Cyan
  'Familie': '#EC4899',    // Pink
  'Hobby': '#6366F1',      // Indigo
  'Sport': '#14B8A6',      // Teal
  'Reisen': '#F97316',     // Orange-Rot
  'Soziales': '#A855F7',   // Violett
};

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || '#6B7280'; // Fallback: Grau
}
```

---

## ❓ Offene Fragen & Design-Entscheidungen

### Frage 1: Kategorie-Vererbung bei Unterzielen

**Szenario:**
```
Hauptziel "Karriere-Entwicklung" (Kategorie: Beruf)
  └── Unterziel "Excel-Kurs absolvieren" (Kategorie: ?)
```

**Optionen:**

| Option | Verhalten | Vorteile | Nachteile |
|--------|-----------|----------|-----------|
| **A) Automatische Vererbung** | Unterziele erben automatisch die Kategorie des Parents | - Konsistenz<br>- Einfache Logik | - Weniger flexibel<br>- Zwangs-Kategorisierung |
| **B) Freie Wahl** | Unterziele können eigene Kategorien haben | - Maximal flexibel<br>- Realitätsnah | - Mögliche Inkonsistenzen<br>- Komplexere Filter-Logik |
| **C) Vererbung mit Override** | Standard = Parent-Kategorie, aber änderbar | - Balance aus A + B<br>- Best Practice | - Komplexere UI |

**Empfehlung:** **Option B (Freie Wahl)**  
**Begründung:** 
- Ein Unterziel "Excel-Kurs" kann sowohl "Beruf" als auch "Bildung" sein
- Realität ist oft nicht streng hierarchisch
- Filter-Logik ist handhabbar (siehe Frage 2)

---

### Frage 2: Filter-Verhalten bei gemischten Kategorien

**Szenario:**
```
Filter aktiv: "Beruf"

Hauptziel "Karriere" (Kategorie: Beruf)
  ├─ Unterziel "Excel-Kurs" (Kategorie: Bildung)
  └─ Unterziel "Bewerbungen schreiben" (Kategorie: Beruf)
```

**Frage:** Was wird in Timeline/Zielbaum angezeigt?

**Optionen:**

| Option | Verhalten | Vorteile | Nachteile |
|--------|-----------|----------|-----------|
| **A) Exakte Kategorie** | Nur Ziele mit exakter Kategorie "Beruf" | - Klar & eindeutig<br>- Performance | - Unterziele werden ausgeblendet<br>- Hierarchie geht verloren |
| **B) Hierarchisch** | Zeige Hauptziel + ALLE Unterziele, wenn Hauptziel passt | - Hierarchie bleibt sichtbar<br>- Übersichtlich | - Zeigt auch nicht-passende Unterziele |
| **C) Intelligent** | Zeige Hauptziel, wenn mind. 1 Ziel in Hierarchie passt | - Beste Balance<br>- Keine verlorenen Ziele | - Komplexe Logik<br>- Verwirrend ohne Hinweis |

**Empfehlung:** **Option C (Intelligent) mit visuellem Hinweis**  
**Begründung:**
- Zeige Hauptziel "Karriere", weil mind. 1 Unterziel "Beruf" ist
- Badge: "2 von 3 Unterzielen passen zum Filter"
- Unterziele: Passende hervorheben, nicht-passende ausgegraut

**Beispiel-UI:**
```
Timeline (Filter: "Beruf"):
┌────────────────────────────────────────┐
│ Karriere-Entwicklung     [Beruf]       │
│ ✅ 2 von 3 Unterzielen passen          │
│   ├─ Bewerbungen (Beruf) ✅            │
│   └─ Excel-Kurs (Bildung) ⚪ (ausgegraut) │
└────────────────────────────────────────┘
```

---

### Frage 3: Multi-Kategorie pro Ziel (Tags)

**Szenario:**
```
Ziel "Homeoffice-Setup kaufen"
→ Kategorien: "Beruf" UND "Finanzen"
```

**Frage:** Soll ein Ziel mehrere Kategorien haben können?

**Optionen:**

| Option | Verhalten | Vorteile | Nachteile |
|--------|-----------|----------|-----------|
| **A) 1 Kategorie** | Nur 1 Kategorie pro Ziel | - Einfach<br>- Klar | - Nicht immer realitätsnah |
| **B) Tags (Many-to-Many)** | Beliebig viele Kategorien/Tags | - Maximal flexibel<br>- Realistisch | - Komplexere DB-Struktur<br>- Komplexere Filter-UI |

**Empfehlung:** **Option A zunächst, später Option B**  
**Begründung:**
- Starte mit 1 Kategorie (einfacher Start)
- Später erweitern zu Tags (separate `tags`-Tabelle)
- Migration: `kategorie` → `tags` (1 Tag = alte Kategorie)

**Datenmodell für später (Tags):**
```sql
CREATE TABLE tag (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE ziel_tags (
    ziel_id INTEGER,
    tag_id INTEGER,
    PRIMARY KEY (ziel_id, tag_id),
    FOREIGN KEY (ziel_id) REFERENCES ziel(id),
    FOREIGN KEY (tag_id) REFERENCES tag(id)
);
```

---

### Frage 4: Freie Eingabe vs. Vordefinierte Kategorien

**Optionen:**

| Option | Verhalten | Vorteile | Nachteile |
|--------|-----------|----------|-----------|
| **A) Nur vordefiniert** | Dropdown mit festen Kategorien | - Konsistenz<br>- Keine Tippfehler | - Weniger flexibel |
| **B) Freie Eingabe** | Textfeld, beliebige Eingabe | - Maximal flexibel | - Tippfehler<br>- Inkonsistenzen ("Beruf" vs "beruf") |
| **C) Hybrid** | Dropdown + "Eigene Kategorie"-Option | - Balance<br>- Best Practice | - Etwas komplexer |

**Empfehlung:** **Option C (Hybrid)**  
**Begründung:**
- Standard-Kategorien für 90% der Fälle
- Freie Eingabe für Spezialfälle
- Autocomplete mit bestehenden Kategorien

**UI-Mockup:**
```
Kategorie:
┌────────────────────────────┐
│ [Dropdown]                 │
│ - Beruf                    │
│ - Privat                   │
│ - Gesundheit               │
│ - Finanzen                 │
│ ...                        │
│ - Eigene Kategorie... ✏️   │
└────────────────────────────┘

Bei "Eigene Kategorie":
┌────────────────────────────┐
│ [Textfeld]                 │
│ Deine Kategorie eingeben   │
└────────────────────────────┘
```

---

## 🎨 UI-Mockups

### Timeline mit Filter

```
┌────────────────────────────────────────────┐
│ Timeline                                   │
│ ┌──────────────────┐                      │
│ │ Filter: [Alle ▼] │  ← Filter-Dropdown   │
│ └──────────────────┘                      │
│                                            │
│ [Karriere] ████████████████                │
│ 01.03 - 31.03    [Beruf]                  │
│                                            │
│ [Fitness] ██████                           │
│ 15.02 - 28.02    [Gesundheit]             │
└────────────────────────────────────────────┘
```

### Detail-Seite mit Kategorie

```
┌────────────────────────────────────────────┐
│ Karriere-Entwicklung                       │
│ ┌────────┐                                │
│ │ Beruf  │  ← Kategorie-Badge              │
│ └────────┘                                │
│                                            │
│ Status: In Arbeit                          │
│ Zeitraum: 01.03.2026 - 31.03.2026         │
│                                            │
│ [✏️ Bearbeiten] [🗑️ Löschen]               │
└────────────────────────────────────────────┘
```

---

## 📋 Implementierungs-Checkliste

### Sprint 13.5.1: Kategorien-System

**Backend:**
- [ ] Migration: Spalte `kategorie` zu `ziel`-Tabelle hinzufügen
- [ ] Konstanten: `STANDARD_KATEGORIEN` definieren
- [ ] Endpoint: `GET /kategorien` implementieren
- [ ] Endpoint: `GET /ziele?kategorie=X` Filter implementieren
- [ ] Schema: `ZielCreate` und `ZielRead` um `kategorie` erweitern

**Frontend:**
- [ ] Component: `CategorySelect.tsx` erstellen
- [ ] Component: `CategoryBadge.tsx` erstellen
- [ ] Utils: `categoryColors.ts` für Farb-Mapping
- [ ] Update: `NewGoal.tsx` - Kategorie-Feld hinzufügen
- [ ] Update: `EditGoal.tsx` - Kategorie-Feld hinzufügen
- [ ] Update: `Detail.tsx` - Kategorie-Badge anzeigen

---

### Sprint 13.5.2: Filter-Funktion

**Frontend:**
- [ ] Component: `CategoryFilter.tsx` erstellen
- [ ] Hook: `useFilterState.ts` für LocalStorage-Persistenz
- [ ] Update: `Timeline.tsx` - Filter einbinden
- [ ] Update: `Tree.tsx` - Filter einbinden
- [ ] Logic: Intelligente Filter-Logik (Option C) implementieren
- [ ] UI: Visueller Hinweis bei gemischten Kategorien
- [ ] Feature: URL-Parameter für Filter (`?kategorie=Beruf`)

**Testing:**
- [ ] Test: Ziel mit Kategorie erstellen
- [ ] Test: Filter auf Timeline anwenden
- [ ] Test: Filter auf Zielbaum anwenden
- [ ] Test: Gemischte Kategorien in Hierarchie
- [ ] Test: LocalStorage-Persistenz
- [ ] Test: Multi-Select Filter

---

## 🚀 Nächste Schritte

**Vor der Implementierung:**
1. ✅ Offene Fragen klären (siehe oben)
2. ✅ Design-Entscheidungen treffen
3. ✅ UI-Mockups finalisieren

**Während der Implementierung:**
1. Backend-Migration durchführen
2. Frontend-Komponenten bauen
3. Filter-Logik implementieren
4. Tests durchführen

**Nach der Implementierung:**
1. User-Feedback einholen
2. Ggf. Anpassungen vornehmen
3. Dokumentation aktualisieren

---

## 💡 Erweiterungsideen für die Zukunft

1. **Farben anpassen**
   - User kann Kategorie-Farben selbst wählen
   - Settings-Seite für Kategorie-Management

2. **Kategorie-Statistiken**
   - Dashboard: Verteilung der Ziele pro Kategorie
   - Chart: Wie viel Zeit pro Kategorie?

3. **Tags statt Kategorien**
   - Migration von Single-Kategorie zu Multi-Tags
   - Many-to-Many-Relationship

4. **Kategorie-Vorlagen**
   - Vorlagen für häufige Use-Cases
   - "Berufs-Ziele", "Fitness-Ziele", etc.

5. **LLM-Integration**
   - Automatische Kategorisierung durch KI
   - "Dieses Ziel könnte zur Kategorie 'Beruf' passen"

---

**Dokumentiert am:** 30.01.2026  
**Status:** Feature ist vollständig spezifiziert und bereit für Implementierung
