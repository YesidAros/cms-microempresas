import { IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class CreateClienteDto {
  @IsString()
  nombre!: string;

  @IsOptional()
  @IsBoolean()
  autorizado?: boolean;

  @IsInt()
  empresaId!: number;
}