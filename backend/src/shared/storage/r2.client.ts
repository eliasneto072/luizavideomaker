import { S3Client } from '@aws-sdk/client-s3';
import { env } from '../../config/env';

/**
 * Cliente do Cloudflare R2.
 *
 * O R2 é compatível com a API S3 da AWS, então usamos o `S3Client` do
 * AWS SDK apontando para o endpoint do R2. A região é fixada em "auto",
 * conforme exigido pelo R2.
 *
 * O endpoint segue o formato:
 *   https://<account-id>.r2.cloudflarestorage.com
 */
const endpoint = `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

export const r2Client = new S3Client({
  region: 'auto',
  endpoint,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

/** Nome do bucket onde os arquivos das galerias são armazenados. */
export const R2_BUCKET = env.R2_BUCKET_NAME;
