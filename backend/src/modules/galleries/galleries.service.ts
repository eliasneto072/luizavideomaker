import { GalleryStatus, FileType } from '@prisma/client';
import { galleriesRepository } from './galleries.repository';
import {
  CreateGalleryInput,
  UpdateGalleryInput,
} from './galleries.schema';
import { passwordUtils } from '../../shared/utils/password';
import { generateSlug } from '../../shared/utils/slug';
import { imageUtils } from '../../shared/utils/image';
import { storageService } from '../../shared/storage/storage.service';
import { AppError } from '../../shared/errors/AppError';

/** Período padrão de validade de uma galeria, em dias. */
const DEFAULT_EXPIRATION_DAYS = 60;

/** Calcula a data de expiração somando dias à data atual. */
function expirationDate(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * Serviço de galerias (painel).
 *
 * Concentra a regra de negócio da gestão de galerias pela Luiza: criar,
 * listar, editar, renovar, fazer upload de arquivos e remover. Orquestra
 * o repositório e o storage (R2).
 */
export const galleriesService = {
  /**
   * Cria uma galeria.
   * Gera um slug único, faz o hash da senha e define a data de
   * expiração (padrão de 60 dias, salvo se informado outro valor).
   */
  async create({
    title,
    clientName,
    password,
    expiresInDays,
  }: CreateGalleryInput) {
    // Gera um slug garantidamente único.
    let slug = generateSlug();
    while (await galleriesRepository.slugExists(slug)) {
      slug = generateSlug();
    }

    const passwordHash = await passwordUtils.hash(password);
    const days = expiresInDays ?? DEFAULT_EXPIRATION_DAYS;

    const gallery = await galleriesRepository.create({
      title,
      clientName,
      slug,
      passwordHash,
      expiresAt: expirationDate(days),
    });

    return gallery;
  },

  /** Lista todas as galerias (para o painel). */
  async list() {
    return galleriesRepository.findMany();
  },

  /** Detalha uma galeria com seus arquivos; falha se não existir. */
  async getById(id: string) {
    const gallery = await galleriesRepository.findById(id);
    if (!gallery) {
      throw new AppError('Galeria não encontrada.', 404);
    }
    return gallery;
  },

  /**
   * Atualiza uma galeria.
   * Permite editar dados, trocar a senha (re-hash), alterar o status e
   * renovar a validade (renewForDays, a partir de agora).
   */
  async update(id: string, data: UpdateGalleryInput) {
    await this.getById(id); // garante que existe

    const updateData: Record<string, unknown> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.clientName !== undefined) updateData.clientName = data.clientName;
    if (data.status !== undefined) updateData.status = data.status;

    if (data.password !== undefined) {
      updateData.passwordHash = await passwordUtils.hash(data.password);
    }

    // Renovação: estende a validade e reativa a galeria.
    if (data.renewForDays !== undefined) {
      updateData.expiresAt = expirationDate(data.renewForDays);
      updateData.status = GalleryStatus.ACTIVE;
    }

    return galleriesRepository.update(id, updateData);
  },

  /**
   * Remove uma galeria por completo: apaga os arquivos do R2 e, em
   * seguida, o registro no banco (os arquivos saem em cascata).
   */
  async remove(id: string) {
    const gallery = await galleriesRepository.findById(id);
    if (!gallery) {
      throw new AppError('Galeria não encontrada.', 404);
    }

    // Junta as chaves de todos os arquivos (originais + miniaturas).
    const keys: string[] = [];
    for (const file of gallery.files) {
      keys.push(file.storageKey);
      if (file.thumbnailKey) keys.push(file.thumbnailKey);
    }

    await storageService.deleteMany(keys);
    await galleriesRepository.delete(id);
  },

  /**
   * Faz upload de um arquivo para uma galeria.
   *
   * Para fotos: gera uma miniatura (thumbnail) leve e extrai as
   * dimensões. Vídeos são enviados sem processamento de imagem. O
   * binário vai para o R2 e os metadados para o banco.
   *
   * @param galleryId  Galeria de destino.
   * @param file       Arquivo recebido (multer): buffer, nome e mimetype.
   */
  async uploadFile(
    galleryId: string,
    file: { originalname: string; buffer: Buffer; mimetype: string; size: number },
  ) {
    const gallery = await this.getById(galleryId);

    const isVideo = file.mimetype.startsWith('video/');
    const type = isVideo ? FileType.VIDEO : FileType.PHOTO;

    // Base de chave única e organizada no bucket.
    const safeName = file.originalname.replace(/\s+/g, '_');
    const baseKey = `galleries/${gallery.id}/${generateSlug()}`;
    const storageKey = `${baseKey}-${safeName}`;

    // Envia o arquivo original ao R2.
    await storageService.upload(storageKey, file.buffer, file.mimetype);

    // Para fotos: gera miniatura e extrai dimensões.
    let thumbnailKey: string | null = null;
    let width: number | null = null;
    let height: number | null = null;

    if (!isVideo) {
      const dimensions = await imageUtils.getDimensions(file.buffer);
      if (dimensions) {
        width = dimensions.width;
        height = dimensions.height;
      }

      try {
        const thumbBuffer = await imageUtils.generateThumbnail(file.buffer);
        thumbnailKey = `${baseKey}-thumb.jpg`;
        await storageService.upload(thumbnailKey, thumbBuffer, 'image/jpeg');
      } catch {
        // Se a miniatura falhar, segue sem ela (a galeria usa o original).
        thumbnailKey = null;
      }
    }

    // Define a ordem (após os arquivos já existentes).
    const order = await galleriesRepository.countFiles(galleryId);

    // Registra os metadados no banco.
    const record = await galleriesRepository.createFile({
      gallery: { connect: { id: galleryId } },
      type,
      fileName: file.originalname,
      storageKey,
      thumbnailKey,
      sizeBytes: BigInt(file.size),
      width,
      height,
      order,
    });

    return record;
  },

  /**
   * Remove um arquivo específico de uma galeria: apaga do R2 e do banco.
   */
  async removeFile(galleryId: string, fileId: string) {
    const file = await galleriesRepository.findFileById(fileId);

    if (!file || file.galleryId !== galleryId) {
      throw new AppError('Arquivo não encontrado nesta galeria.', 404);
    }

    const keys = [file.storageKey];
    if (file.thumbnailKey) keys.push(file.thumbnailKey);

    await storageService.deleteMany(keys);
    await galleriesRepository.deleteFile(fileId);
  },
};
