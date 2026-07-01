# Arquitetura

Documento técnico do backend da **Luiza Videomaker**. Descreve a
organização do código, as camadas, os padrões adotados e as decisões de
projeto.

---

## Sumário

- [Visão geral](#visão-geral)
- [Stack](#stack)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Camadas e fluxo de uma requisição](#camadas-e-fluxo-de-uma-requisição)
- [Organização modular](#organização-modular)
- [Tratamento de erros](#tratamento-de-erros)
- [Validação](#validação)
- [Autenticação e segurança](#autenticação-e-segurança)
- [Modelo de dados](#modelo-de-dados)
- [Convenções de código](#convenções-de-código)

---

## Visão geral

O backend é uma **API REST** que serve dois públicos:

1. **O site (público)** — consome dados de portfólio e depoimentos e
   envia mensagens do formulário de contato. Não exige autenticação.
2. **O painel administrativo (privado)** — usado apenas pela Luiza para
   ler mensagens e gerenciar o conteúdo. Protegido por JWT.

A arquitetura prioriza **separação de responsabilidades**,
**previsibilidade** e **facilidade de manutenção**, mantendo cada parte
pequena e com um propósito único.

---

## Stack

| Camada         | Tecnologia            | Função                          |
| -------------- | --------------------- | ------------------------------- |
| Runtime        | Node.js               | Ambiente de execução            |
| Linguagem      | TypeScript            | Tipagem estática                |
| Framework HTTP | Express               | Rotas e middlewares             |
| ORM            | Prisma                | Acesso ao banco                 |
| Banco          | PostgreSQL            | Persistência                    |
| Validação      | Zod                   | Validação de dados de entrada   |
| Autenticação   | JWT (jsonwebtoken)    | Tokens de sessão                |
| Senhas         | bcryptjs              | Hash de senhas                  |
| Storage        | Cloudflare R2 (S3)    | Arquivos das galerias           |
| Upload         | Multer                | Recebimento de arquivos         |
| Imagens        | Sharp                 | Geração de miniaturas           |
| Compactação    | Archiver              | Download de fotos em ZIP        |
| Containers     | Docker / Compose      | Ambiente isolado                |

---

## Estrutura de pastas

```
backend/
├── prisma/
│   ├── schema.prisma          # Modelos do banco
│   └── seed.ts                # Dados iniciais (admin + exemplos)
│
└── src/
    ├── config/                # Configuração da aplicação
    │   ├── env.ts             #   Validação das variáveis de ambiente
    │   ├── prisma.ts          #   Instância do Prisma Client
    │   └── scheduler.ts       #   Agendador interno (limpeza opcional)
    │
    ├── middlewares/           # Middlewares do Express
    │   ├── auth.middleware.ts         # JWT de admin
    │   ├── gallery-auth.middleware.ts # Token de acesso à galeria
    │   ├── upload.middleware.ts       # Recebimento de arquivos (multer)
    │   └── error.middleware.ts        # Tratamento global de erros
    │
    ├── modules/               # Funcionalidades por domínio
    │   ├── auth/              #   Autenticação
    │   ├── messages/          #   Mensagens de contato
    │   ├── galleries/         #   Galerias (painel + acesso público)
    │   └── maintenance/       #   Tarefas de sistema (cron)
    │
    ├── shared/                # Código compartilhado
    │   ├── errors/            #   AppError
    │   ├── http/              #   httpResponse, asyncHandler
    │   ├── storage/           #   Cliente e serviço do R2
    │   ├── types/             #   Tipagem global (Express)
    │   └── utils/             #   jwt, password, slug, image
    │
    ├── routes.ts              # Agregador de rotas dos módulos
    └── server.ts              # Ponto de entrada
```

---

## Camadas e fluxo de uma requisição

Cada requisição percorre uma sequência de camadas com responsabilidades
bem definidas:

```
  HTTP
   │
   ▼
routes        →  define o endpoint e middlewares aplicáveis
   │
   ▼
controller    →  recebe a requisição, valida a entrada (Zod) e
   │              devolve a resposta padronizada
   ▼
service       →  contém a regra de negócio; orquestra repositório
   │              e utilitários
   ▼
repository    →  acesso ao banco (queries do Prisma), sem regra
   │
   ▼
Prisma / DB
```

**Por que separar `service` de `repository`?**
O repositório isola o acesso ao banco — se um dia uma query precisar
mudar, ou o ORM for trocado, o impacto fica contido nessa camada. O
service permanece focado na regra de negócio, sem saber *como* os dados
são persistidos.

---

## Organização modular

Cada funcionalidade vive em um **módulo** próprio dentro de `modules/`,
contendo todos os seus arquivos:

```
modules/messages/
├── messages.routes.ts       # Endpoints
├── messages.controller.ts   # Camada HTTP
├── messages.service.ts      # Regra de negócio
├── messages.repository.ts   # Acesso ao banco
└── messages.schema.ts       # Validação (Zod)
```

**Vantagens:**

- Tudo de um domínio fica junto — fácil de localizar e manter.
- Adicionar uma funcionalidade é criar uma pasta nova, sem espalhar
  arquivos pelo projeto.
- Cada módulo é independente e testável isoladamente.

As rotas de cada módulo são reunidas em `routes.ts` sob o prefixo `/api`.

---

## Tratamento de erros

O tratamento de erros é **centralizado** em um único middleware
(`error.middleware.ts`), registrado por último na aplicação.

- **`AppError`** — erros de negócio esperados (ex.: "mensagem não
  encontrada"), com um código de status HTTP associado.
- **`ZodError`** — erros de validação, convertidos automaticamente em
  resposta `400` com a lista de campos inválidos.
- **Erros inesperados** — logados no servidor e respondidos como `500`,
  com a mensagem detalhada ocultada em produção.

Para que erros lançados em controllers `async` cheguem ao middleware, os
handlers são envolvidos pelo utilitário **`asyncHandler`**, que captura
rejeições de Promise e as encaminha ao Express.

---

## Validação

Toda entrada vinda do cliente é validada com **Zod** antes de chegar à
regra de negócio. Os schemas ficam no arquivo `*.schema.ts` de cada
módulo e também exportam os **tipos TypeScript** inferidos, evitando
duplicação entre validação e tipagem.

Exemplo: o schema de criação de mensagem garante nome com no mínimo 2
caracteres e conteúdo com no mínimo 5, antes de qualquer persistência.

---

## Autenticação e segurança

- **Senhas** são armazenadas apenas como **hash bcrypt** — nunca em
  texto puro.
- **Autenticação** é feita por **JWT**. O token é gerado no login e
  enviado pelo cliente no cabeçalho `Authorization: Bearer <token>`.
- O **`auth.middleware`** valida o token nas rotas privadas e anexa os
  dados do usuário em `req.user` (tipado globalmente via
  `shared/types/express.d.ts`).
- As galerias usam um **segundo tipo de token**, com escopo próprio
  (`gallery-access`), que autoriza apenas o acesso a uma galeria
  específica — sem relação com o token de admin. É validado pelo
  `gallery-auth.middleware`.
- A mensagem de erro no login é **genérica** ("e-mail ou senha
  incorretos") de propósito, para não revelar se um e-mail existe.
- **Segredos** (chave JWT, credenciais do banco e do R2, segredo de
  limpeza) ficam fora do código, no `.env`, que não é versionado.
- As variáveis de ambiente são **validadas na inicialização** (Zod); a
  aplicação não sobe com configuração incompleta.
- Os arquivos das galerias no R2 são **privados**, acessíveis somente
  por URLs assinadas temporárias.

---

## Modelo de dados

Seis modelos compõem o domínio:

- **User** — conta de acesso ao painel (a Luiza). Possui papel
  (`role`) e senha em hash.
- **Message** — mensagem do formulário de contato, com `status`
  (`UNREAD`, `READ`, `ARCHIVED`).
- **Portfolio** — trabalho exibido no site, com categoria, ordem de
  exibição e flag de ativo.
- **Testimonial** — depoimento de cliente, com ordem e flag de ativo.
- **Gallery** — galeria de entrega ao cliente, com `slug` único, senha
  em hash, `status` (`ACTIVE`, `EXPIRED`, `ARCHIVED`) e data de
  expiração.
- **GalleryFile** — arquivo (foto/vídeo) de uma galeria, com as chaves
  do R2 (original e miniatura), tipo e dimensões. Relaciona-se a
  `Gallery` com remoção em cascata.

Os nomes das tabelas seguem o padrão *snake_case* (ex.: `created_at`),
mapeados via `@map`, enquanto o código usa *camelCase*.

---

## Galerias e armazenamento

A galeria de entrega é a funcionalidade mais complexa e merece um
detalhamento próprio.

### Armazenamento (Cloudflare R2)

Os arquivos (fotos e vídeos) ficam no **Cloudflare R2**, um storage de
objetos compatível com a API S3. A escolha se deve ao **egress
gratuito** (download sem custo), ideal para uma galeria em que o cliente
baixa o material.

O `shared/storage` isola essa integração: `r2.client` configura o cliente
S3 apontando para o R2, e `storage.service` expõe as operações (upload,
URLs assinadas, download de conteúdo e remoção). O restante da aplicação
não conhece detalhes do SDK.

Os objetos **nunca** são públicos. Todo acesso (visualização ou
download) usa **URLs assinadas temporárias**, geradas sob demanda e
válidas por poucos minutos.

### Dois caminhos de acesso

A galeria expõe dois conjuntos de rotas com propósitos distintos:

- **Painel (`/galleries`)** — privado, exige o JWT de admin. A Luiza
  cria galerias, faz upload e gerencia.
- **Cliente (`/g`)** — público. O cliente abre o link, informa a senha
  e acessa. Não há conta de cliente.

### Acesso do cliente por senha

Como o cliente não tem login, o acesso usa um **token específico da
galeria**: ao acertar a senha (`/g/:slug/unlock`), é emitido um JWT com
escopo `gallery-access`, contendo o id e o slug da galeria, válido por
poucas horas. O `gallery-auth.middleware` valida esse token e confere se
ele corresponde ao slug da URL, impedindo o reuso entre galerias.

### Miniaturas e download

No upload de fotos, o `sharp` gera uma **miniatura** leve, usada no grid
para carregamento rápido; o arquivo original é servido apenas ao ampliar
ou baixar. O download em lote (`/g/:slug/download-all`) usa o `archiver`
para transmitir um **ZIP** apenas com as fotos — vídeos, por serem
grandes, são baixados individualmente.

### Expiração automática

Cada galeria tem prazo de validade (padrão de 60 dias). A rotina de
limpeza (`galleries.cleanup.service`) encontra as galerias vencidas,
remove seus arquivos do R2 (interrompendo o custo de storage) e as marca
como `EXPIRED`, preservando o registro para histórico. A rotina pode ser
acionada por um **cron externo** (endpoint protegido por segredo) ou por
um **agendador interno** (`scheduler`, via `setInterval`), conforme a
configuração.

---

## Convenções de código

- **Idioma** — código e comentários em português, alinhado ao domínio
  do projeto.
- **Nomenclatura de arquivos** — `dominio.camada.ts`
  (ex.: `messages.service.ts`).
- **Respostas** — sempre pelo helper `httpResponse`, mantendo o
  envelope consistente.
- **Imports** — aliases configurados no `tsconfig` (`@modules`,
  `@shared`, etc.) para caminhos mais limpos.
- **Commits** — padrão *Conventional Commits* (`feat:`, `fix:`,
  `chore:`, `refactor:`, `docs:`).

---

> Este documento evolui junto com o projeto. Decisões relevantes de
> arquitetura devem ser registradas aqui.