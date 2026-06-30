import { Router } from 'express';
import { authRoutes } from './modules/auth/auth.routes';

/**
 * Agregador central de rotas.
 *
 * Reúne as rotas de todos os módulos sob o prefixo `/api`. Novos
 * módulos (messages, portfolio, testimonials) serão registrados aqui.
 */
const routes = Router();

routes.use('/auth', authRoutes);

export { routes };
