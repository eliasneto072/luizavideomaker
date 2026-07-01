import { Request, Response } from 'express';
import { galleriesService } from './galleries.service';
import {
  createGallerySchema,
  updateGallerySchema,
} from './galleries.schema';
import { httpResponse } from '../../shared/http/httpResponse';
import { AppError } from '../../shared/errors/AppError';

/**
 * Converte campos BigInt (ex.: sizeBytes) em string para que possam ser
 * serializados em JSON, que não suporta BigInt nativamente.
 */
function serialize<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_key, value) =>
      typeof value === 'bigint' ? value.toString() : value,
    ),
  );
}

/**
 * Controller de galerias (painel).
 *
 * Endpoints privados usados pela Luiza para gerenciar as galerias.
 * Valida a entrada, delega ao service e devolve respostas padronizadas.
 */
export const galleriesController = {
  /** POST /api/galleries — cria uma galeria. */
  async create(req: Request, res: Response) {
    const data = createGallerySchema.parse(req.body);
    const gallery = await galleriesService.create(data);
    return httpResponse.created(
      res,
      serialize(gallery),
      'Galeria criada com sucesso.',
    );
  },

  /** GET /api/galleries — lista todas as galerias. */
  async list(_req: Request, res: Response) {
    const galleries = await galleriesService.list();
    return httpResponse.ok(res, serialize(galleries));
  },

  /** GET /api/galleries/:id — detalha uma galeria com seus arquivos. */
  async getById(req: Request, res: Response) {
    const gallery = await galleriesService.getById(req.params.id);
    return httpResponse.ok(res, serialize(gallery));
  },

  /** PATCH /api/galleries/:id — edita/renova uma galeria. */
  async update(req: Request, res: Response) {
    const data = updateGallerySchema.parse(req.body);
    const gallery = await galleriesService.update(req.params.id, data);
    return httpResponse.ok(res, serialize(gallery), 'Galeria atualizada.');
  },

  /** DELETE /api/galleries/:id — remove a galeria e seus arquivos. */
  async remove(req: Request, res: Response) {
    await galleriesService.remove(req.params.id);
    return httpResponse.noContent(res);
  },

  /** POST /api/galleries/:id/files — faz upload de um arquivo. */
  async uploadFile(req: Request, res: Response) {
    if (!req.file) {
      throw new AppError('Nenhum arquivo enviado.', 400);
    }

    const record = await galleriesService.uploadFile(req.params.id, {
      originalname: req.file.originalname,
      buffer: req.file.buffer,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    return httpResponse.created(
      res,
      serialize(record),
      'Arquivo enviado com sucesso.',
    );
  },

  /** DELETE /api/galleries/:id/files/:fileId — remove um arquivo. */
  async removeFile(req: Request, res: Response) {
    await galleriesService.removeFile(req.params.id, req.params.fileId);
    return httpResponse.noContent(res);
  },
};
