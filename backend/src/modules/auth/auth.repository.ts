import { prisma } from '../../config/prisma';

/**
 * Repositório de autenticação.
 *
 * Camada de acesso ao banco. Contém apenas queries do Prisma, sem regra
 * de negócio — essa fica no service.
 */
export const authRepository = {
  /** Busca um usuário pelo e-mail (ou null se não existir). */
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  /** Busca um usuário pelo id (ou null se não existir). */
  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },
};
