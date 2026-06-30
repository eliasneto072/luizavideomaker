import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Envolve um handler assíncrono para capturar erros automaticamente.
 *
 * Sem isso, um erro lançado dentro de um controller `async` não é
 * capturado pelo Express e derruba a aplicação. Este wrapper encaminha
 * qualquer erro ao middleware global de tratamento.
 */
export function asyncHandler(handler: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
