export class CreateServicioDto {
  nombre: string;
  descripcion?: string;
  imagenUrl?: string;
  orden?: number;
  empresaId: number;
}