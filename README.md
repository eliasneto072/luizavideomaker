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

```bash
cd backend
npm install
cp .env.example .env       # preencha as variáveis
npm run prisma:migrate     # cria as tabelas
npm run db:seed            # cria a conta da Luiza
npm run dev                # sobe a API em http://localhost:3333
```

---

## Status

🚧 **Em desenvolvimento** — acompanhe o progresso pelos commits.

---

Desenvolvido para a **Luiza Videomaker**.
