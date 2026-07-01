# Documentação da API

Referência dos endpoints da API da **Luiza Videomaker**.

- **URL base:** `http://localhost:3333/api`
- **Formato:** JSON
- **Autenticação:** JWT via cabeçalho `Authorization: Bearer <token>`

---

## Sumário

- [Convenções](#convenções)
- [Autenticação](#autenticação)
  - [Login](#post-authlogin)
  - [Sessão atual](#get-authme)
- [Mensagens](#mensagens)
  - [Enviar mensagem](#post-messages)
  - [Listar mensagens](#get-messages)
  - [Resumo por status](#get-messagessummary)
  - [Detalhe da mensagem](#get-messagesid)
  - [Atualizar status](#patch-messagesid)
  - [Excluir mensagem](#delete-messagesid)
- [Galerias — Painel (privado)](#galerias--painel-privado)
  - [Criar galeria](#post-galleries)
  - [Listar galerias](#get-galleries)
  - [Detalhe da galeria](#get-galleriesid)
  - [Editar / renovar](#patch-galleriesid)
  - [Excluir galeria](#delete-galleriesid)
  - [Enviar arquivo](#post-galleriesidfiles)
  - [Remover arquivo](#delete-galleriesidfilesfileid)
- [Galerias — Acesso do cliente (público)](#galerias--acesso-do-cliente-público)
  - [Informações da galeria](#get-gslug)
  - [Desbloquear com senha](#post-gslugunlock)
  - [Listar arquivos](#get-gslugfiles)
  - [Baixar um arquivo](#get-gslugdownloadfileid)
  - [Baixar todas as fotos (ZIP)](#get-gslugdownload-all)
- [Manutenção](#manutenção)
  - [Limpar galerias expiradas](#post-maintenancecleanup-galleries)
- [Códigos de status](#códigos-de-status)

---

## Convenções

### Envelope de resposta

Todas as respostas seguem um formato padrão.

**Sucesso:**

```json
{
  "success": true,
  "message": "Mensagem opcional.",
  "data": { }
}
```

**Erro:**

```json
{
  "success": false,
  "message": "Descrição do erro.",
  "errors": { }
}
```

O campo `errors` aparece apenas em erros de validação, detalhando cada
campo inválido.

### Rotas públicas e privadas

- **Públicas** — não exigem autenticação (o site as consome livremente).
- **Privadas** — exigem um token JWT válido no cabeçalho
  `Authorization`. São usadas pelo painel administrativo da Luiza.

---

## Autenticação

### `POST /auth/login`

**Pública.** Autentica a administradora e retorna um token JWT.

**Corpo da requisição:**

| Campo      | Tipo   | Obrigatório | Descrição        |
| ---------- | ------ | ----------- | ---------------- |
| `email`    | string | Sim         | E-mail de acesso |
| `password` | string | Sim         | Senha de acesso  |

**Exemplo:**

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "luiza@luizavideomaker.com",
  "password": "sua-senha"
}
```

**Resposta `200 OK`:**

```json
{
  "success": true,
  "message": "Login realizado com sucesso.",
  "data": {
    "token": "eyJhbGciOiJIUzI1Ni, ...",
    "user": {
      "id": "uuid",
      "name": "Luiza",
      "email": "luiza@luizavideomaker.com",
      "role": "ADMIN"
    }
  }
}
```

**Erros:**

- `401` — e-mail ou senha incorretos.
- `400` — dados inválidos (e-mail mal formatado ou campo ausente).

---

### `GET /auth/me`

**Privada.** Retorna os dados da sessão autenticada.

**Cabeçalhos:**

```http
Authorization: Bearer <token>
```

**Resposta `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Luiza",
    "email": "luiza@luizavideomaker.com",
    "role": "ADMIN"
  }
}
```

**Erros:**

- `401` — token ausente, inválido ou expirado.

---

## Mensagens

Mensagens enviadas pelo formulário de contato do site ("Conta sua
história"). A criação é pública; a gestão é restrita ao painel.

### `POST /messages`

**Pública.** Registra uma nova mensagem enviada pelo site.

**Corpo da requisição:**

| Campo      | Tipo   | Obrigatório | Descrição                          |
| ---------- | ------ | ----------- | ---------------------------------- |
| `name`     | string | Sim         | Nome de quem envia (mín. 2)        |
| `whatsapp` | string | Não         | Telefone para retorno              |
| `content`  | string | Sim         | Conteúdo da mensagem (mín. 5)      |

**Exemplo:**

```http
POST /api/messages
Content-Type: application/json

{
  "name": "Marina",
  "whatsapp": "(83) 99999-9999",
  "content": "Gostaria de um orçamento para o meu casamento em dezembro."
}
```

**Resposta `201 Created`:**

```json
{
  "success": true,
  "message": "Mensagem enviada com sucesso. Em breve entraremos em contato.",
  "data": {
    "id": "uuid",
    "name": "Marina",
    "whatsapp": "(83) 99999-9999",
    "content": "Gostaria de um orçamento ...",
    "status": "UNREAD",
    "createdAt": "2026-01-01T12:00:00.000Z"
  }
}
```

**Erros:**

- `400` — dados inválidos (ver campo `errors`).

---

### `GET /messages`

**Privada.** Lista as mensagens, da mais recente para a mais antiga.

**Parâmetros de query (opcionais):**

| Parâmetro | Valores                       | Descrição           |
| --------- | ----------------------------- | ------------------- |
| `status`  | `UNREAD`, `READ`, `ARCHIVED`  | Filtra por status   |

**Exemplo:**

```http
GET /api/messages?status=UNREAD
Authorization: Bearer <token>
```

**Resposta `200 OK`:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Marina",
      "whatsapp": "(83) 99999-9999",
      "content": "Gostaria de um orçamento ...",
      "status": "UNREAD",
      "createdAt": "2026-01-01T12:00:00.000Z"
    }
  ]
}
```

---

### `GET /messages/summary`

**Privada.** Retorna a contagem de mensagens por status — útil para
exibir um indicador de não lidas no painel.

**Resposta `200 OK`:**

```json
{
  "success": true,
  "data": {
    "unread": 3,
    "read": 10,
    "archived": 2,
    "total": 15
  }
}
```

---

### `GET /messages/:id`

**Privada.** Retorna os detalhes de uma mensagem específica.

**Resposta `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Marina",
    "whatsapp": "(83) 99999-9999",
    "content": "Gostaria de um orçamento ...",
    "status": "READ",
    "createdAt": "2026-01-01T12:00:00.000Z"
  }
}
```

**Erros:**

- `404` — mensagem não encontrada.

---

### `PATCH /messages/:id`

**Privada.** Atualiza o status de uma mensagem.

**Corpo da requisição:**

| Campo    | Tipo   | Obrigatório | Valores                       |
| -------- | ------ | ----------- | ----------------------------- |
| `status` | string | Sim         | `UNREAD`, `READ`, `ARCHIVED`  |

**Exemplo:**

```http
PATCH /api/messages/uuid
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "READ"
}
```

**Resposta `200 OK`:**

```json
{
  "success": true,
  "message": "Status atualizado.",
  "data": {
    "id": "uuid",
    "status": "READ"
  }
}
```

**Erros:**

- `400` — status inválido.
- `404` — mensagem não encontrada.

---

### `DELETE /messages/:id`

**Privada.** Remove uma mensagem permanentemente.

**Exemplo:**

```http
DELETE /api/messages/uuid
Authorization: Bearer <token>
```

**Resposta `204 No Content`** (sem corpo).

**Erros:**

- `404` — mensagem não encontrada.

---

## Galerias — Painel (privado)

Gestão das galerias de entrega pela Luiza. Todas as rotas exigem
autenticação (token de admin).

### `POST /galleries`

**Privada.** Cria uma galeria com link único e senha.

**Corpo da requisição:**

| Campo           | Tipo   | Obrigatório | Descrição                                  |
| --------------- | ------ | ----------- | ------------------------------------------ |
| `title`         | string | Sim         | Título da galeria (mín. 2)                 |
| `clientName`    | string | Sim         | Nome do cliente (mín. 2)                   |
| `password`      | string | Sim         | Senha de acesso do cliente (mín. 4)        |
| `expiresInDays` | number | Não         | Validade em dias (padrão: 60)              |

**Exemplo:**

```http
POST /api/galleries
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Casamento Marina & João",
  "clientName": "Marina",
  "password": "marina2026"
}
```

**Resposta `201 Created`:** dados da galeria, incluindo o `slug` gerado
(usado no link) e a `expiresAt`.

---

### `GET /galleries`

**Privada.** Lista todas as galerias, da mais recente para a mais
antiga, com a contagem de arquivos de cada uma.

---

### `GET /galleries/:id`

**Privada.** Detalha uma galeria e seus arquivos.

**Erros:** `404` — galeria não encontrada.

---

### `PATCH /galleries/:id`

**Privada.** Edita a galeria e/ou renova a validade.

**Corpo (todos opcionais):**

| Campo          | Tipo   | Descrição                                    |
| -------------- | ------ | -------------------------------------------- |
| `title`        | string | Novo título                                  |
| `clientName`   | string | Novo nome do cliente                         |
| `password`     | string | Nova senha (re-hash)                         |
| `status`       | string | `ACTIVE`, `EXPIRED` ou `ARCHIVED`            |
| `renewForDays` | number | Renova a validade por N dias a partir de agora |

---

### `DELETE /galleries/:id`

**Privada.** Remove a galeria e todos os seus arquivos do R2.

**Resposta `204 No Content`.**

---

### `POST /galleries/:id/files`

**Privada.** Envia um arquivo (foto ou vídeo) para a galeria. Fotos
geram miniatura automaticamente.

**Requisição:** `multipart/form-data` com o campo `file`.

```http
POST /api/galleries/<id>/files
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <arquivo binário>
```

**Resposta `201 Created`:** metadados do arquivo registrado.

**Erros:** `400` — nenhum arquivo enviado, tipo inválido ou tamanho
excedido.

---

### `DELETE /galleries/:id/files/:fileId`

**Privada.** Remove um arquivo específico (do R2 e do banco).

**Resposta `204 No Content`.**

---

## Galerias — Acesso do cliente (público)

Fluxo do cliente a partir do link recebido. O prefixo curto `/g` gera
links fáceis de compartilhar.

### `GET /g/:slug`

**Pública.** Informações básicas para a tela de senha (título, cliente,
validade e total de arquivos). Não expõe os arquivos.

**Erros:** `404` — não encontrada. `410` — arquivada ou expirada.

---

### `POST /g/:slug/unlock`

**Pública.** Confere a senha e, se correta, retorna um token de acesso
temporário (válido por 6h) específico da galeria.

**Corpo:**

| Campo      | Tipo   | Obrigatório | Descrição            |
| ---------- | ------ | ----------- | -------------------- |
| `password` | string | Sim         | Senha da galeria     |

**Resposta `200 OK`:**

```json
{
  "success": true,
  "message": "Galeria desbloqueada.",
  "data": {
    "token": "eyJhbGci...",
    "gallery": { "title": "...", "clientName": "...", "expiresAt": "..." }
  }
}
```

**Erros:** `401` — senha incorreta. `410` — expirada.

---

### `GET /g/:slug/files`

**Protegida** (token da galeria). Lista os arquivos com URLs temporárias
de visualização e de miniatura.

**Cabeçalhos:** `Authorization: Bearer <token-da-galeria>`

**Resposta `200 OK`:** título, cliente, validade e a lista de arquivos,
cada um com `url`, `thumbnailUrl`, `type`, `fileName` e dimensões.

---

### `GET /g/:slug/download/:fileId`

**Protegida** (token da galeria). Retorna uma URL temporária de download
de um arquivo, já com o nome original.

**Resposta `200 OK`:**

```json
{
  "success": true,
  "data": { "url": "https://...", "fileName": "foto.jpg" }
}
```

---

### `GET /g/:slug/download-all`

**Protegida** (token da galeria). Baixa **todas as fotos** da galeria em
um único arquivo ZIP (vídeos não são incluídos). A resposta é o próprio
arquivo (`application/zip`), transmitido como stream.

**Erros:** `404` — não há fotos para baixar.

---

## Manutenção

Tarefas de sistema acionadas por um agendador externo (cron).

### `POST /maintenance/cleanup-galleries`

Expira as galerias vencidas e remove seus arquivos do R2. Protegida por
um segredo próprio, não pelo login da Luiza.

**Cabeçalhos:**

```http
x-cleanup-secret: <CLEANUP_SECRET>
```

**Resposta `200 OK`:**

```json
{
  "success": true,
  "message": "Limpeza concluída: 2 galeria(s) expirada(s).",
  "data": { "galleriesExpired": 2, "filesRemoved": 640 }
}
```

**Erros:**

- `401` — segredo ausente ou incorreto.
- `503` — limpeza não configurada (sem `CLEANUP_SECRET`).

---

## Códigos de status

| Código | Significado                                        |
| ------ | -------------------------------------------------- |
| `200`  | Sucesso                                            |
| `201`  | Recurso criado                                     |
| `204`  | Sucesso sem conteúdo de retorno                    |
| `400`  | Requisição inválida (erro de validação)            |
| `401`  | Não autenticado (token/senha ausente ou inválido)  |
| `403`  | Token não corresponde ao recurso                   |
| `404`  | Recurso não encontrado                             |
| `410`  | Recurso não disponível (galeria expirada/arquivada)|
| `500`  | Erro interno do servidor                           |
| `503`  | Recurso indisponível (tarefa não configurada)      |

---

> Esta documentação acompanha a evolução da API. Novos módulos
> (portfólio e depoimentos) serão adicionados aqui conforme implementados.