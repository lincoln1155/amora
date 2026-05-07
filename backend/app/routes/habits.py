from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException, Cookie
from sqlmodel import Session, select
from app.database import get_session
from app.models import Habit, HabitCreate, HabitCheckin
from app.routes.auth import verify_token

router = APIRouter(prefix="/habits", tags=["habits"])


def require_auth(session: str | None = Cookie(default=None)):
    if not verify_token(session):
        raise HTTPException(status_code=401, detail="Não autenticado")


def calculate_streak(checkin_dates: list[date]) -> int:
    """checkin_dates deve estar ordenado em ordem decrescente (mais recente primeiro)."""
    if not checkin_dates:
        return 0
    today = date.today()
    yesterday = today - timedelta(days=1)
    # Streak só está "ativo" se o último check-in foi hoje ou ontem
    if checkin_dates[0] != today and checkin_dates[0] != yesterday:
        return 0
    streak = 1
    for i in range(1, len(checkin_dates)):
        if checkin_dates[i] == checkin_dates[i - 1] - timedelta(days=1):
            streak += 1
        else:
            break
    return streak


def serialize_habit(habit: Habit, db: Session) -> dict:
    today = date.today()
    checkins = db.exec(
        select(HabitCheckin)
        .where(HabitCheckin.habit_id == habit.id)
        .order_by(HabitCheckin.date.desc())
    ).all()
    dates = [c.date for c in checkins]
    return {
        "id": habit.id,
        "name": habit.name,
        "emoji": habit.emoji,
        "current_streak": calculate_streak(dates),
        "done_today": today in dates,
    }


@router.get("/", dependencies=[Depends(require_auth)])
def list_habits(db: Session = Depends(get_session)):
    habits = db.exec(select(Habit).order_by(Habit.created_at)).all()
    return [serialize_habit(h, db) for h in habits]


@router.post("/", dependencies=[Depends(require_auth)])
def create_habit(payload: HabitCreate, db: Session = Depends(get_session)):
    habit = Habit.model_validate(payload)
    db.add(habit)
    db.commit()
    db.refresh(habit)
    return serialize_habit(habit, db)


@router.delete("/{habit_id}", dependencies=[Depends(require_auth)])
def delete_habit(habit_id: int, db: Session = Depends(get_session)):
    habit = db.get(Habit, habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Hábito não encontrado")
    # Apaga check-ins relacionados (sem cascade configurado no schema)
    checkins = db.exec(select(HabitCheckin).where(HabitCheckin.habit_id == habit_id)).all()
    for c in checkins:
        db.delete(c)
    db.delete(habit)
    db.commit()
    return {"ok": True}


@router.post("/{habit_id}/toggle", dependencies=[Depends(require_auth)])
def toggle_today(habit_id: int, db: Session = Depends(get_session)):
    habit = db.get(Habit, habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Hábito não encontrado")
    today = date.today()
    existing = db.exec(
        select(HabitCheckin).where(
            HabitCheckin.habit_id == habit_id,
            HabitCheckin.date == today,
        )
    ).first()
    if existing:
        db.delete(existing)
    else:
        db.add(HabitCheckin(habit_id=habit_id, date=today))
    db.commit()
    return serialize_habit(habit, db)
