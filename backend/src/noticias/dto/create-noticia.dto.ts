import { IsString, IsNotEmpty, IsOptional, IsUrl, IsBoolean, IsInt } from 'class-validator';

export class CreateNoticiaDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsOptional()
  @IsString()
  resumen?: string;

  @IsString()
  @IsNotEmpty()
  contenido: string;

  @IsOptional()
  @IsUrl()
  imagenUrl?: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsOptional()
  @IsBoolean()
  publicado?: boolean;

  @IsInt()
  empresaId: number;
}