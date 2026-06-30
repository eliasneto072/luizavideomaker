import { Request, Response, NextFunction } from 'express';
import { jwtUtils } from '../shared/utils/jwt';
import { AppError } from '../shared/errors/AppError';

/**
 * Middleware de autenticação.
 *
 * Protege rotas privadas (o painel da Luiza). Exige um token JWT válido
 * no cabeçalho `Authorization: Bearer <token>`. Se válido, anexa os
 * dados do usuário em `req.user` e segue; caso contrário, bloqueia.
 *
 * O site é público — este middleware é aplicado apenas nas rotas do
 * painel administrativo.
 */
export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError('Token de autenticação não informado.', 401);
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new AppError('Formato de token inválido.', 401);
  }

  try {
    const payload = jwtUtils.verify(token);
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch {
    throw new AppError('Token inválido ou expirado.', 401);
  }
}
