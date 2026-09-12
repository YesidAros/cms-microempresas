import { IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class CreateTestimonioDto {
  @IsString()
  nombreAutor!: string;

  @IsOptional()
  @IsString()
  cargoOEmpresa?: string;

  @IsString()
  texto!: string;

  @IsOptional()
  @IsBoolean()
  autorizado?: boolean;

  @IsInt()
  empresaId!: number;
}