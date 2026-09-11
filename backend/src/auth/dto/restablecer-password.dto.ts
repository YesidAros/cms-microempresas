import { IsString, MinLength } from 'class-validator';

export class RestablecerPasswordDto {
  @IsString()
  token!: string;

  @IsString()
  @MinLength(6)
  nuevaPassword!: string;
}