import { Router } from 'express';
import { maintenanceController } from './maintenance.controller';
import { asyncHandler } from '../../shared/http/asyncHandler';

/**
 * Rotas de manutenção do sistema.
 *
 * Acionadas por um agendador externo (cron). A proteção é feita pelo
 * segredo CLEANUP_SECRET, verificado dentro do controller.
 *
 *   POST /api/maintenance/cleanup-galleries
 *        Expira galerias vencidas e remove seus arquivos do R2.
 */
const maintenanceRoutes = Router();

maintenanceRoutes.post(
  '/cleanup-galleries',
  asyncHandler(maintenanceController.cleanupGalleries),
);

export { maintenanceRoutes };
