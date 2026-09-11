import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Servicio } from './entities/servicio.entity';
import { Empresa } from '../empresa/entities/empresa.entity';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';
import { ArchivosService } from '../archivos/archivos.service';
import { PaginacionQueryDto } from '../shared/dto/paginacion-query.dto';

@Injectable()
export class ServiciosService {
  constructor(
    @InjectRepository(Servicio)
    private readonly servicioRepository: Repository<Servicio>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    private readonly archivosService: ArchivosService,
  ) {}

  async create(createServicioDto: CreateServicioDto) {
    const { empresaId, ...datosServicio } = createServicioDto;
    const empresa = await this.empresaRepository.findOneBy({ id: empresaId });
    if (!empresa) {
      throw new NotFoundException(`No existe una empresa con id ${empresaId}`);
    }
    const nuevoServicio = this.servicioRepository.create({
      ...datosServicio,
      empresa,
    });
    return this.servicioRepository.save(nuevoServicio);
  }

  async findAll(paginacionQueryDto: PaginacionQueryDto) {
    const { pagina, limite } = paginacionQueryDto;
    const [data, total] = await this.servicioRepository.findAndCount({
      relations: { empresa: true },
      skip: (pagina - 1) * limite,
      take: limite,
    });

    return {
      data,
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    };
  }

  findOne(id: number) {
    return this.servicioRepository.findOne({
      where: { id },
      relations: { empresa: true },
    });
  }

  async update(id: number, updateServicioDto: UpdateServicioDto) {
    await this.servicioRepository.update(id, updateServicioDto);
    return this.findOne(id);
  }

  async actualizarImagen(id: number, nombreArchivo: string) {
    const imagenUrl = this.archivosService.construirUrlPublica(
      'servicios',
      nombreArchivo,
    );
    await this.servicioRepository.update(id, { imagenUrl });
    return this.findOne(id);
  }

  remove(id: number) {
    return this.servicioRepository.delete(id);
  }
}