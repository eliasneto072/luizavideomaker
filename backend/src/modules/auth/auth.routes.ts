import { Router } from 'express';
import { authController } from './auth.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../shared/http/asyncHandler';

/**
 * Rotas de autenticação.
 *
 *   POST /api/auth/login → pública (a Luiza faz login)
 *   GET  /api/auth/me    → privada (exige token válido)
 */
const authRoutes = Router();

authRoutes.post('/login', asyncHandler(authController.login));
authRoutes.get('/me', authMiddleware, asyncHandler(authController.me));

export { authRoutes };
