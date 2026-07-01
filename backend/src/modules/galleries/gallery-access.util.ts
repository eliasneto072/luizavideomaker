import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env';

/**
 * Token de acesso à galeria.
 *
 * Após o cliente informar a senha correta, é emitido um token JWT
 * específico daquela galeria. Ele autoriza apenas a visualização e o
 * download dos arquivos daquela galeria — não tem relação com o token
 * de administração da Luiza.
 *
 * O token é curto (algumas horas) e carrega o id e o slug da galeria.
 */
export interface GalleryTokenPayload {
  galleryId: string;
  slug: string;
  scope: 'gallery-access';
}

// Validade do token de acesso do cliente (independente do JWT de admin).
const GALLERY_TOKEN_EXPIRES = '6h';

export const galleryAccess = {
  /** Emite um token de acesso para uma galeria específica. */
  sign(galleryId: string, slug: string): string {
    const payload: GalleryTokenPayload = {
      galleryId,
      slug,
      scope: 'gallery-access',
    };
    const options: SignOptions = { expiresIn: GALLERY_TOKEN_EXPIRES };
    return jwt.sign(payload, env.JWT_SECRET, options);
  },

  /**
   * Verifica um token de acesso à galeria.
   * Lança erro se for inválido, expirado ou de escopo diferente.
   */
  verify(token: string): GalleryTokenPayload {
    const decoded = jwt.verify(token, env.JWT_SECRET) as GalleryTokenPayload;

    if (decoded.scope !== 'gallery-access') {
      throw new Error('Escopo de token inválido.');
    }

    return decoded;
  },
};
