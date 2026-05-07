import os
from dotenv import load_dotenv

load_dotenv()

APP_PASSWORD = os.getenv("APP_PASSWORD", "amora123")
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY", "")
DEFAULT_CITY = os.getenv("DEFAULT_CITY", "São Paulo")
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")

# Caminho do banco. Em prod (Fly.io) aponta pra volume persistente: /data/amora.db.
# Em dev mantém o ./amora.db relativo.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./amora.db")

# Flag de produção. Controla coisas como cookie Secure.
IS_PRODUCTION = os.getenv("IS_PRODUCTION", "0") == "1"

# Origins permitidos pelo CORS. Em produção monolítica (frontend e API no mesmo
# domínio) pode ficar vazio — o middleware é desligado quando não tem origins.
# Em dev, default cobre o Vite dev server.
_cors_raw = os.getenv("CORS_ORIGINS", "http://localhost:5173")
CORS_ORIGINS = [o.strip() for o in _cors_raw.split(",") if o.strip()]
