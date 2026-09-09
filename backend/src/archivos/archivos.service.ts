import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ArchivosService {
  constructor(private readonly configService: ConfigService) {}

  construirUrlPublica(carpeta: string, nombreArchivo: string): string {
    const backendUrl = this.configService.get<string>('BACKEND_URL');
    return `${backendUrl}/uploads/${carpeta}/${nombreArchivo}`;
  }
}