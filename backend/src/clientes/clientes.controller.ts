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
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  crearConfiguracionMulter,
  validarFirmaArchivo,
} from '../archivos/multer-config.util';
import { PaginacionQueryDto } from '../shared/dto/paginacion-query.dto';

@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() createClienteDto: CreateClienteDto) {
    return this.clientesService.create(createClienteDto);
  }

  @Get()
  findAllPublico(@Query() paginacionQueryDto: PaginacionQueryDto) {
    return this.clientesService.findAllPublico(paginacionQueryDto);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAllAdmin(@Query() paginacionQueryDto: PaginacionQueryDto) {
    return this.clientesService.findAllAdmin(paginacionQueryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientesService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updateClienteDto: UpdateClienteDto) {
    return this.clientesService.update(+id, updateClienteDto);
  }

  @Post(':id/logo')
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
    FileInterceptor('archivo', crearConfiguracionMulter('clientes')),
  )
  subirLogo(
    @Param('id') id: string,
    @UploadedFile() archivo: Express.Multer.File,
  ) {
    validarFirmaArchivo(archivo.path);
    return this.clientesService.actualizarLogo(+id, archivo.filename);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.clientesService.remove(+id);
  }
}