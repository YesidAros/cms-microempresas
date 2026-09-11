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
import { ServiciosService } from './servicios.service';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  crearConfiguracionMulter,
  validarFirmaArchivo,
} from '../archivos/multer-config.util';
import { PaginacionQueryDto } from '../shared/dto/paginacion-query.dto';

@Controller('servicios')
export class ServiciosController {
  constructor(private readonly serviciosService: ServiciosService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() createServicioDto: CreateServicioDto) {
    return this.serviciosService.create(createServicioDto);
  }

  @Get()
  findAll(@Query() paginacionQueryDto: PaginacionQueryDto) {
    return this.serviciosService.findAll(paginacionQueryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviciosService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updateServicioDto: UpdateServicioDto) {
    return this.serviciosService.update(+id, updateServicioDto);
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
    FileInterceptor('archivo', crearConfiguracionMulter('servicios')),
  )
  subirImagen(
    @Param('id') id: string,
    @UploadedFile() archivo: Express.Multer.File,
  ) {
    validarFirmaArchivo(archivo.path);
    return this.serviciosService.actualizarImagen(+id, archivo.filename);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.serviciosService.remove(+id);
  }
}