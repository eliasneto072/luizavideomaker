import { z } from 'zod';

/**
 * Schema de validação do login.
 *
 * Garante que o corpo da requisição traga um e-mail válido e uma senha
 * não vazia antes de chegar à regra de negócio.
 */
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'E-mail é obrigatório.' })
    .email('E-mail inválido.'),
  password: z
    .string({ required_error: 'Senha é obrigatória.' })
    .min(1, 'Senha é obrigatória.'),
});

export type LoginInput = z.infer<typeof loginSchema>;
