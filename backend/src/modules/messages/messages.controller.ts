import { Request, Response } from 'express';
import { messagesService } from './messages.service';
import {
  createMessageSchema,
  updateMessageStatusSchema,
  listMessagesQuerySchema,
} from './messages.schema';
import { httpResponse } from '../../shared/http/httpResponse';

/**
 * Controller de mensagens.
 *
 * Valida a entrada com Zod, delega ao service e devolve a resposta
 * padronizada. A criação é pública; as demais ações são restritas ao
 * painel (protegidas pelo middleware de autenticação nas rotas).
 */
export const messagesController = {
  /** POST /api/messages — recebe uma mensagem do formulário do site. */
  async create(req: Request, res: Response) {
    const data = createMessageSchema.parse(req.body);
    const message = await messagesService.create(data);
    return httpResponse.created(
      res,
      message,
      'Mensagem enviada com sucesso. Em breve entraremos em contato.',
    );
  },

  /** GET /api/messages — lista as mensagens (com filtro opcional por status). */
  async list(req: Request, res: Response) {
    const { status } = listMessagesQuerySchema.parse(req.query);
    const messages = await messagesService.list(status);
    return httpResponse.ok(res, messages);
  },

  /** GET /api/messages/summary — contagens por status (badge do painel). */
  async summary(_req: Request, res: Response) {
    const summary = await messagesService.summary();
    return httpResponse.ok(res, summary);
  },

  /** GET /api/messages/:id — detalhe de uma mensagem. */
  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const message = await messagesService.getById(id);
    return httpResponse.ok(res, message);
  },

  /** PATCH /api/messages/:id — atualiza o status (lida/arquivada). */
  async updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const data = updateMessageStatusSchema.parse(req.body);
    const message = await messagesService.updateStatus(id, data);
    return httpResponse.ok(res, message, 'Status atualizado.');
  },

  /** DELETE /api/messages/:id — remove uma mensagem. */
  async remove(req: Request, res: Response) {
    const { id } = req.params;
    await messagesService.remove(id);
    return httpResponse.noContent(res);
  },
};
