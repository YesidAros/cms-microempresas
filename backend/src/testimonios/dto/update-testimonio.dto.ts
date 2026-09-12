import { PartialType } from '@nestjs/mapped-types';
import { CreateTestimonioDto } from './create-testimonio.dto';

export class UpdateTestimonioDto extends PartialType(CreateTestimonioDto) {}