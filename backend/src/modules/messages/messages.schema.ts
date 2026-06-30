import { z } from 'zod';

/**
 * Schemas de validação do módulo de mensagens.
 */

/**
 * Criação de mensagem — vinda do formulário público "Conta sua história".
 * Apenas nome e conteúdo são obrigatórios; o WhatsApp é opcional.
 */
export const createMessageSchema = z.object({
  name: z
    .string({ required_error: 'Nome é obrigatório.' })
    .trim()
    .min(2, 'Informe um nome válido.')
    .max(120, 'Nome muito longo.'),
  whatsapp: z
    .string()
    .trim()
    .max(20, 'WhatsApp inválido.')
    .optional()
    .or(z.literal('')), // aceita campo vazio do formulário
  content: z
    .string({ required_error: 'A mensagem é obrigatória.' })
    .trim()
    .min(5, 'Escreva uma mensagem com pelo menos 5 caracteres.')
    .max(2000, 'Mensagem muito longa.'),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;

/**
 * Atualização de status — usada pela Luiza no painel para marcar a
 * mensagem como lida ou arquivada.
 */
export const updateMessageStatusSchema = z.object({
  status: z.enum(['UNREAD', 'READ', 'ARCHIVED'], {
    errorMap: () => ({ message: 'Status inválido.' }),
  }),
});

export type UpdateMessageStatusInput = z.infer<
  typeof updateMessageStatusSchema
>;

/**
 * Filtro opcional de listagem — permite filtrar por status na query
 * string (ex.: /api/messages?status=UNREAD).
 */
export const listMessagesQuerySchema = z.object({
  status: z.enum(['UNREAD', 'READ', 'ARCHIVED']).optional(),
});

export type ListMessagesQuery = z.infer<typeof listMessagesQuerySchema>;
