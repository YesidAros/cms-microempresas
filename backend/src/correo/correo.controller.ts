import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CorreoService } from './correo.service';
import { CreateCorreoDto } from './dto/create-correo.dto';
import { UpdateCorreoDto } from './dto/update-correo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('correo')
export class CorreoController {
  constructor(private readonly correoService: CorreoService) {}

  @Post()
  create(@Body() createCorreoDto: CreateCorreoDto) {
    return this.correoService.create(createCorreoDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAll() {
    return this.correoService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.correoService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updateCorreoDto: UpdateCorreoDto) {
    return this.correoService.update(+id, updateCorreoDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.correoService.remove(+id);
  }
}