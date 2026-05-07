from fastapi import APIRouter, Depends, HTTPException, Cookie
from sqlmodel import Session
from app.database import get_session
from app.models import Settings, SettingsUpdate
from app.routes.auth import verify_token

router = APIRouter(prefix="/settings", tags=["settings"])


def require_auth(session: str | None = Cookie(default=None)):
    if not verify_token(session):
        raise HTTPException(status_code=401, detail="Não autenticado")


@router.get("/", dependencies=[Depends(require_auth)])
def get_settings(db: Session = Depends(get_session)):
    settings = db.get(Settings, 1)
    if settings is None:
        settings = Settings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.put("/", dependencies=[Depends(require_auth)])
def update_settings(payload: SettingsUpdate, db: Session = Depends(get_session)):
    settings = db.get(Settings, 1)
    if settings is None:
        settings = Settings()
        db.add(settings)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(settings, field, value)
    db.commit()
    db.refresh(settings)
    return settings
