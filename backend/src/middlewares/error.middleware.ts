import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../shared/errors/AppError';
import { httpResponse } from '../shared/http/httpResponse';
import { env } from '../config/env';

/**
 * Middleware de tratamento global de erros.
 *
 * Centraliza a resposta de qualquer erro lançado na aplicação:
 *   - ZodError      → 400 com a lista de campos inválidos
 *   - AppError      → status definido no próprio erro (erro de negócio)
 *   - Erro genérico → 500 (logado no servidor; detalhe ocultado em produção)
 *
 * Deve ser registrado por último, depois de todas as rotas.
 */
export function errorMiddleware(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  // Erro de validação (Zod)
  if (error instanceof ZodError) {
    const errors = error.flatten().fieldErrors;
    return httpResponse.error(res, 400, 'Dados inválidos.', errors);
  }

  // Erro de negócio esperado
  if (error instanceof AppError) {
    return httpResponse.error(res, error.statusCode, error.message);
  }

  // Erro inesperado — loga no servidor e responde genérico
  console.error('❌ Erro não tratado:', error);

  return httpResponse.error(
    res,
    500,
    env.NODE_ENV === 'production'
      ? 'Erro interno do servidor.'
      : error.message,
  );
}
