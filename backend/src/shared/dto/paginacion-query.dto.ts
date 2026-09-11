import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginacionQueryDto {
  @ApiPropertyOptional({
    default: 1,
    description: 'Numero de pagina a consultar (empieza en 1)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina: number = 1;

  @ApiPropertyOptional({
    default: 10,
    description: 'Cantidad de elementos por pagina',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limite: number = 10;
}