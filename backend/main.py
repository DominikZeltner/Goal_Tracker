
from datetime import datetime

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

from models import Base, SessionLocal, Ziel, ZielHistory, engine
from schemas import ZielCreate, ZielHistoryRead, ZielRead, ZielReadWithChildren

# Konzept Phase 2.3: Tabellen beim App-Start anlegen
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Goal Tracker API")

# Konzept 1.2 / 1.4 / Phase 3.6: FastAPI-Backend, REST-API.
# CORS für lokale Entwicklung (Vite Dev-Server auf 5173) und Docker (Frontend auf 80)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite Dev-Server
        "http://localhost",       # Docker Frontend (Port 80)
        "http://localhost:80",    # Docker Frontend (explizit)
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Dependency für DB-Session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


# Konzept Phase 2.3: CRUD-Endpunkte für Ziele


@app.post("/ziele", response_model=ZielRead, status_code=201)
def create_ziel(ziel: ZielCreate, db: Session = Depends(get_db)) -> ZielRead:
    """Neues Ziel erstellen."""
    db_ziel = Ziel(**ziel.model_dump())
    db.add(db_ziel)
    db.commit()
    db.refresh(db_ziel)
    
    # History-Eintrag: Ziel erstellt
    log_history(db, db_ziel.id, "created")
    db.commit()
    
    # Eltern-Ziel-Daten aktualisieren, falls ein Parent existiert
    if db_ziel.parent_id:
        update_parent_dates(db_ziel.parent_id, db)
    
    return ZielRead.model_validate(db_ziel)


@app.get("/ziele")
def get_ziele(
    tree: int | None = Query(None, description="1 für hierarchische Struktur"),
    db: Session = Depends(get_db),
):
    """Ziele laden (flach oder hierarchisch)."""
    if tree == 1:
        # Hierarchisch: Nur Hauptziele (parent_id is None) laden, mit children
        from sqlalchemy.orm import joinedload
        stmt = select(Ziel).where(Ziel.parent_id.is_(None)).options(joinedload(Ziel.children))
        root_ziele = db.scalars(stmt).unique().all()
        return [build_tree(ziel, db) for ziel in root_ziele]
    else:
        # Flach: Alle Ziele
        stmt = select(Ziel)
        ziele = db.scalars(stmt).all()
        return [ZielRead.model_validate(ziel) for ziel in ziele]


@app.get("/ziele/tree", response_model=list[ZielReadWithChildren])
def get_ziele_tree(db: Session = Depends(get_db)) -> list[ZielReadWithChildren]:
    """Ziele hierarchisch als Baum laden (Alternative zu GET /ziele?tree=1)."""
    from sqlalchemy.orm import joinedload
    stmt = select(Ziel).where(Ziel.parent_id.is_(None)).options(joinedload(Ziel.children))
    root_ziele = db.scalars(stmt).unique().all()
    return [build_tree(ziel, db) for ziel in root_ziele]


@app.get("/ziele/{ziel_id}", response_model=ZielRead)
def get_ziel(ziel_id: int, db: Session = Depends(get_db)) -> ZielRead:
    """Einzelnes Ziel nach ID laden."""
    ziel = db.get(Ziel, ziel_id)
    if ziel is None:
        raise HTTPException(status_code=404, detail="Ziel nicht gefunden")
    return ZielRead.model_validate(ziel)


@app.get("/ziele/{ziel_id}/history", response_model=list[ZielHistoryRead])
def get_ziel_history(ziel_id: int, db: Session = Depends(get_db)) -> list[ZielHistoryRead]:
    """History-Einträge für ein Ziel laden (chronologisch)."""
    # Prüfe ob Ziel existiert
    ziel = db.get(Ziel, ziel_id)
    if ziel is None:
        raise HTTPException(status_code=404, detail="Ziel nicht gefunden")
    
    # Lade History-Einträge (neueste zuerst)
    stmt = select(ZielHistory).where(ZielHistory.ziel_id == ziel_id).order_by(ZielHistory.changed_at.desc())
    history_entries = db.scalars(stmt).all()
    return [ZielHistoryRead.model_validate(entry) for entry in history_entries]


@app.put("/ziele/{ziel_id}", response_model=ZielRead)
def update_ziel(
    ziel_id: int, ziel: ZielCreate, db: Session = Depends(get_db)
) -> ZielRead:
    """Ziel vollständig aktualisieren."""
    db_ziel = db.get(Ziel, ziel_id)
    if db_ziel is None:
        raise HTTPException(status_code=404, detail="Ziel nicht gefunden")
    
    old_parent_id = db_ziel.parent_id
    
    # History-Logging: Geänderte Felder tracken
    for key, value in ziel.model_dump().items():
        old_val = getattr(db_ziel, key)
        if old_val != value:
            # Konvertiere Werte zu String für History
            old_str = str(old_val) if old_val is not None else None
            new_str = str(value) if value is not None else None
            log_history(db, ziel_id, "updated", field_name=key, old_value=old_str, new_value=new_str)
        setattr(db_ziel, key, value)
    
    db.commit()
    db.refresh(db_ziel)
    
    # Eltern-Ziel-Daten aktualisieren (falls vorhanden)
    if db_ziel.parent_id:
        update_parent_dates(db_ziel.parent_id, db)
    
    # Falls parent_id geändert wurde, auch alten Parent aktualisieren
    if old_parent_id and old_parent_id != db_ziel.parent_id:
        update_parent_dates(old_parent_id, db)
    
    return ZielRead.model_validate(db_ziel)


@app.patch("/ziele/{ziel_id}", response_model=ZielRead)
def update_ziel_status(
    ziel_id: int, status: dict[str, str], db: Session = Depends(get_db)
) -> ZielRead:
    """Status eines Ziels aktualisieren."""
    db_ziel = db.get(Ziel, ziel_id)
    if db_ziel is None:
        raise HTTPException(status_code=404, detail="Ziel nicht gefunden")
    if "status" not in status:
        raise HTTPException(status_code=400, detail="Status-Feld fehlt")
    
    old_status = db_ziel.status
    new_status = status["status"]
    
    # History-Eintrag: Status geändert
    if old_status != new_status:
        log_history(db, ziel_id, "status_changed", field_name="status", old_value=old_status, new_value=new_status)
    
    db_ziel.status = new_status
    db.commit()
    db.refresh(db_ziel)
    return ZielRead.model_validate(db_ziel)


@app.delete("/ziele/{ziel_id}", status_code=204)
def delete_ziel(
    ziel_id: int,
    cascade: bool = Query(False, description="True = Unterziele auch löschen"),
    db: Session = Depends(get_db)
) -> None:
    """Ziel löschen (optional mit allen Unterzielen)."""
    db_ziel = db.get(Ziel, ziel_id)
    if db_ziel is None:
        raise HTTPException(status_code=404, detail="Ziel nicht gefunden")
    
    if cascade:
        # Rekursiv alle Unterziele löschen
        delete_with_children(db_ziel, db)
    else:
        # Nur dieses Ziel löschen
        db.delete(db_ziel)
    
    db.commit()


def delete_with_children(ziel: Ziel, db: Session) -> None:
    """Rekursiv Ziel mit allen Unterzielen löschen."""
    # Erst alle Kinder löschen
    stmt = select(Ziel).where(Ziel.parent_id == ziel.id)
    children = db.scalars(stmt).all()
    for child in children:
        delete_with_children(child, db)
    # Dann das Ziel selbst löschen
    db.delete(ziel)


def update_parent_dates(parent_id: int, db: Session) -> None:
    """
    Aktualisiert die Daten eines Eltern-Ziels basierend auf seinen Unterzielen.
    Setzt start_datum auf das kleinste und end_datum auf das größte der Unterziele.
    Funktion ist rekursiv - aktualisiert die komplette Hierarchie nach oben.
    """
    # Eltern-Ziel laden
    parent = db.get(Ziel, parent_id)
    if not parent:
        return
    
    # Alle Unterziele laden
    stmt = select(Ziel).where(Ziel.parent_id == parent_id)
    children = db.scalars(stmt).all()
    
    if not children:
        # Keine Unterziele vorhanden - nichts zu tun
        return
    
    # Kleinste und größte Daten finden
    min_start = min(child.start_datum for child in children)
    max_end = max(child.end_datum for child in children)
    
    # Eltern-Ziel aktualisieren
    parent.start_datum = min_start
    parent.end_datum = max_end
    db.commit()
    
    # REKURSIV: Falls dieses Ziel selbst ein Parent hat, auch dieses aktualisieren
    if parent.parent_id:
        update_parent_dates(parent.parent_id, db)


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
        changed_at=datetime.utcnow(),
        change_type=change_type,
        field_name=field_name,
        old_value=old_value,
        new_value=new_value
    )
    db.add(history_entry)
    # Kein commit hier - wird vom Haupt-Endpoint gemacht


# Hilfsfunktion für hierarchische Struktur
def build_tree(ziel: Ziel, db: Session) -> ZielReadWithChildren:
    """Rekursiv Baum-Struktur aufbauen."""
    from sqlalchemy.orm import joinedload
    # Children rekursiv laden (mit joinedload für verschachtelte Strukturen)
    stmt = select(Ziel).where(Ziel.parent_id == ziel.id).options(joinedload(Ziel.children))
    children = db.scalars(stmt).unique().all()
    children_data = [build_tree(child, db) for child in children]
    # Ziel-Daten ohne children erstellen, dann children setzen
    ziel_dict = {
        "id": ziel.id,
        "titel": ziel.titel,
        "beschreibung": ziel.beschreibung,
        "start_datum": ziel.start_datum,
        "end_datum": ziel.end_datum,
        "status": ziel.status,
        "parent_id": ziel.parent_id,
        "children": children_data
    }
    return ZielReadWithChildren(**ziel_dict)


if __name__ == "__main__":
    import uvicorn

    # Start per uvicorn auf Port 8000 (siehe Kriterien).
    # Empfohlen aus dem Repo-Root:
    #   uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
