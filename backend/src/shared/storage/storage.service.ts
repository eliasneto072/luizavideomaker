import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client, R2_BUCKET } from './r2.client';
import { env } from '../../config/env';

/**
 * Serviço de armazenamento (Cloudflare R2).
 *
 * Encapsula todas as operações com os arquivos das galerias:
 * envio, geração de links de download e remoção. Mantém o restante da
 * aplicação isolado dos detalhes do SDK S3/R2.
 *
 * Conceito de "key": cada arquivo no bucket é identificado por uma
 * chave (caminho), por exemplo:
 *   galleries/<galleryId>/<arquivo>.jpg
 *   galleries/<galleryId>/thumbs/<arquivo>.jpg
 */
export const storageService = {
  /**
   * Envia um arquivo para o R2.
   *
   * @param key          Caminho/identificador do objeto no bucket.
   * @param body         Conteúdo do arquivo (buffer).
   * @param contentType  Tipo MIME (ex.: image/jpeg, video/mp4).
   */
  async upload(key: string, body: Buffer, contentType: string): Promise<void> {
    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
  },

  /**
   * Gera uma URL assinada e temporária para download de um arquivo.
   *
   * O arquivo no R2 não é público; este link concede acesso por tempo
   * limitado (definido em R2_SIGNED_URL_EXPIRES). É gerado apenas após
   * o cliente provar ter a senha da galeria.
   *
   * @param key       Caminho do objeto no bucket.
   * @param fileName  Nome sugerido para o arquivo baixado (opcional).
   * @returns         URL temporária de download.
   */
  async getDownloadUrl(key: string, fileName?: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      // Força o navegador a baixar com o nome original em vez de abrir.
      ResponseContentDisposition: fileName
        ? `attachment; filename="${encodeURIComponent(fileName)}"`
        : undefined,
    });

    return getSignedUrl(r2Client, command, {
      expiresIn: env.R2_SIGNED_URL_EXPIRES,
    });
  },

  /**
   * Gera uma URL assinada e temporária apenas para visualização
   * (inline) — usada para exibir miniaturas e fotos na galeria sem
   * forçar download.
   *
   * @param key  Caminho do objeto no bucket.
   * @returns    URL temporária de visualização.
   */
  async getViewUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    });

    return getSignedUrl(r2Client, command, {
      expiresIn: env.R2_SIGNED_URL_EXPIRES,
    });
  },

  /**
   * Remove um único arquivo do R2.
   *
   * @param key  Caminho do objeto a remover.
   */
  async delete(key: string): Promise<void> {
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
      }),
    );
  },

  /**
   * Remove vários arquivos do R2 de uma vez.
   *
   * Útil ao apagar uma galeria inteira ou na limpeza de galerias
   * expiradas. O R2 aceita até 1000 chaves por requisição.
   *
   * @param keys  Lista de caminhos a remover.
   */
  async deleteMany(keys: string[]): Promise<void> {
    if (keys.length === 0) return;

    // Divide em lotes de 1000 (limite da API).
    const chunkSize = 1000;
    for (let i = 0; i < keys.length; i += chunkSize) {
      const chunk = keys.slice(i, i + chunkSize);
      await r2Client.send(
        new DeleteObjectsCommand({
          Bucket: R2_BUCKET,
          Delete: {
            Objects: chunk.map((Key) => ({ Key })),
          },
        }),
      );
    }
  },
};
