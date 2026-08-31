import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Servicio } from './entities/servicio.entity';
import { Empresa } from '../empresa/entities/empresa.entity';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';

@Injectable()
export class ServiciosService {
  constructor(
    @InjectRepository(Servicio)
    private readonly servicioRepository: Repository<Servicio>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
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

  findAll() {
    return this.servicioRepository.find({ relations: { empresa: true } });
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

  remove(id: number) {
    return this.servicioRepository.delete(id);
  }
}