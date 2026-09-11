import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { NoticiasService } from './noticias.service';
import { CreateNoticiaDto } from './dto/create-noticia.dto';
import { UpdateNoticiaDto } from './dto/update-noticia.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  crearConfiguracionMulter,
  validarFirmaArchivo,
} from '../archivos/multer-config.util';
import { PaginacionQueryDto } from '../shared/dto/paginacion-query.dto';

@Controller('noticias')
export class NoticiasController {
  constructor(private readonly noticiasService: NoticiasService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() createNoticiaDto: CreateNoticiaDto) {
    return this.noticiasService.create(createNoticiaDto);
  }

  @Get()
  findAll(@Query() paginacionQueryDto: PaginacionQueryDto) {
    return this.noticiasService.findAll(paginacionQueryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.noticiasService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updateNoticiaDto: UpdateNoticiaDto) {
    return this.noticiasService.update(+id, updateNoticiaDto);
  }

  @Post(':id/imagen')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        archivo: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('archivo', crearConfiguracionMulter('noticias')),
  )
  subirImagen(
    @Param('id') id: string,
    @UploadedFile() archivo: Express.Multer.File,
  ) {
    validarFirmaArchivo(archivo.path);
    return this.noticiasService.actualizarImagen(+id, archivo.filename);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.noticiasService.remove(+id);
  }
}