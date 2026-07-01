import { Request, Response } from 'express';
import { galleriesPublicService } from './galleries.public.service';
import { unlockGallerySchema } from './galleries.public.schema';
import { httpResponse } from '../../shared/http/httpResponse';

/**
 * Controller de acesso público às galerias.
 *
 * Endpoints consumidos pelo cliente (sem login) a partir do link
 * recebido. A tela de senha e a listagem de arquivos passam por aqui.
 */
export const galleriesPublicController = {
  /** GET /api/g/:slug — informações básicas para a tela de senha. */
  async info(req: Request, res: Response) {
    const info = await galleriesPublicService.getPublicInfo(req.params.slug);
    return httpResponse.ok(res, info);
  },

  /** POST /api/g/:slug/unlock — desbloqueia com a senha e retorna token. */
  async unlock(req: Request, res: Response) {
    const data = unlockGallerySchema.parse(req.body);
    const result = await galleriesPublicService.unlock(req.params.slug, data);
    return httpResponse.ok(res, result, 'Galeria desbloqueada.');
  },

  /** GET /api/g/:slug/files — lista os arquivos (requer desbloqueio). */
  async listFiles(req: Request, res: Response) {
    const result = await galleriesPublicService.listFiles(req.params.slug);
    return httpResponse.ok(res, result);
  },

  /** GET /api/g/:slug/download/:fileId — link de download de um arquivo. */
  async download(req: Request, res: Response) {
    const result = await galleriesPublicService.getDownloadUrl(
      req.params.slug,
      req.params.fileId,
    );
    return httpResponse.ok(res, result);
  },
};
