import { Router } from 'express';
import { galleriesPublicController } from './galleries.public.controller';
import { galleryAuthMiddleware } from '../../middlewares/gallery-auth.middleware';
import { asyncHandler } from '../../shared/http/asyncHandler';

/**
 * Rotas de acesso público às galerias (cliente, sem login).
 *
 * Abertas (sem token de galeria):
 *   GET  /api/g/:slug          info básica para a tela de senha
 *   POST /api/g/:slug/unlock   desbloqueia com a senha → retorna token
 *
 * Protegidas (exigem o token emitido no unlock):
 *   GET  /api/g/:slug/files            lista os arquivos
 *   GET  /api/g/:slug/download/:fileId link temporário de download
 *   GET  /api/g/:slug/download-all     ZIP com todas as fotos
 *
 * O prefixo curto `/g` gera links limpos e fáceis de compartilhar.
 */
const galleriesPublicRoutes = Router();

// Abertas
galleriesPublicRoutes.get(
  '/:slug',
  asyncHandler(galleriesPublicController.info),
);
galleriesPublicRoutes.post(
  '/:slug/unlock',
  asyncHandler(galleriesPublicController.unlock),
);

// Protegidas pelo token de acesso à galeria
galleriesPublicRoutes.get(
  '/:slug/files',
  galleryAuthMiddleware,
  asyncHandler(galleriesPublicController.listFiles),
);
galleriesPublicRoutes.get(
  '/:slug/download-all',
  galleryAuthMiddleware,
  asyncHandler(galleriesPublicController.downloadAll),
);
galleriesPublicRoutes.get(
  '/:slug/download/:fileId',
  galleryAuthMiddleware,
  asyncHandler(galleriesPublicController.download),
);

export { galleriesPublicRoutes };
