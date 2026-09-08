import { IsEmail, IsString, MinLength, IsNotEmpty, IsInt } from 'class-validator';

export class CreateUsuarioDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsInt()
  empresaId!: number;
}