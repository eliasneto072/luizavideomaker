import { Prisma, MessageStatus } from '@prisma/client';
import { prisma } from '../../config/prisma';

/**
 * Repositório de mensagens.
 *
 * Camada de acesso ao banco — apenas queries do Prisma, sem regra de
 * negócio (que fica no service).
 */
export const messagesRepository = {
  /** Cria uma nova mensagem. */
  create(data: Prisma.MessageCreateInput) {
    return prisma.message.create({ data });
  },

  /**
   * Lista as mensagens, opcionalmente filtradas por status.
   * Ordena das mais recentes para as mais antigas.
   */
  findMany(status?: MessageStatus) {
    return prisma.message.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  },

  /** Busca uma mensagem pelo id (ou null se não existir). */
  findById(id: string) {
    return prisma.message.findUnique({ where: { id } });
  },

  /** Atualiza o status de uma mensagem. */
  updateStatus(id: string, status: MessageStatus) {
    return prisma.message.update({
      where: { id },
      data: { status },
    });
  },

  /** Remove uma mensagem. */
  delete(id: string) {
    return prisma.message.delete({ where: { id } });
  },

  /** Conta quantas mensagens há com determinado status. */
  countByStatus(status: MessageStatus) {
    return prisma.message.count({ where: { status } });
  },
};
