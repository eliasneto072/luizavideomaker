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

## Códigos de status

| Código | Significado                                        |
| ------ | -------------------------------------------------- |
| `200`  | Sucesso                                            |
| `201`  | Recurso criado                                     |
| `204`  | Sucesso sem conteúdo de retorno                    |
| `400`  | Requisição inválida (erro de validação)            |
| `401`  | Não autenticado (token ausente/inválido)           |
| `404`  | Recurso não encontrado                             |
| `500`  | Erro interno do servidor                           |

---

> Esta documentação acompanha a evolução da API. Novos módulos
> (portfólio e depoimentos) serão adicionados aqui conforme implementados.
