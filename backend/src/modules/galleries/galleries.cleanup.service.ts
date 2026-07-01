import { GalleryStatus } from '@prisma/client';
import { galleriesRepository } from './galleries.repository';
import { storageService } from '../../shared/storage/storage.service';

/**
 * Serviço de limpeza de galerias expiradas.
 *
 * Percorre as galerias que já passaram da data de expiração e ainda
 * estão ativas, remove seus arquivos do R2 (interrompendo o custo de
 * storage) e marca cada uma como EXPIRED.
 *
 * Os registros das galerias e dos arquivos são mantidos no banco (com
 * status EXPIRED) para histórico; apenas os binários no R2 são
 * removidos. Assim, a Luiza ainda vê no painel que a galeria existiu e
 * pode, se quiser, renová-la (o que exigirá novo upload).
 */
export const galleriesCleanupService = {
  /**
   * Executa a limpeza das galerias expiradas.
   *
   * @returns Um resumo com quantas galerias foram expiradas e quantos
   *          arquivos foram removidos do storage.
   */
  async run(): Promise<{ galleriesExpired: number; filesRemoved: number }> {
    const now = new Date();
    const expired = await galleriesRepository.findExpired(now);

    let filesRemoved = 0;

    for (const gallery of expired) {
      // Reúne as chaves de todos os arquivos (originais + miniaturas).
      const keys: string[] = [];
      for (const file of gallery.files) {
        keys.push(file.storageKey);
        if (file.thumbnailKey) keys.push(file.thumbnailKey);
      }

      // Remove os binários do R2.
      if (keys.length > 0) {
        await storageService.deleteMany(keys);
        filesRemoved += keys.length;
      }

      // Marca a galeria como expirada (mantém o registro para histórico).
      await galleriesRepository.update(gallery.id, {
        status: GalleryStatus.EXPIRED,
      });
    }

    return {
      galleriesExpired: expired.length,
      filesRemoved,
    };
  },
};
