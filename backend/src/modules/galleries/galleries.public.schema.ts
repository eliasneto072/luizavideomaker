import { z } from 'zod';

/**
 * Schema de validação do acesso público às galerias.
 */

/**
 * Desbloqueio da galeria pelo cliente.
 * O cliente informa apenas a senha; o slug vem pela URL.
 */
export const unlockGallerySchema = z.object({
  password: z
    .string({ required_error: 'A senha é obrigatória.' })
    .min(1, 'Informe a senha.'),
});

export type UnlockGalleryInput = z.infer<typeof unlockGallerySchema>;
