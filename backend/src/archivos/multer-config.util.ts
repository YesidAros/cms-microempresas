import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANO_MAXIMO_BYTES = 5 * 1024 * 1024; // 5MB

export function crearConfiguracionMulter(carpetaDestino: string) {
  return {
    storage: diskStorage({
      destination: `./uploads/${carpetaDestino}`,
      filename: (_req, archivo, callback) => {
        const nombreUnico = `${randomUUID()}${extname(archivo.originalname)}`;
        callback(null, nombreUnico);
      },
    }),
    fileFilter: (_req: any, archivo: Express.Multer.File, callback: any) => {
      if (!TIPOS_PERMITIDOS.includes(archivo.mimetype)) {
        return callback(
          new BadRequestException(
            'Solo se permiten imagenes en formato JPG, PNG o WEBP',
          ),
          false,
        );
      }
      callback(null, true);
    },
    limits: {
      fileSize: TAMANO_MAXIMO_BYTES,
    },
  };
}