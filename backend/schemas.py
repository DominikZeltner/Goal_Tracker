# Konzept 1.4 / Phase 2.2: Pydantic-Modelle für Ziel
from datetime import date

from pydantic import BaseModel


class ZielCreate(BaseModel):
    """Schema zum Erstellen eines Ziels (parent_id optional)."""

    titel: str
    beschreibung: str | None = None
    start_datum: date
    end_datum: date
    status: str  # z. B. "offen", "in Arbeit", "erledigt"
    parent_id: int | None = None


class ZielRead(BaseModel):
    """Schema zum Lesen eines Ziels (mit id)."""

    id: int
    titel: str
    beschreibung: str | None = None
    start_datum: date
    end_datum: date
    status: str
    parent_id: int | None = None

    class Config:
        from_attributes = True  # Pydantic v2: für SQLAlchemy-Modelle


class ZielReadWithChildren(BaseModel):
    """Schema zum Lesen eines Ziels mit hierarchischen Unterzielen."""

    id: int
    titel: str
    beschreibung: str | None = None
    start_datum: date
    end_datum: date
    status: str
    parent_id: int | None = None
    children: list["ZielReadWithChildren"] = []

    class Config:
        from_attributes = True  # Pydantic v2: für SQLAlchemy-Modelle


# Forward-Referenz für rekursive Struktur auflösen
ZielReadWithChildren.model_rebuild()
