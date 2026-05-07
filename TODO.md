# TODO

## Antes do deploy em produção

Itens identificados em 2026-05-06 ao expor o app via Cloudflare Tunnel pra teste em mobile. Não são urgentes pro dev local, mas vão quebrar em produção.

### 1. Desativar `redirect_slashes` do FastAPI
**Arquivo:** `backend/app/main.py`
**O que fazer:** trocar `FastAPI(title="Amora")` por `FastAPI(title="Amora", redirect_slashes=False)`.
**Por quê:** com `redirect_slashes=True` (padrão), uma chamada a `/events` (sem barra) recebe 307 com `Location` apontando pro host interno (`localhost:8000` por causa do `changeOrigin: true` no Vite proxy). Em ambientes onde o cliente não enxerga `localhost:8000` (mobile via tunnel, produção atrás de proxy), o redirect quebra silenciosamente. Melhor falhar com 404 explícito.

### 2. CORS via env var
**Arquivo:** `backend/app/main.py`
**O que fazer:** ler `allow_origins` de uma variável de ambiente (ex: `ALLOWED_ORIGINS`, separado por vírgula). Hoje está fixo em `["http://localhost:5173"]`.
**Por quê:** em produção o frontend não vai estar em `localhost:5173`, e qualquer chamada cross-origin do navegador será bloqueada.

### 3. Cookie `Secure` condicional
**Arquivo:** `backend/app/routes/auth.py` (no `response.set_cookie` do `/login`)
**O que fazer:** adicionar `secure=IS_PRODUCTION` (ler de env). Em dev local (HTTP) precisa ficar `False`; em prod (HTTPS) precisa ser `True`.
**Por quê:** sem `Secure`, o cookie de sessão pode ser exposto se algum link HTTP escapar. Não dá pra ligar agora porque quebraria o dev em `localhost` (HTTP).

### 4. Cookie `SameSite` para arquitetura cross-domain
**Arquivo:** `backend/app/routes/auth.py`
**O que fazer:** decidir arquitetura de deploy primeiro:
- Se frontend e backend ficarem no **mesmo domínio** (ex: ambos em `amora.app`, backend em `/api`) → manter `SameSite=Lax`, sem mudança.
- Se ficarem em **domínios diferentes** (ex: `amora.app` + `api.amora.app`) → trocar pra `SameSite=None` + `Secure=True` (obrigatório quando None).
**Por quê:** `Lax` não envia o cookie em chamadas cross-site (incluindo subdomínios diferentes em alguns contextos). Sem isso, autenticação quebra em prod.

---

## Notas

- O bug de trailing slash no frontend (`/api/events` vs `/api/events/`) já foi corrigido em `Dashboard.jsx`.
- Boa hora pra revisitar esses itens: quando começar a pensar em deploy de verdade.
