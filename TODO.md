# TODO

## Pré-deploy — RESOLVIDO em 2026-05-06

Todos os 4 itens identificados em 2026-05-06 foram tratados como parte da preparação pra Fly.io. Mantido aqui só pra histórico — nada precisa ser feito.

- [x] **`redirect_slashes=False`** em `backend/app/main.py`
- [x] **CORS via env var** (`CORS_ORIGINS` em `backend/app/config.py`). Em deploy monolítico fica vazio; em dev cobre `http://localhost:5173`.
- [x] **Cookie `Secure` condicional** — `IS_PRODUCTION` em `config.py`, usado em `auth.py`.
- [x] **Cookie `SameSite`** — fica `Lax` porque o deploy é monolítico (frontend e API mesmo domínio).

---

## Deploy no Railway — passo a passo

A infraestrutura tá pronta no repositório:
- `Dockerfile` (multi-stage: builda frontend, depois junta com Python; binda em `$PORT`)
- `.dockerignore`
- `railway.json` (build via Dockerfile, healthcheck em `/api/health`)

### Caminho mais fácil: deploy via GitHub

1. Push do código pro GitHub (já feito).
2. Em [railway.com](https://railway.com): **New Project → Deploy from GitHub repo → escolher `amora-app`**.
3. Railway detecta o Dockerfile e começa o build automaticamente.
4. Cada `git push` na branch principal vira um novo deploy.

### Configurar volume persistente (sem isso o SQLite reseta a cada deploy)

Na UI do Railway, dentro do projeto:
- **Settings → Volumes → New Volume**
- Mount path: `/data`
- Tamanho: 1 GB já é folgado.

### Configurar variáveis de ambiente

**Variables → Raw Editor**, colar:

```
APP_PASSWORD=troque_essa_senha
SECRET_KEY=gerar_string_aleatoria_aqui
WEATHER_API_KEY=sua_chave_openweathermap
DEFAULT_CITY=São Paulo
DATABASE_URL=sqlite:////data/amora.db
IS_PRODUCTION=1
```

Pra gerar `SECRET_KEY`: `openssl rand -hex 32` (32 bytes aleatórios).

Importante: deixar `CORS_ORIGINS` **fora** do env (ou vazio) — o frontend e a API ficam no mesmo domínio do Railway, sem necessidade de CORS.

### Gerar o domínio público

**Settings → Networking → Generate Domain**. Vai sair algo como `amora-production.up.railway.app`.

### Caminho alternativo: CLI

Se preferir terminal:

```bash
npm i -g @railway/cli
railway login
cd /home/kan/amora-app
railway init       # cria projeto
railway up         # builda e deploya
railway variables set APP_PASSWORD=... SECRET_KEY=... WEATHER_API_KEY=...
```

Volume e domínio ainda precisam passar pela UI.

### Domínio custom (depois)

**Settings → Networking → Custom Domain → digitar dominio.com**, e adicionar o CNAME que o Railway indicar no DNS.

---

## Possibilidade futura: sistema multi-usuário

Discutido em 2026-05-06. Hoje o app é single-user com senha compartilhada (`APP_PASSWORD`). Se algum dia mais alguém quiser usar, transformar em multi-tenant é viável (~1 dia de trabalho focado pro MVP), mas adiar até ter caso de uso real é melhor — o design fica mais alinhado com o que o segundo usuário realmente precisa.

**O que precisaria mudar quando for a hora:**

1. **Tabela `User`** — `id`, `username`, `password_hash` (trocar sha256 por bcrypt), `created_at`.
2. **Auth refeito** — login passa a aceitar `username` + `password`. O set `_valid_tokens` em `auth.py` vira `dict[token, user_id]`. `verify_token` retorna o `user_id` em vez de `bool`. Cada `require_auth` injeta o usuário atual via `Depends`.
3. **FK `user_id` em todas as tabelas de dados** — Event, Habit, Note, Settings. Toda query passa a filtrar por `user_id`. Toda criação preenche o campo a partir do usuário autenticado.
4. **Cadastro** — novo endpoint `/auth/register` e tela de cadastro no frontend. Decidir se é aberto ou só por convite (segurança).
5. **Migração dos dados existentes** — script pra criar um usuário "inicial" e atribuir todos os Events/Habits/Notes existentes a ele.

**Por que não fazer agora:** YAGNI. Cada feature nova custaria mais escrever sob multi-tenant, sem benefício enquanto for só uma pessoa usando. O código atual já tá fatorado de jeito que torna o refactor futuro chato mas direto — sem dívida arquitetural acumulada.
