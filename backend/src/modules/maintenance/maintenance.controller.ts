import { Request, Response } from 'express';
import { galleriesCleanupService } from '../galleries/galleries.cleanup.service';
import { httpResponse } from '../../shared/http/httpResponse';
import { AppError } from '../../shared/errors/AppError';
import { env } from '../../config/env';

/**
 * Controller de manutenção.
 *
 * Expõe tarefas de sistema acionadas por um agendador externo (cron),
 * como a limpeza de galerias expiradas. O acesso é protegido por um
 * segredo (CLEANUP_SECRET), não pelo login da Luiza — pois o cron não
 * autentica como usuário.
 */
export const maintenanceController = {
  /**
   * POST /api/maintenance/cleanup-galleries
   *
   * Aciona a limpeza das galerias expiradas. Requer o cabeçalho
   * `x-cleanup-secret` com o valor de CLEANUP_SECRET.
   */
  async cleanupGalleries(req: Request, res: Response) {
    // Sem segredo configurado, o endpoint fica desabilitado por segurança.
    if (!env.CLEANUP_SECRET) {
      throw new AppError('Limpeza automática não está configurada.', 503);
    }

    const provided = req.headers['x-cleanup-secret'];

    if (provided !== env.CLEANUP_SECRET) {
      throw new AppError('Não autorizado.', 401);
    }

    const result = await galleriesCleanupService.run();

    return httpResponse.ok(
      res,
      result,
      `Limpeza concluída: ${result.galleriesExpired} galeria(s) expirada(s).`,
    );
  },
};
