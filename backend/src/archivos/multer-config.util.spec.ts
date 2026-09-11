import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import { validarFirmaArchivo } from './multer-config.util';

jest.mock('fs');

describe('validarFirmaArchivo', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deberia aceptar un archivo con firma JPEG valida', () => {
    (fs.readFileSync as jest.Mock).mockReturnValue(
      Buffer.from([0xff, 0xd8, 0xff, 0x00, 0x00]),
    );

    expect(() => validarFirmaArchivo('ruta/falsa.jpg')).not.toThrow();
    expect(fs.unlinkSync).not.toHaveBeenCalled();
  });

  it('deberia aceptar un archivo con firma PNG valida', () => {
    (fs.readFileSync as jest.Mock).mockReturnValue(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    );

    expect(() => validarFirmaArchivo('ruta/falsa.png')).not.toThrow();
    expect(fs.unlinkSync).not.toHaveBeenCalled();
  });

  it('deberia aceptar un archivo con firma WEBP valida', () => {
    const buffer = Buffer.alloc(12);
    buffer.write('RIFF', 0, 'ascii');
    buffer.write('WEBP', 8, 'ascii');
    (fs.readFileSync as jest.Mock).mockReturnValue(buffer);

    expect(() => validarFirmaArchivo('ruta/falsa.webp')).not.toThrow();
    expect(fs.unlinkSync).not.toHaveBeenCalled();
  });

  it('deberia rechazar y borrar el archivo si la firma no corresponde a ninguna imagen permitida', () => {
    (fs.readFileSync as jest.Mock).mockReturnValue(
      Buffer.from('esto no es una imagen, es texto plano'),
    );

    expect(() => validarFirmaArchivo('ruta/falsa.jpg')).toThrow(
      BadRequestException,
    );
    expect(fs.unlinkSync).toHaveBeenCalledWith('ruta/falsa.jpg');
  });
});