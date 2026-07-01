import 'dotenv/config';
import { z } from 'zod';

/**
 * Validação das variáveis de ambiente.
 *
 * Centraliza e valida tudo que vem do `.env` usando Zod. Se alguma
 * variável obrigatória estiver faltando ou inválida, a aplicação falha
 * logo na inicialização com uma mensagem clara — em vez de quebrar
 * silenciosamente em tempo de execução.
 */
const envSchema = z.object({
  // Aplicação
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3333),
  API_URL: z.string().url().default('http://localhost:3333'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),

  // Banco de dados
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL é obrigatória'),

  // Autenticação (JWT)
  JWT_SECRET: z
    .string()
    .min(16, 'JWT_SECRET deve ter ao menos 16 caracteres'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // Conta administradora (usada pelo seed)
  ADMIN_NAME: z.string().default('Luiza'),
  ADMIN_EMAIL: z.string().email().default('luiza@luizavideomaker.com'),
  ADMIN_PASSWORD: z
    .string()
    .min(6, 'ADMIN_PASSWORD deve ter ao menos 6 caracteres')
    .default('mudar-esta-senha'),

  // Storage de arquivos (Cloudflare R2 — compatível com S3)
  R2_ACCOUNT_ID: z
    .string()
    .min(1, 'R2_ACCOUNT_ID é obrigatória'),
  R2_ACCESS_KEY_ID: z
    .string()
    .min(1, 'R2_ACCESS_KEY_ID é obrigatória'),
  R2_SECRET_ACCESS_KEY: z
    .string()
    .min(1, 'R2_SECRET_ACCESS_KEY é obrigatória'),
  R2_BUCKET_NAME: z
    .string()
    .min(1, 'R2_BUCKET_NAME é obrigatória'),
  // Tempo de validade (em segundos) das URLs assinadas de download.
  R2_SIGNED_URL_EXPIRES: z.coerce.number().default(900), // 15 minutos

  // Limpeza automática de galerias expiradas
  // Segredo exigido para acionar o endpoint de limpeza (via cron externo).
  CLEANUP_SECRET: z
    .string()
    .min(8, 'CLEANUP_SECRET deve ter ao menos 8 caracteres')
    .optional(),
  // Se "true", agenda a limpeza internamente (setInterval), além do
  // endpoint. Útil quando não há um cron externo configurado.
  CLEANUP_INTERVAL_ENABLED: z
    .enum(['true', 'false'])
    .default('false'),
  // Intervalo (em horas) da limpeza interna, quando habilitada.
  CLEANUP_INTERVAL_HOURS: z.coerce.number().positive().default(12),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Variáveis de ambiente inválidas:');
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error('Falha na validação das variáveis de ambiente.');
}

export const env = parsed.data;
