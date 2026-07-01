import multer from 'multer';
import { AppError } from '../shared/errors/AppError';

/**
 * Middleware de upload (multer).
 *
 * Recebe os arquivos em memória (buffer) para que sejam enviados ao R2
 * pelo storage service, sem gravar em disco no servidor.
 *
 * Restrições:
 *   - Aceita apenas imagens e vídeos.
 *   - Limita o tamanho por arquivo (ajustável conforme necessidade).
 */

// Limite por arquivo. Vídeos de evento podem ser grandes; ajuste se
// necessário. Aqui: 2 GB por arquivo.
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024;

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (_req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');

    if (isImage || isVideo) {
      cb(null, true);
    } else {
      cb(new AppError('Apenas imagens e vídeos são permitidos.', 400));
    }
  },
});
