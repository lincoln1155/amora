from sqlmodel import SQLModel, create_engine, Session
from app.config import DATABASE_URL
from app.models import Settings

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})


def create_db():
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        if session.get(Settings, 1) is None:
            session.add(Settings())
            session.commit()


def get_session():
    with Session(engine) as session:
        yield session
