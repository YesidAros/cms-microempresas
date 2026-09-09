import { IsString, IsNotEmpty, IsEmail, IsOptional, IsInt } from 'class-validator';

export class CreateCorreoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsString()
  @IsNotEmpty()
  mensaje: string;

  @IsInt()
  empresaId: number;
}