import os
from dotenv import load_dotenv

load_dotenv()

APP_PASSWORD = os.getenv("APP_PASSWORD", "amora123")
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY", "")
DEFAULT_CITY = os.getenv("DEFAULT_CITY", "São Paulo")
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
