prompt pro gemini:

quero construir um site (que seja usavel no mobile) focado em organização, com um calendário, um lugarzinho pra eventos e esse tipo de funcionalidades. a ideia é ser um app moderno, bem focado num estilo fofo (é pra uso pessoal), estilo single page, que funcione no mobile tambem. tenho proficiencia em python mas não sou muito bom com javascript/typescript (apesar de conseguir usar IA nessa parte). quais tecnologias vc recomenda?

o loop ideal é: usuario entra, faz um login simples, e então é recebido com uma página de bem vindo, com uma foto de desenho (com mensagem  e fotos variadas dependendo do horario) dai mostra tbm o clima com base em uma cidade predefinida pelo usuario. dai passando pro lado, tem uma aba de "proximos eventos" e scrollando pra baixo um calendário geral (com possiblidade de marcar novos eventos etc.

nessa versão inicial é isso q quero entregar.

pretendo hospedar o site no railway pra não ter cold start, e é isso.

faz um plano pra que eu possa jogar no claude code depois, separa em etapas não tão complexas.

Essa é uma ideia excelente! Aplicativos de uso pessoal são o "playground" perfeito para testar tecnologias e criar algo com a sua cara. Dado que você domina Python e quer algo "fofo", moderno e que funcione bem no mobile sem sofrer com JavaScript, vamos montar um stack que seja amigável para IA e fácil de manter.

Resposta do Gemini:

## 🛠️ Stack Recomendada

Para um visual moderno e "fofo" (estilo *kawaii* ou *pastel design*), a combinação abaixo é imbatível:

*   **Backend:** **FastAPI (Python)**. É extremamente rápido, gera documentação automática e a IA escreve rotas para ele com perfeição.
*   **Frontend:** **Next.js (React)** + **Tailwind CSS**. 
    *   *Por que:* O Tailwind permite criar esse estilo "fofo" apenas com classes (ex: `rounded-3xl`, `bg-pastel-pink`).
    *   *Componentes:* **Shadcn/ui** ou **DaisyUI** (que tem temas como "cupcake" e "pastel" prontos).
*   **Banco de Dados:** **PostgreSQL** (nativo no Railway).
*   **Animações:** **Framer Motion** (essencial para aquele "feel" suave de app moderno ao trocar de abas).

---

## 📅 Plano de Execução (para Claude Code)

Dividi em etapas lógicas para que você possa dar um comando por vez ao Claude.

### Etapa 1: Setup e Estrutura de Dados
O foco aqui é o "esqueleto" e a autenticação básica.
*   Configurar projeto FastAPI com suporte a JWT para o login.
*   Criar modelo de banco de dados para `User` e `Event` (Título, descrição, data, cor do card, cidade do usuário).
*   Criar as rotas de API: `POST /auth/login`, `GET /events` e `POST /events`.

### Etapa 2: O Dashboard "Fofo" (UI Base)
Focar na estética e na primeira tela.
*   Configurar Next.js com Tailwind CSS.
*   Criar o componente de **Welcome Card**:
    *   Lógica para mudar a saudação (Bom dia/Boa tarde) e a imagem (ex: um gatinho ou desenho variando conforme o horário).
    *   Consumir uma API de clima (OpenWeatherMap) baseada na cidade do usuário.
*   Estilizar com cores pastéis, bordas bem arredondadas e sombras suaves (*soft shadows*).

### Etapa 3: Sistema de Navegação e Swipe
Implementar a experiência de SPA mobile.
*   Criar a navegação entre a aba "Dashboard" e "Próximos Eventos".
*   Usar **Framer Motion** para permitir que o usuário "arraste" para o lado no mobile para trocar de aba.
*   Criar a lista de "Próximos Eventos" com cards horizontais.

### Etapa 4: O Calendário e CRUD de Eventos
A parte funcional pesada.
*   Implementar um componente de calendário (recomendo o `react-day-picker` por ser leve e customizável).
*   Ao clicar em um dia, abrir um modal (estilo *bottom sheet* no mobile) para adicionar ou ver eventos.
*   Sincronizar com o backend via Python.

### Etapa 5: Polimento e Deployment
*   Ajustar responsividade: garantir que o scroll vertical do calendário não quebre o layout.
*   Configurar o `Dockerfile` para o Railway (um para o app, um para o worker se necessário).
*   Configurar variáveis de ambiente no Railway.

---

## 💡 Dicas para o Estilo "Fofo" (UI/UX)

Para garantir que o app tenha essa pegada que você quer, peça para a IA focar nesses pontos de design:

1.  **Border Radius alto:** Use `rounded-2xl` ou `rounded-3xl` em quase tudo.
2.  **Paleta Pastel:** Use cores como `#FFEDFA` (rosa claro), `#E0F2FE` (azul bebê) e `#F0FDF4` (verde menta).
3.  **Tipografia:** Use fontes arredondadas como *Quicksand* ou *Nunito*.
4.  **Feedback Visual:** Adicione micro-interações (o botão dar um pulinho quando clica, o card deslizar suavemente).

> **Dica de Python:** Como você vai hospedar no Railway, use o **Uvicorn** como servidor ASGI para o FastAPI. Ele é leve e performa muito bem no plano básico deles.

O que acha desse caminho? Se quiser, posso te ajudar a detalhar o primeiro prompt de sistema para o Claude Code já com as especificações técnicas!
