# Konzept 1.3 / Phase 2.1: SQLAlchemy-Modell für Ziel
import os
from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, Text, create_engine
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
    beschreibung: Mapped[str | None] = mapped_column(String, nullable=True)
    start_datum: Mapped[date] = mapped_column(Date, nullable=False)
    end_datum: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False)  # z. B. "offen", "in Arbeit", "erledigt"
    parent_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("ziel.id"), nullable=True
    )

    # Relationship für hierarchische Struktur
    children: Mapped[list["Ziel"]] = relationship(
        "Ziel", backref="parent", remote_side=[id], cascade="all, delete-orphan", single_parent=True
    )
    
    # Relationship für History
    history: Mapped[list["ZielHistory"]] = relationship(
        "ZielHistory", back_populates="ziel", cascade="all, delete-orphan"
    )
    
    # Relationship für Kommentare
    kommentare: Mapped[list["Kommentar"]] = relationship(
        "Kommentar", back_populates="ziel", cascade="all, delete-orphan"
    )


class ZielHistory(Base):
    """History-Tabelle für Änderungen an Zielen."""

    __tablename__ = "ziel_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ziel_id: Mapped[int] = mapped_column(Integer, ForeignKey("ziel.id"), nullable=False)
    changed_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    change_type: Mapped[str] = mapped_column(String(50), nullable=False)
    # 'created', 'updated', 'status_changed', 'deleted', 'comment_added'
    field_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    old_value: Mapped[str | None] = mapped_column(Text, nullable=True)
    new_value: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationship
    ziel: Mapped["Ziel"] = relationship("Ziel", back_populates="history")


class Kommentar(Base):
    """Kommentare/Notizen zu Zielen."""

    __tablename__ = "kommentar"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ziel_id: Mapped[int] = mapped_column(Integer, ForeignKey("ziel.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)

    # Relationship
    ziel: Mapped["Ziel"] = relationship("Ziel", back_populates="kommentare")


# Alle Tabellen erstellen
Base.metadata.create_all(bind=engine)
