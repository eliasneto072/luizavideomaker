import { MessageStatus } from '@prisma/client';
import { messagesRepository } from './messages.repository';
import {
  CreateMessageInput,
  UpdateMessageStatusInput,
} from './messages.schema';
import { AppError } from '../../shared/errors/AppError';

/**
 * Serviço de mensagens.
 *
 * Concentra a regra de negócio do contato: registrar mensagens vindas
 * do site e gerenciá-las no painel (listar, ler, arquivar, excluir).
 */
export const messagesService = {
  /**
   * Registra uma mensagem enviada pelo formulário público.
   * Normaliza o WhatsApp (campo vazio vira nulo).
   */
  async create({ name, whatsapp, content }: CreateMessageInput) {
    const message = await messagesRepository.create({
      name,
      content,
      whatsapp: whatsapp && whatsapp.length > 0 ? whatsapp : null,
    });

    return message;
  },

  /** Lista todas as mensagens, com filtro opcional por status. */
  async list(status?: MessageStatus) {
    return messagesRepository.findMany(status);
  },

  /** Busca uma mensagem específica; falha se não existir. */
  async getById(id: string) {
    const message = await messagesRepository.findById(id);

    if (!message) {
      throw new AppError('Mensagem não encontrada.', 404);
    }

    return message;
  },

  /** Atualiza o status (lida/arquivada/não lida); falha se não existir. */
  async updateStatus(id: string, { status }: UpdateMessageStatusInput) {
    await this.getById(id); // garante que existe
    return messagesRepository.updateStatus(id, status as MessageStatus);
  },

  /** Remove uma mensagem; falha se não existir. */
  async remove(id: string) {
    await this.getById(id); // garante que existe
    await messagesRepository.delete(id);
  },

  /**
   * Resumo de contagens por status — útil para exibir um "badge" de
   * não lidas no painel.
   */
  async summary() {
    const [unread, read, archived] = await Promise.all([
      messagesRepository.countByStatus(MessageStatus.UNREAD),
      messagesRepository.countByStatus(MessageStatus.READ),
      messagesRepository.countByStatus(MessageStatus.ARCHIVED),
    ]);

    return { unread, read, archived, total: unread + read + archived };
  },
};
