import { IsString, IsOptional, IsUrl, IsBoolean, IsInt } from 'class-validator';

export class CreateBannerDto {
  @IsOptional()
  @IsUrl()
  imagenUrl?: string;

  @IsOptional()
  @IsString()
  texto?: string;

  @IsOptional()
  @IsString()
  textoBoton?: string;

  @IsOptional()
  @IsString()
  linkDestino?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsInt()
  orden?: number;

  @IsInt()
  empresaId: number;
}