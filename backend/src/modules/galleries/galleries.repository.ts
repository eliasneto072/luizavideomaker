import { Prisma, GalleryStatus } from '@prisma/client';
import { prisma } from '../../config/prisma';

/**
 * Repositório de galerias.
 *
 * Camada de acesso ao banco — apenas queries do Prisma, sem regra de
 * negócio (que fica no service). Cobre tanto as galerias quanto seus
 * arquivos.
 */
export const galleriesRepository = {
  // ---------- Galerias ----------

  /** Cria uma galeria. */
  create(data: Prisma.GalleryCreateInput) {
    return prisma.gallery.create({ data });
  },

  /** Lista todas as galerias (mais recentes primeiro), com contagem de arquivos. */
  findMany() {
    return prisma.gallery.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { files: true } },
      },
    });
  },

  /** Busca uma galeria pelo id, incluindo seus arquivos ordenados. */
  findById(id: string) {
    return prisma.gallery.findUnique({
      where: { id },
      include: {
        files: { orderBy: { order: 'asc' } },
      },
    });
  },

  /** Busca uma galeria pelo slug (usado no acesso público). */
  findBySlug(slug: string) {
    return prisma.gallery.findUnique({
      where: { slug },
      include: {
        files: { orderBy: { order: 'asc' } },
      },
    });
  },

  /** Verifica se um slug já existe (para garantir unicidade). */
  async slugExists(slug: string): Promise<boolean> {
    const found = await prisma.gallery.findUnique({
      where: { slug },
      select: { id: true },
    });
    return found !== null;
  },

  /** Atualiza os dados de uma galeria. */
  update(id: string, data: Prisma.GalleryUpdateInput) {
    return prisma.gallery.update({ where: { id }, data });
  },

  /** Remove uma galeria (os arquivos são removidos em cascata no banco). */
  delete(id: string) {
    return prisma.gallery.delete({ where: { id } });
  },

  /** Lista galerias expiradas (status ainda ACTIVE mas com data vencida). */
  findExpired(now: Date) {
    return prisma.gallery.findMany({
      where: {
        status: GalleryStatus.ACTIVE,
        expiresAt: { lt: now },
      },
      include: { files: true },
    });
  },

  // ---------- Arquivos ----------

  /** Adiciona um arquivo a uma galeria. */
  createFile(data: Prisma.GalleryFileCreateInput) {
    return prisma.galleryFile.create({ data });
  },

  /** Busca um arquivo pelo id. */
  findFileById(id: string) {
    return prisma.galleryFile.findUnique({ where: { id } });
  },

  /** Remove o registro de um arquivo. */
  deleteFile(id: string) {
    return prisma.galleryFile.delete({ where: { id } });
  },

  /** Conta quantos arquivos uma galeria possui (para definir a ordem). */
  countFiles(galleryId: string) {
    return prisma.galleryFile.count({ where: { galleryId } });
  },
};
