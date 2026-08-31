export class CreateBannerDto {
  imagenUrl?: string;
  texto?: string;
  textoBoton?: string;
  linkDestino?: string;
  activo?: boolean;
  orden?: number;
  empresaId: number;
}