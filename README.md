# Luiza Videomaker — Site Profissional

API e site profissional da **Luiza**, videomaker & storymaker em João Pessoa — PB.

Projeto desenvolvido como um **portfólio profissional** com painel administrativo
privado para gestão de mensagens de contato, trabalhos e depoimentos.

---

## Sobre

O site é **público** — qualquer visitante navega pelo portfólio, vê os trabalhos
em destaque e envia uma mensagem pelo formulário de contato, sem precisar de login.

O **login** é exclusivo da Luiza, para acessar o painel administrativo e ler as
mensagens recebidas, além de gerenciar portfólio e depoimentos.

---

## Tecnologias

### Backend

- **Node.js** + **Express** + **TypeScript** — API REST
- **Prisma ORM** — acesso ao banco de dados
- **PostgreSQL** — banco de dados
- **JWT** — autenticação do painel
- **bcrypt** — hash de senhas
- **Zod** — validação de dados

### Infraestrutura

- **Docker** + **Docker Compose** — containerização (dev e produção)
- **Railway** — hospedagem

---

## Arquitetura

O backend segue uma **arquitetura modular por domínio**, com separação clara de
responsabilidades em cada módulo:

```
routes → controller → service → repository → Prisma
```

- **routes** — define os endpoints e liga ao controller
- **controller** — recebe a requisição HTTP e devolve a resposta
- **service** — concentra a regra de negócio
- **repository** — acesso ao banco (queries do Prisma)
- **schema** — validação dos dados de entrada (Zod)

---

## Como rodar

> A documentação completa de instalação estará em `docs/` ao final do desenvolvimento.

### Opção A — Local (Node + Postgres na máquina)

```bash
cd backend
npm install
cp .env.example .env       # preencha as variáveis
npm run prisma:migrate     # cria as tabelas
npm run db:seed            # cria a conta da Luiza
npm run dev                # sobe a API em http://localhost:3333
```

### Opção B — Docker (recomendado)

O projeto é totalmente containerizado. Com Docker, você sobe o banco e a
API com um único comando, sem instalar Node nem PostgreSQL na máquina.

**Desenvolvimento (com hot-reload):**

```bash
cp .env.example .env                  # opcional em dev (há valores padrão)
docker compose -f docker-compose.dev.yml up
```

- API: `http://localhost:3333`
- Banco PostgreSQL: `localhost:5432`

O banco sobe junto e as migrations são aplicadas automaticamente.

**Produção:**

```bash
cp .env.example .env                  # defina senhas e segredos reais
docker compose up -d --build
```

**Comandos úteis:**

```bash
docker compose logs -f                # ver logs em tempo real
docker compose down                   # parar tudo
docker compose down -v                # parar e apagar o banco (cuidado!)
docker compose exec backend sh        # entrar no container do backend
```

---

## Status

🚧 **Em desenvolvimento** — acompanhe o progresso pelos commits.

---

Desenvolvido para a **Luiza Videomaker**.
