# ===========================================
#  Dockerfile de Produção — Backend
#  Build multi-stage: compila o TypeScript e
#  gera uma imagem final enxuta só com o necessário.
# ===========================================

# ---------- Estágio 1: Build ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Instala dependências (inclui devDependencies para compilar)
COPY package*.json ./
RUN npm ci

# Copia o schema do Prisma e gera o client
COPY prisma ./prisma
RUN npx prisma generate

# Copia o restante do código e compila o TypeScript
COPY . .
RUN npm run build


# ---------- Estágio 2: Produção ----------
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Instala apenas as dependências de produção
COPY package*.json ./
RUN npm ci --omit=dev

# Copia o Prisma e regenera o client no ambiente final
COPY prisma ./prisma
RUN npx prisma generate

# Copia o código já compilado do estágio de build
COPY --from=builder /app/dist ./dist

EXPOSE 3333

# Aplica as migrations pendentes e sobe a API
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
