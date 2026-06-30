import { Response } from 'express';

/**
 * Padroniza o formato das respostas da API.
 *
 * Mantém um envelope consistente em todos os endpoints, facilitando
 * o consumo pelo frontend:
 *   sucesso → { success: true, data, message? }
 *   erro    → { success: false, message, errors? }
 */
export const httpResponse = {
  ok<T>(res: Response, data: T, message?: string) {
    return res.status(200).json({ success: true, message, data });
  },

  created<T>(res: Response, data: T, message?: string) {
    return res.status(201).json({ success: true, message, data });
  },

  noContent(res: Response) {
    return res.status(204).send();
  },

  error(
    res: Response,
    statusCode: number,
    message: string,
    errors?: unknown,
  ) {
    return res.status(statusCode).json({ success: false, message, errors });
  },
};
