import { PrismaClient } from '@prisma/client';
import { env } from './env';

/**
 * Instância única (singleton) do Prisma Client.
 *
 * Reaproveita a mesma conexão em toda a aplicação. Em ambiente de
 * desenvolvimento, guarda a instância no escopo global para evitar
 * múltiplas conexões a cada hot-reload do servidor.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
