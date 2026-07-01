import { Router } from 'express';
import { authRoutes } from './modules/auth/auth.routes';
import { messagesRoutes } from './modules/messages/messages.routes';
import { galleriesRoutes } from './modules/galleries/galleries.routes';
import { galleriesPublicRoutes } from './modules/galleries/galleries.public.routes';
import { maintenanceRoutes } from './modules/maintenance/maintenance.routes';

/**
 * Agregador central de rotas.
 *
 * Reúne as rotas de todos os módulos sob o prefixo `/api`. Novos
 * módulos (portfolio, testimonials) serão registrados aqui.
 *
 * As galerias têm dois conjuntos de rotas:
 *   /galleries → gestão pela Luiza (privado)
 *   /g         → acesso do cliente por link + senha (público)
 *
 * /maintenance → tarefas de sistema acionadas por cron (protegidas por
 * segredo próprio).
 */
const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/messages', messagesRoutes);
routes.use('/galleries', galleriesRoutes);
routes.use('/g', galleriesPublicRoutes);
routes.use('/maintenance', maintenanceRoutes);

export { routes };
