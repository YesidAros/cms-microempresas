import { PartialType } from '@nestjs/mapped-types';
import { CreateCorreoDto } from './create-correo.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateCorreoDto extends PartialType(CreateCorreoDto) {
  @IsOptional()
  @IsBoolean()
  leido?: boolean;
}