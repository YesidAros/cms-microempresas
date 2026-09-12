import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Testimonio } from './entities/testimonio.entity';
import { Empresa } from '../empresa/entities/empresa.entity';
import { CreateTestimonioDto } from './dto/create-testimonio.dto';
import { UpdateTestimonioDto } from './dto/update-testimonio.dto';
import { PaginacionQueryDto } from '../shared/dto/paginacion-query.dto';

@Injectable()
export class TestimoniosService {
  constructor(
    @InjectRepository(Testimonio)
    private readonly testimonioRepository: Repository<Testimonio>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
  ) {}

  async create(createTestimonioDto: CreateTestimonioDto) {
    const { empresaId, ...datosTestimonio } = createTestimonioDto;
    const empresa = await this.empresaRepository.findOneBy({ id: empresaId });
    if (!empresa) {
      throw new NotFoundException(`No existe una empresa con id ${empresaId}`);
    }
    const nuevoTestimonio = this.testimonioRepository.create({
      ...datosTestimonio,
      empresa,
    });
    return this.testimonioRepository.save(nuevoTestimonio);
  }

  async findAllPublico(paginacionQueryDto: PaginacionQueryDto) {
    const { pagina, limite } = paginacionQueryDto;
    const [data, total] = await this.testimonioRepository.findAndCount({
      where: { autorizado: true },
      relations: { empresa: true },
      order: { fechaCreacion: 'ASC' },
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

  async findAllAdmin(paginacionQueryDto: PaginacionQueryDto) {
    const { pagina, limite } = paginacionQueryDto;
    const [data, total] = await this.testimonioRepository.findAndCount({
      relations: { empresa: true },
      order: { fechaCreacion: 'ASC' },
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
    return this.testimonioRepository.findOne({
      where: { id },
      relations: { empresa: true },
    });
  }

  async update(id: number, updateTestimonioDto: UpdateTestimonioDto) {
    await this.testimonioRepository.update(id, updateTestimonioDto);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.testimonioRepository.delete(id);
  }
}