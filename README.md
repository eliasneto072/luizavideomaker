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
npm run prisma:generate    # gera o Prisma Client
npm run prisma:migrate     # cria as tabelas
npm run db:seed            # cria a conta da Luiza
npm run dev                # sobe a API em http://localhost:3333
```

#### Acesso ao painel

Após o seed, a conta de acesso ao painel usa as credenciais definidas
no `.env` (`ADMIN_EMAIL` e `ADMIN_PASSWORD`). Os valores padrão são:

- **E-mail:** `luiza@luizavideomaker.com`
- **Senha:** a definida em `ADMIN_PASSWORD`

> **Importante:** defina uma senha forte em `ADMIN_PASSWORD` antes de
> colocar o site no ar.

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

## Documentação

A documentação técnica detalhada está na pasta [`docs/`](./docs):

- **[API.md](./docs/API.md)** — referência completa dos endpoints, com
  exemplos de requisição e resposta.
- **[ARQUITETURA.md](./docs/ARQUITETURA.md)** — decisões técnicas,
  camadas, padrões e modelo de dados.

---

## Status

### Backend

- [x] Setup do monorepo e configuração base
- [x] Banco de dados e Prisma (6 modelos)
- [x] Containerização com Docker
- [x] Autenticação da administradora (JWT + bcrypt)
- [x] Módulo de mensagens de contato
- [x] Seed (conta da Luiza + dados de exemplo)
- [x] Galerias de entrega (upload, acesso por senha, download, ZIP)
- [x] Armazenamento em Cloudflare R2 com URLs assinadas
- [x] Miniaturas automáticas (Sharp)
- [x] Expiração automática de galerias
- [x] Documentação técnica

### Roadmap

- [ ] Módulo de portfólio (gestão pelo painel)
- [ ] Módulo de depoimentos (gestão pelo painel)
- [ ] Frontend — site público (portfólio)
- [ ] Frontend — painel administrativo
- [ ] Frontend — páginas da galeria (cliente)
- [ ] Deploy em produção

---

Desenvolvido para a **Luiza Videomaker**.