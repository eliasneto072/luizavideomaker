import { Request, Response } from 'express';
import { authService } from './auth.service';
import { loginSchema } from './auth.schema';
import { httpResponse } from '../../shared/http/httpResponse';

/**
 * Controller de autenticação.
 *
 * Recebe as requisições HTTP, valida a entrada com Zod, delega ao
 * service e devolve a resposta padronizada. Erros são repassados ao
 * middleware global via `next`.
 */
export const authController = {
  /** POST /api/auth/login — autentica a Luiza e devolve o token. */
  async login(req: Request, res: Response) {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data);
    return httpResponse.ok(res, result, 'Login realizado com sucesso.');
  },

  /** GET /api/auth/me — retorna os dados da sessão atual. */
  async me(req: Request, res: Response) {
    // req.user é garantido pelo authMiddleware
    const userId = req.user!.id;
    const user = await authService.me(userId);
    return httpResponse.ok(res, user);
  },
};
