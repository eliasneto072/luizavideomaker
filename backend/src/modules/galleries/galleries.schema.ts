import { z } from 'zod';

/**
 * Schemas de validação do módulo de galerias (painel).
 */

/**
 * Criação de galeria.
 * A validade (em dias) é opcional; o padrão de 60 dias é aplicado no
 * service caso não seja informada.
 */
export const createGallerySchema = z.object({
  title: z
    .string({ required_error: 'O título é obrigatório.' })
    .trim()
    .min(2, 'Informe um título válido.')
    .max(150, 'Título muito longo.'),
  clientName: z
    .string({ required_error: 'O nome do cliente é obrigatório.' })
    .trim()
    .min(2, 'Informe o nome do cliente.')
    .max(150, 'Nome muito longo.'),
  password: z
    .string({ required_error: 'A senha é obrigatória.' })
    .min(4, 'A senha deve ter ao menos 4 caracteres.')
    .max(100, 'Senha muito longa.'),
  expiresInDays: z.coerce
    .number()
    .int()
    .positive()
    .max(365, 'O período máximo é de 365 dias.')
    .optional(),
});

export type CreateGalleryInput = z.infer<typeof createGallerySchema>;

/**
 * Edição de galeria.
 * Todos os campos são opcionais — atualiza apenas o que for enviado.
 * `renew` estende a validade a partir de agora (renovação).
 */
export const updateGallerySchema = z.object({
  title: z.string().trim().min(2).max(150).optional(),
  clientName: z.string().trim().min(2).max(150).optional(),
  password: z.string().min(4).max(100).optional(),
  status: z.enum(['ACTIVE', 'EXPIRED', 'ARCHIVED']).optional(),
  // Renova a validade por N dias a partir de agora.
  renewForDays: z.coerce.number().int().positive().max(365).optional(),
});

export type UpdateGalleryInput = z.infer<typeof updateGallerySchema>;
