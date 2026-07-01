import { Request, Response, NextFunction } from 'express';
import { galleryAccess } from '../modules/galleries/gallery-access.util';
import { AppError } from '../shared/errors/AppError';

/**
 * Middleware de acesso à galeria.
 *
 * Protege as rotas públicas que exigem que o cliente já tenha
 * desbloqueado a galeria com a senha. Valida o token de acesso (emitido
 * no unlock) e confere se ele corresponde ao slug da URL — impedindo
 * que um token de uma galeria seja usado em outra.
 *
 * O token é lido do cabeçalho `Authorization: Bearer <token>`.
 */
export function galleryAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError('Acesso não autorizado. Desbloqueie a galeria.', 401);
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new AppError('Formato de token inválido.', 401);
  }

  try {
    const payload = galleryAccess.verify(token);

    // Garante que o token pertence à galeria que está sendo acessada.
    if (payload.slug !== req.params.slug) {
      throw new AppError('Token não corresponde a esta galeria.', 403);
    }

    return next();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Acesso inválido ou expirado.', 401);
  }
}
