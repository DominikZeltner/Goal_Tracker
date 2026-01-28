# Konzept 1.3 / Phase 2.1: SQLAlchemy-Modell für Ziel
import os
from datetime import date
from typing import Optional

from sqlalchemy import Date, ForeignKey, Integer, String, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, sessionmaker

# DB-Pfad aus Umgebungsvariable, Default ./database.db
DB_PATH = os.getenv("DB_PATH", "./database.db")

# SQLite-Engine erstellen
engine = create_engine(f"sqlite:///{DB_PATH}", echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


class Ziel(Base):
    """SQLAlchemy-Modell für Ziele mit hierarchischer Struktur."""

    __tablename__ = "ziel"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    titel: Mapped[str] = mapped_column(String, nullable=False)
    beschreibung: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    start_datum: Mapped[date] = mapped_column(Date, nullable=False)
    end_datum: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False)  # z. B. "offen", "in Arbeit", "erledigt"
    parent_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("ziel.id"), nullable=True
    )

    # Relationship für hierarchische Struktur
    children: Mapped[list["Ziel"]] = relationship(
        "Ziel", backref="parent", remote_side=[id], cascade="all, delete-orphan", single_parent=True
    )
