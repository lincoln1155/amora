from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Cookie
from sqlmodel import Session, select
from app.database import get_session
from app.models import Note, NoteCreate, NoteUpdate
from app.routes.auth import verify_token

router = APIRouter(prefix="/notes", tags=["notes"])


def require_auth(session: str | None = Cookie(default=None)):
    if not verify_token(session):
        raise HTTPException(status_code=401, detail="Não autenticado")


@router.get("/", dependencies=[Depends(require_auth)])
def list_notes(db: Session = Depends(get_session)):
    return db.exec(select(Note).order_by(Note.updated_at.desc())).all()


@router.post("/", dependencies=[Depends(require_auth)])
def create_note(payload: NoteCreate, db: Session = Depends(get_session)):
    if not payload.content.strip():
        raise HTTPException(status_code=400, detail="Conteúdo vazio")
    note = Note(content=payload.content)
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.put("/{note_id}", dependencies=[Depends(require_auth)])
def update_note(note_id: int, payload: NoteUpdate, db: Session = Depends(get_session)):
    note = db.get(Note, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Nota não encontrada")
    if payload.content is not None:
        if not payload.content.strip():
            raise HTTPException(status_code=400, detail="Conteúdo vazio")
        note.content = payload.content
        note.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(note)
    return note


@router.delete("/{note_id}", dependencies=[Depends(require_auth)])
def delete_note(note_id: int, db: Session = Depends(get_session)):
    note = db.get(Note, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Nota não encontrada")
    db.delete(note)
    db.commit()
    return {"ok": True}
