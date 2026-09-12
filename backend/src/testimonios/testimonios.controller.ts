import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { TestimoniosService } from './testimonios.service';
import { CreateTestimonioDto } from './dto/create-testimonio.dto';
import { UpdateTestimonioDto } from './dto/update-testimonio.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginacionQueryDto } from '../shared/dto/paginacion-query.dto';

@Controller('testimonios')
export class TestimoniosController {
  constructor(private readonly testimoniosService: TestimoniosService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() createTestimonioDto: CreateTestimonioDto) {
    return this.testimoniosService.create(createTestimonioDto);
  }

  @Get()
  findAllPublico(@Query() paginacionQueryDto: PaginacionQueryDto) {
    return this.testimoniosService.findAllPublico(paginacionQueryDto);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAllAdmin(@Query() paginacionQueryDto: PaginacionQueryDto) {
    return this.testimoniosService.findAllAdmin(paginacionQueryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.testimoniosService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(
    @Param('id') id: string,
    @Body() updateTestimonioDto: UpdateTestimonioDto,
  ) {
    return this.testimoniosService.update(+id, updateTestimonioDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.testimoniosService.remove(+id);
  }
}