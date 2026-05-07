# syntax=docker/dockerfile:1.7

# ── Stage 1: build do frontend (Node) ──
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend

# Cache de deps: copia só o manifesto antes do código
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Agora o código do frontend e build
COPY frontend/ ./
RUN npm run build
# saída: /app/frontend/dist

# ── Stage 2: backend Python servindo tudo ──
FROM python:3.12-slim AS runtime
WORKDIR /app

# Mantém o Python silencioso e sem cache de bytecode na imagem
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

COPY backend/requirements.txt ./
RUN pip install -r requirements.txt

# Código do backend
COPY backend/app ./app

# Frontend buildado vai pra ./static (caminho que main.py procura)
COPY --from=frontend-build /app/frontend/dist ./static

EXPOSE 8000

# $PORT é setado pela Railway em runtime; default 8000 pra rodar local com `docker run`.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
