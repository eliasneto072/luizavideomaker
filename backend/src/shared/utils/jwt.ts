import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env';

/**
 * Dados embutidos no token (payload).
 * Mantém apenas o essencial para identificar o usuário.
 */
export interface TokenPayload {
  sub: string; // id do usuário
  role: string; // papel (ADMIN)
}

/**
 * Utilitários de JWT.
 *
 * Centraliza a geração e a verificação dos tokens de autenticação,
 * usando o segredo e o tempo de expiração definidos no ambiente.
 */
export const jwtUtils = {
  /** Gera um token assinado para o usuário informado. */
  sign(payload: TokenPayload): string {
    const options: SignOptions = {
      expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
    };
    return jwt.sign(payload, env.JWT_SECRET, options);
  },

  /** Verifica e decodifica um token. Lança erro se for inválido/expirado. */
  verify(token: string): TokenPayload {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  },
};
