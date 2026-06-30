import { Router } from 'express';
import { authRoutes } from './modules/auth/auth.routes';
import { messagesRoutes } from './modules/messages/messages.routes';

/**
 * Agregador central de rotas.
 *
 * Reúne as rotas de todos os módulos sob o prefixo `/api`. Novos
 * módulos (portfolio, testimonials) serão registrados aqui.
 */
const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/messages', messagesRoutes);

export { routes };
