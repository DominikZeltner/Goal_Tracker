# Debug-Strategie: Timeline zeigt keine Ziele

## Problem-Zusammenfassung

**Symptome:**
- Timeline-Seite lädt, aber zeigt keine Ziele an
- CSP-Fehler: "Content Security Policy blocks the use of 'eval' in JavaScript"
- API liefert korrekte Daten (2 Ziele)
- Problem besteht auch im Inkognito-Modus

**Erwartetes Verhalten:**
- Timeline sollte 2 Ziele als Balken anzeigen
- Keine CSP-Fehler
- vis-timeline sollte `eval()` nutzen können

---

## Phase 1: HTTP-Header Verifizierung

### Ziel
Verifizieren, dass Nginx die korrekten CSP-Header sendet.

### Tests

#### Test 1.1: HTTP-Header für HTML-Seite prüfen
```bash
curl -I http://localhost/
```
**Erwartet:**
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval'; ...
```

#### Test 1.2: HTTP-Header für JavaScript-Files prüfen
```bash
curl -I http://localhost/assets/index-*.js
```
**Erwartet:**
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval'; ...
Cache-Control: public, immutable
```

#### Test 1.3: Browser Network-Tab
1. F12 → Network-Tab öffnen
2. Seite neu laden (Strg + Shift + R)
3. Klick auf `index.html`
4. → "Headers" → "Response Headers"
5. Prüfe: `Content-Security-Policy`

**Erwartet:**
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' http://localhost:8000;
```

### Ergebnis Phase 1
- [ ] HTML-Seite hat CSP mit `unsafe-eval`
- [ ] JS-Files haben CSP mit `unsafe-eval`
- [ ] Browser empfängt CSP korrekt

**Falls NEIN:** Nginx-Config ist falsch → nginx.conf korrigieren

---

## Phase 2: Browser-Seite Analyse

### Ziel
Prüfen, welche JavaScript-Fehler auftreten und ob das Frontend die Daten empfängt.

### Tests

#### Test 2.1: Console-Logs prüfen
1. F12 → Console-Tab öffnen
2. Filter: "Ziele"
3. Suche nach:
   - `Ziele geladen: [...]`
   - `Timeline Items gemappt: [...]`
   - `Anzahl Items: 2`
   - `Timeline erstellt mit 2 Items`
   - `Timeline fokussiert auf Items`

**Erwartet:** Alle 5 Log-Zeilen vorhanden

#### Test 2.2: JavaScript-Fehler prüfen
1. F12 → Console-Tab
2. Filter auf "Errors" (rot)
3. Prüfe, ob JavaScript-Fehler auftreten

**Häufige Fehler:**
- `Cannot read property 'appendChild' of null` → DOM-Element fehlt
- `eval is not defined` → CSP blockiert eval
- `vis is not defined` → vis-timeline nicht geladen

#### Test 2.3: Network-Requests prüfen
1. F12 → Network-Tab
2. Filter: `ziele`
3. Prüfe Request zu `/ziele`
4. Status: 200 OK?
5. Response: `[{id:1,...}, {id:2,...}]`?

**Erwartet:** 200 OK, 2 Ziele in Response

### Ergebnis Phase 2
- [ ] Console zeigt alle Debug-Logs
- [ ] Keine JavaScript-Fehler
- [ ] API-Request erfolgreich (200 OK)
- [ ] Daten im Frontend angekommen

**Falls NEIN:** JavaScript-Fehler analysieren → Code debuggen

---

## Phase 3: Timeline-Rendering Debug

### Ziel
Prüfen, ob vis-timeline initialisiert wird und Daten erhält.

### Tests

#### Test 3.1: Timeline-Instanz prüfen (Console)
```javascript
// In Browser-Console eingeben:
window.timelineDebug = true;
```

Dann in `Timeline.tsx` erweitern:
```typescript
if ((window as any).timelineDebug) {
  console.log('Timeline Ref:', timelineRef.current);
  console.log('Timeline Instance:', timelineInstance.current);
  console.log('Items in Timeline:', items.get());
}
```

#### Test 3.2: vis-timeline Library prüfen
```javascript
// In Browser-Console:
console.log(typeof window);
// Prüfe ob vis-timeline geladen ist
```

#### Test 3.3: Timeline-Options prüfen
Füge in `Timeline.tsx` nach `options` hinzu:
```typescript
console.log('Timeline Options:', JSON.stringify(options, null, 2));
```

### Ergebnis Phase 3
- [ ] Timeline-Ref zeigt auf DOM-Element
- [ ] Timeline-Instanz existiert
- [ ] Items wurden korrekt gemappt
- [ ] vis-timeline Library ist geladen

**Falls NEIN:** Timeline-Initialisierung schlägt fehl → vis-timeline Problem

---

## Phase 4: DOM-Inspektion

### Ziel
Prüfen, ob das Timeline-Container-Element existiert und ob vis-timeline HTML generiert.

### Tests

#### Test 4.1: Timeline-Container prüfen
1. F12 → Elements/Elemente-Tab
2. Suche nach: `<div ref={timelineRef}`
3. Prüfe:
   - Existiert das `<div>`?
   - Hat es Kinder-Elemente?
   - Hat es die Klasse `vis-timeline`?

**Erwartet:**
```html
<div class="border border-gray-200 rounded">
  <div class="vis-timeline">
    <!-- vis-timeline HTML -->
  </div>
</div>
```

#### Test 4.2: vis-timeline HTML prüfen
Wenn Timeline initialisiert wurde, sollte vis-timeline folgendes HTML generieren:
```html
<div class="vis-timeline">
  <div class="vis-panel vis-center">
    <div class="vis-content">
      <div class="vis-itemset">
        <!-- Items hier -->
      </div>
    </div>
  </div>
</div>
```

**Falls KEIN HTML generiert wurde:** vis-timeline läuft nicht

#### Test 4.3: Prüfe CSS-Visibility
Möglicherweise sind die Items vorhanden, aber unsichtbar.

1. F12 → Elements-Tab
2. Suche nach: `.vis-item`
3. Falls vorhanden, prüfe CSS:
   - `display: none`?
   - `visibility: hidden`?
   - `opacity: 0`?
   - `height: 0`?

### Ergebnis Phase 4
- [ ] Timeline-Container existiert im DOM
- [ ] vis-timeline hat HTML generiert
- [ ] Items sind sichtbar (nicht hidden)

**Falls NEIN:** DOM-Problem oder CSS-Problem

---

## Phase 5: Alternativer Ansatz (Falls alles fehlschlägt)

### Option A: vis-timeline komplett neu initialisieren
Entferne `useRef` und erstelle Timeline direkt nach Daten-Load.

### Option B: vis-timeline CSS prüfen
```typescript
import 'vis-timeline/styles/vis-timeline-graph2d.min.css'; // Statt .css
```

### Option C: Timeline mit festen Test-Daten initialisieren
```typescript
const testItems = new DataSet([
  { id: 1, content: 'Test Item 1', start: '2026-01-01', end: '2026-01-15' },
  { id: 2, content: 'Test Item 2', start: '2026-01-10', end: '2026-01-25' },
]);
```

Falls Test-Daten funktionieren → Problem liegt im Daten-Mapping

---

## Zusammenfassung

### Kritische Prüfpunkte (in Reihenfolge):
1. ✅ Nginx sendet CSP mit `unsafe-eval` (Phase 1)
2. ✅ Browser empfängt CSP korrekt (Phase 1)
3. ✅ Keine CSP-Fehler in Console (Phase 2)
4. ✅ Keine JavaScript-Fehler (Phase 2)
5. ✅ API-Daten kommen an (Phase 2)
6. ✅ Timeline wird initialisiert (Phase 3)
7. ✅ vis-timeline generiert HTML (Phase 4)
8. ✅ Items sind im DOM sichtbar (Phase 4)

### Nächste Schritte:
Arbeite die Phasen **nacheinander** ab. Nach jeder Phase: **STOPP** und bewerte das Ergebnis.

**Wichtig:** Nicht mehrere Fixes gleichzeitig machen! Sonst wissen wir nicht, was funktioniert hat.
