import { GalleryStatus } from '@prisma/client';
import { galleriesRepository } from './galleries.repository';
import { galleryAccess } from './gallery-access.util';
import { UnlockGalleryInput } from './galleries.public.schema';
import { passwordUtils } from '../../shared/utils/password';
import { storageService } from '../../shared/storage/storage.service';
import { AppError } from '../../shared/errors/AppError';

/**
 * Serviço de acesso público às galerias.
 *
 * Cobre o fluxo do cliente (sem login): desbloquear a galeria com a
 * senha, listar os arquivos para visualização e gerar links temporários
 * de download. Todo acesso valida a existência, o status e a data de
 * expiração da galeria.
 */
export const galleriesPublicService = {
  /**
   * Verifica se a galeria está acessível (existe, não foi arquivada e
   * não expirou). Retorna a galeria ou lança o erro apropriado.
   */
  async ensureAccessible(slug: string) {
    const gallery = await galleriesRepository.findBySlug(slug);

    if (!gallery) {
      throw new AppError('Galeria não encontrada.', 404);
    }

    if (gallery.status === GalleryStatus.ARCHIVED) {
      throw new AppError('Esta galeria não está mais disponível.', 410);
    }

    // Expiração por data (mesmo que o status ainda não tenha sido
    // atualizado pela rotina de limpeza).
    if (gallery.expiresAt.getTime() < Date.now()) {
      throw new AppError('Esta galeria expirou.', 410);
    }

    return gallery;
  },

  /**
   * Retorna informações públicas básicas da galeria (sem os arquivos),
   * usadas na tela de senha: título, se está protegida e a validade.
   */
  async getPublicInfo(slug: string) {
    const gallery = await this.ensureAccessible(slug);
    return {
      title: gallery.title,
      clientName: gallery.clientName,
      expiresAt: gallery.expiresAt,
      totalFiles: gallery.files.length,
    };
  },

  /**
   * Desbloqueia a galeria: confere a senha e, se correta, emite um
   * token de acesso temporário.
   */
  async unlock(slug: string, { password }: UnlockGalleryInput) {
    const gallery = await this.ensureAccessible(slug);

    const matches = await passwordUtils.compare(
      password,
      gallery.passwordHash,
    );

    if (!matches) {
      throw new AppError('Senha incorreta.', 401);
    }

    const token = galleryAccess.sign(gallery.id, gallery.slug);

    return {
      token,
      gallery: {
        title: gallery.title,
        clientName: gallery.clientName,
        expiresAt: gallery.expiresAt,
      },
    };
  },

  /**
   * Lista os arquivos da galeria para exibição, cada um com uma URL
   * temporária de visualização (inline). Requer que o cliente já tenha
   * desbloqueado (token validado no middleware).
   */
  async listFiles(slug: string) {
    const gallery = await this.ensureAccessible(slug);

    const files = await Promise.all(
      gallery.files.map(async (file) => ({
        id: file.id,
        type: file.type,
        fileName: file.fileName,
        width: file.width,
        height: file.height,
        order: file.order,
        // URL temporária para exibir a foto/vídeo na galeria.
        url: await storageService.getViewUrl(file.storageKey),
        // Miniatura, quando disponível (fotos).
        thumbnailUrl: file.thumbnailKey
          ? await storageService.getViewUrl(file.thumbnailKey)
          : null,
      })),
    );

    return {
      title: gallery.title,
      clientName: gallery.clientName,
      expiresAt: gallery.expiresAt,
      files,
    };
  },

  /**
   * Gera uma URL temporária de download para um arquivo específico,
   * já com o nome original (Content-Disposition: attachment).
   */
  async getDownloadUrl(slug: string, fileId: string) {
    const gallery = await this.ensureAccessible(slug);

    const file = await galleriesRepository.findFileById(fileId);

    if (!file || file.galleryId !== gallery.id) {
      throw new AppError('Arquivo não encontrado nesta galeria.', 404);
    }

    const url = await storageService.getDownloadUrl(
      file.storageKey,
      file.fileName,
    );

    return { url, fileName: file.fileName };
  },
};
