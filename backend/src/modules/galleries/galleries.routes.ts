import { Router } from 'express';
import { galleriesController } from './galleries.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { upload } from '../../middlewares/upload.middleware';
import { asyncHandler } from '../../shared/http/asyncHandler';

/**
 * Rotas de galerias — painel administrativo (Luiza).
 *
 * Todas as rotas são privadas e exigem autenticação. O acesso público
 * dos clientes (por slug + senha) fica em um conjunto de rotas separado.
 *
 *   POST   /api/galleries                 cria uma galeria
 *   GET    /api/galleries                 lista as galerias
 *   GET    /api/galleries/:id             detalha uma galeria
 *   PATCH  /api/galleries/:id             edita/renova
 *   DELETE /api/galleries/:id             remove a galeria
 *   POST   /api/galleries/:id/files       envia um arquivo (foto/vídeo)
 *   DELETE /api/galleries/:id/files/:fileId  remove um arquivo
 */
const galleriesRoutes = Router();

// Todas as rotas deste módulo exigem autenticação.
galleriesRoutes.use(authMiddleware);

galleriesRoutes.post('/', asyncHandler(galleriesController.create));
galleriesRoutes.get('/', asyncHandler(galleriesController.list));
galleriesRoutes.get('/:id', asyncHandler(galleriesController.getById));
galleriesRoutes.patch('/:id', asyncHandler(galleriesController.update));
galleriesRoutes.delete('/:id', asyncHandler(galleriesController.remove));

// Upload de um arquivo por vez (campo "file" no form-data).
galleriesRoutes.post(
  '/:id/files',
  upload.single('file'),
  asyncHandler(galleriesController.uploadFile),
);

galleriesRoutes.delete(
  '/:id/files/:fileId',
  asyncHandler(galleriesController.removeFile),
);

export { galleriesRoutes };
