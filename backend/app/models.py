from sqlmodel import SQLModel, Field
from typing import Annotated, Optional
from datetime import datetime, date, timezone
from pydantic import PlainSerializer


def _utc_iso(dt: datetime | None) -> str | None:
    """Serializa datetime sempre com offset UTC explícito (sufixo +00:00).

    Como SQLite não preserva timezone, datetimes lidos do banco vêm como naive.
    Aqui assumimos que naive == UTC (consistente com como gravamos via datetime.now(timezone.utc)).
    """
    if dt is None:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat()


UtcDatetime = Annotated[datetime, PlainSerializer(_utc_iso, return_type=str, when_used="json")]


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Event(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    start_date: UtcDatetime
    end_date: Optional[UtcDatetime] = None
    color: str = "#c4b5fd"
    created_at: UtcDatetime = Field(default_factory=_utc_now)


class EventCreate(SQLModel):
    title: str
    description: Optional[str] = None
    start_date: datetime
    end_date: Optional[datetime] = None
    color: str = "#c4b5fd"


class EventUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    color: Optional[str] = None


class Settings(SQLModel, table=True):
    id: Optional[int] = Field(default=1, primary_key=True)
    display_name: str = "você"


class SettingsUpdate(SQLModel):
    display_name: Optional[str] = None


class Habit(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    emoji: str = "✨"
    created_at: UtcDatetime = Field(default_factory=_utc_now)


class HabitCreate(SQLModel):
    name: str
    emoji: str = "✨"


class HabitCheckin(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    habit_id: int = Field(foreign_key="habit.id", index=True)
    date: date


class Note(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    content: str
    created_at: UtcDatetime = Field(default_factory=_utc_now)
    updated_at: UtcDatetime = Field(default_factory=_utc_now)


class NoteCreate(SQLModel):
    content: str


class NoteUpdate(SQLModel):
    content: Optional[str] = None
