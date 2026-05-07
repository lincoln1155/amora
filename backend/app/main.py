from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import CORS_ORIGINS
from app.database import create_db
from app.routes import auth, events, weather, settings, habits, notes

app = FastAPI(title="Amora", redirect_slashes=False)

if CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Todas as rotas da API ficam sob /api/* (deixa a raiz livre pro frontend estático).
app.include_router(auth.router, prefix="/api")
app.include_router(events.router, prefix="/api")
app.include_router(weather.router, prefix="/api")
app.include_router(settings.router, prefix="/api")
app.include_router(habits.router, prefix="/api")
app.include_router(notes.router, prefix="/api")


@app.on_event("startup")
def on_startup():
    create_db()


@app.get("/api/health")
def health():
    return {"status": "ok"}


# Em produção (Docker), o frontend buildado fica em /app/static.
# Em dev local, esse diretório não existe — o StaticFiles é montado só se existir,
# senão o Vite dev server cuida do frontend (porta 5173) com proxy de /api/*.
_static_dir = Path(__file__).resolve().parent.parent / "static"
if _static_dir.is_dir():
    app.mount("/", StaticFiles(directory=_static_dir, html=True), name="static")
