from fastapi import APIRouter, Depends, HTTPException, Cookie
from sqlmodel import Session, select
from app.database import get_session
from app.models import Event, EventCreate, EventUpdate
from app.routes.auth import verify_token

router = APIRouter(prefix="/events", tags=["events"])


def require_auth(session: str | None = Cookie(default=None)):
    if not verify_token(session):
        raise HTTPException(status_code=401, detail="Não autenticado")


@router.get("/", dependencies=[Depends(require_auth)])
def list_events(db: Session = Depends(get_session)):
    return db.exec(select(Event).order_by(Event.start_date)).all()


@router.post("/", dependencies=[Depends(require_auth)])
def create_event(event: EventCreate, db: Session = Depends(get_session)):
    db_event = Event.model_validate(event)
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


@router.put("/{event_id}", dependencies=[Depends(require_auth)])
def update_event(event_id: int, event: EventUpdate, db: Session = Depends(get_session)):
    db_event = db.get(Event, event_id)
    if not db_event:
        raise HTTPException(status_code=404, detail="Evento não encontrado")
    for field, value in event.model_dump(exclude_unset=True).items():
        setattr(db_event, field, value)
    db.commit()
    db.refresh(db_event)
    return db_event


@router.delete("/{event_id}", dependencies=[Depends(require_auth)])
def delete_event(event_id: int, db: Session = Depends(get_session)):
    db_event = db.get(Event, event_id)
    if not db_event:
        raise HTTPException(status_code=404, detail="Evento não encontrado")
    db.delete(db_event)
    db.commit()
    return {"ok": True}
