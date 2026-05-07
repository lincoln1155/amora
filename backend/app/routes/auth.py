from fastapi import APIRouter, HTTPException, Response, Cookie
from pydantic import BaseModel
import hashlib
import secrets
from app.config import APP_PASSWORD, SECRET_KEY, IS_PRODUCTION

router = APIRouter(prefix="/auth", tags=["auth"])

# Token simples em memória (reinicia com o servidor — aceitável para uso pessoal)
_valid_tokens: set[str] = set()


def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def verify_token(token: str | None) -> bool:
    return token is not None and token in _valid_tokens


class LoginRequest(BaseModel):
    password: str


@router.post("/login")
def login(body: LoginRequest, response: Response):
    if body.password != APP_PASSWORD:
        raise HTTPException(status_code=401, detail="Senha incorreta")

    token = secrets.token_hex(32)
    _valid_tokens.add(token)

    response.set_cookie(
        key="session",
        value=token,
        httponly=True,
        samesite="lax",
        secure=IS_PRODUCTION,
        max_age=60 * 60 * 24 * 30,  # 30 dias
    )
    return {"ok": True}


@router.post("/logout")
def logout(response: Response, session: str | None = Cookie(default=None)):
    if session in _valid_tokens:
        _valid_tokens.discard(session)
    response.delete_cookie("session")
    return {"ok": True}


@router.get("/me")
def me(session: str | None = Cookie(default=None)):
    if not verify_token(session):
        raise HTTPException(status_code=401, detail="Não autenticado")
    return {"authenticated": True}
