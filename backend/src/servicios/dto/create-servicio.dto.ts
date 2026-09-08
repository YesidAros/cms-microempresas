import { IsString, IsNotEmpty, IsOptional, IsUrl, IsInt } from 'class-validator';

export class CreateServicioDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsUrl()
  imagenUrl?: string;

  @IsOptional()
  @IsInt()
  orden?: number;

  @IsInt()
  empresaId: number;
}