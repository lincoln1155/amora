from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime


class Event(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    start_date: datetime
    end_date: Optional[datetime] = None
    color: str = "#c4b5fd"
    created_at: datetime = Field(default_factory=datetime.utcnow)


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
