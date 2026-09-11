import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { readFileSync, unlinkSync } from 'fs';

const TIPOS_PERMITIDOS = [
  'image/jpeg',
  'image/png',
  'image/webp',
  // Algunos clientes (Postman, ciertos navegadores/OS) no logran detectar
  // el tipo real de un archivo y envian este generico. Lo dejamos pasar
  // aqui porque validarFirmaArchivo() despues verifica el contenido real
  // del archivo, que es la validacion que realmente importa.
  'application/octet-stream',
];
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

/**
 * Verifica que el contenido real del archivo (sus primeros bytes, o
 * "firma"/"magic number") corresponda efectivamente a una imagen JPG, PNG
 * o WEBP, sin depender del mimetype declarado por el cliente (que se
 * puede falsificar facilmente, o simplemente no detectarse bien). Si no
 * coincide con ninguna firma valida, borra el archivo del disco y lanza
 * un error.
 */
export function validarFirmaArchivo(rutaArchivo: string) {
  const buffer = readFileSync(rutaArchivo);

  const esJpeg =
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff;

  const firmaPng = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  const esPng =
    buffer.length >= firmaPng.length &&
    firmaPng.every((byte, i) => buffer[i] === byte);

  const esWebp =
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP';

  if (!esJpeg && !esPng && !esWebp) {
    unlinkSync(rutaArchivo);
    throw new BadRequestException(
      'El archivo no corresponde a una imagen valida (JPG, PNG o WEBP)',
    );
  }
}