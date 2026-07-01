import sharp from 'sharp';

/**
 * Utilitários de imagem.
 *
 * Usa a biblioteca `sharp` para gerar miniaturas leves das fotos e
 * extrair suas dimensões. As miniaturas deixam a galeria rápida, pois o
 * cliente carrega versões pequenas no grid e só busca o original ao
 * ampliar ou baixar.
 */

// Largura máxima da miniatura (mantém a proporção). 600px é suficiente
// para um grid nítido sem pesar.
const THUMBNAIL_WIDTH = 600;

// Qualidade do JPEG da miniatura (0–100). 72 equilibra nitidez e peso.
const THUMBNAIL_QUALITY = 72;

export const imageUtils = {
  /**
   * Gera uma miniatura JPEG a partir do buffer de uma imagem.
   *
   * @param buffer  Conteúdo original da imagem.
   * @returns       Buffer da miniatura (JPEG).
   */
  async generateThumbnail(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .rotate() // respeita a orientação EXIF (fotos de celular)
      .resize({ width: THUMBNAIL_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: THUMBNAIL_QUALITY })
      .toBuffer();
  },

  /**
   * Extrai as dimensões (largura e altura) de uma imagem.
   * Útil para o layout do grid na galeria. Retorna null se não
   * conseguir ler os metadados.
   */
  async getDimensions(
    buffer: Buffer,
  ): Promise<{ width: number; height: number } | null> {
    try {
      const metadata = await sharp(buffer).metadata();
      if (metadata.width && metadata.height) {
        return { width: metadata.width, height: metadata.height };
      }
      return null;
    } catch {
      return null;
    }
  },
};
