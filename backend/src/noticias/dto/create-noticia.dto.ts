export class CreateNoticiaDto {
  titulo: string;
  resumen?: string;
  contenido: string;
  imagenUrl?: string;
  slug: string;
  publicado?: boolean;
  empresaId: number;
}