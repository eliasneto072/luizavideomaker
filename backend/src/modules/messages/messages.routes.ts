import { Router } from 'express';
import { messagesController } from './messages.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../shared/http/asyncHandler';

/**
 * Rotas de mensagens.
 *
 * Pública:
 *   POST   /api/messages          → visitante envia uma mensagem
 *
 * Privadas (painel da Luiza — exigem token):
 *   GET    /api/messages          → lista (filtro opcional ?status=)
 *   GET    /api/messages/summary  → contagens por status
 *   GET    /api/messages/:id      → detalhe
 *   PATCH  /api/messages/:id      → atualiza status (lida/arquivada)
 *   DELETE /api/messages/:id      → remove
 */
const messagesRoutes = Router();

// --- Rota pública ---
messagesRoutes.post('/', asyncHandler(messagesController.create));

// --- Rotas privadas (a partir daqui, tudo exige autenticação) ---
messagesRoutes.use(authMiddleware);

messagesRoutes.get('/', asyncHandler(messagesController.list));
messagesRoutes.get('/summary', asyncHandler(messagesController.summary));
messagesRoutes.get('/:id', asyncHandler(messagesController.getById));
messagesRoutes.patch('/:id', asyncHandler(messagesController.updateStatus));
messagesRoutes.delete('/:id', asyncHandler(messagesController.remove));

export { messagesRoutes };
