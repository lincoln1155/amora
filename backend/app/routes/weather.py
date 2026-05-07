from fastapi import APIRouter, Depends, HTTPException, Cookie
import httpx
from app.config import WEATHER_API_KEY, DEFAULT_CITY
from app.routes.auth import verify_token

router = APIRouter(prefix="/weather", tags=["weather"])


def require_auth(session: str | None = Cookie(default=None)):
    if not verify_token(session):
        raise HTTPException(status_code=401, detail="Não autenticado")


@router.get("/", dependencies=[Depends(require_auth)])
async def get_weather(city: str = DEFAULT_CITY):
    if not WEATHER_API_KEY:
        raise HTTPException(status_code=503, detail="API de clima não configurada")

    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {"q": city, "appid": WEATHER_API_KEY, "units": "metric", "lang": "pt_br"}

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)

    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="Erro ao buscar clima")

    data = response.json()
    return {
        "city": data["name"],
        "temp": round(data["main"]["temp"]),
        "feels_like": round(data["main"]["feels_like"]),
        "description": data["weather"][0]["description"],
        "icon": data["weather"][0]["icon"],
        "humidity": data["main"]["humidity"],
    }
