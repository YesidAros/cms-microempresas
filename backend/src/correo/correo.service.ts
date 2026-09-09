import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Correo } from './entities/correo.entity';
import { Empresa } from '../empresa/entities/empresa.entity';
import { CreateCorreoDto } from './dto/create-correo.dto';
import { UpdateCorreoDto } from './dto/update-correo.dto';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { plantillaMensajeContacto } from '../notificaciones/plantillas/mensaje-contacto.plantilla';
import { renderizarPlantillaPersonalizada } from '../notificaciones/plantillas/renderizar-plantilla.util';

@Injectable()
export class CorreoService {
  constructor(
    @InjectRepository(Correo)
    private readonly correoRepository: Repository<Correo>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  async create(createCorreoDto: CreateCorreoDto) {
    const empresa = await this.empresaRepository.findOneBy({
      id: createCorreoDto.empresaId,
    });

    if (!empresa) {
      throw new NotFoundException(
        `No existe una empresa con id ${createCorreoDto.empresaId}`,
      );
    }

    const nuevoCorreo = this.correoRepository.create({
      nombre: createCorreoDto.nombre,
      email: createCorreoDto.email,
      telefono: createCorreoDto.telefono,
      mensaje: createCorreoDto.mensaje,
      empresa,
    });

    const correoGuardado = await this.correoRepository.save(nuevoCorreo);

    if (empresa.emailContacto) {
      const contenidoHtml = empresa.plantillaCorreoHtml
        ? renderizarPlantillaPersonalizada(empresa.plantillaCorreoHtml, {
            nombreEmpresa: empresa.nombre,
            nombre: createCorreoDto.nombre,
            email: createCorreoDto.email,
            telefono: createCorreoDto.telefono ?? 'No proporcionado',
            mensaje: createCorreoDto.mensaje,
          })
        : plantillaMensajeContacto({
            nombreEmpresa: empresa.nombre,
            nombreVisitante: createCorreoDto.nombre,
            emailVisitante: createCorreoDto.email,
            telefonoVisitante: createCorreoDto.telefono,
            mensaje: createCorreoDto.mensaje,
          });

      await this.notificacionesService.enviarCorreo(
        empresa.emailContacto,
        `Nuevo mensaje de contacto de ${createCorreoDto.nombre}`,
        contenidoHtml,
        createCorreoDto.email,
      );
    }

    return correoGuardado;
  }

  findAll() {
    return this.correoRepository.find({ relations: { empresa: true } });
  }

  findOne(id: number) {
    return this.correoRepository.findOne({
      where: { id },
      relations: { empresa: true },
    });
  }

  update(id: number, updateCorreoDto: UpdateCorreoDto) {
    return this.correoRepository.update(id, updateCorreoDto);
  }

  remove(id: number) {
    return this.correoRepository.delete(id);
  }
}