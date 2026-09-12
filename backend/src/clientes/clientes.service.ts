import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { Empresa } from '../empresa/entities/empresa.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { ArchivosService } from '../archivos/archivos.service';
import { PaginacionQueryDto } from '../shared/dto/paginacion-query.dto';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    private readonly archivosService: ArchivosService,
  ) {}

  async create(createClienteDto: CreateClienteDto) {
    const { empresaId, ...datosCliente } = createClienteDto;
    const empresa = await this.empresaRepository.findOneBy({ id: empresaId });
    if (!empresa) {
      throw new NotFoundException(`No existe una empresa con id ${empresaId}`);
    }
    const nuevoCliente = this.clienteRepository.create({
      ...datosCliente,
      empresa,
    });
    return this.clienteRepository.save(nuevoCliente);
  }

  async findAllPublico(paginacionQueryDto: PaginacionQueryDto) {
    const { pagina, limite } = paginacionQueryDto;
    const [data, total] = await this.clienteRepository.findAndCount({
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
    const [data, total] = await this.clienteRepository.findAndCount({
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
    return this.clienteRepository.findOne({
      where: { id },
      relations: { empresa: true },
    });
  }

  async update(id: number, updateClienteDto: UpdateClienteDto) {
    await this.clienteRepository.update(id, updateClienteDto);
    return this.findOne(id);
  }

  async actualizarLogo(id: number, nombreArchivo: string) {
    const logoUrl = this.archivosService.construirUrlPublica(
      'clientes',
      nombreArchivo,
    );
    await this.clienteRepository.update(id, { logoUrl });
    return this.findOne(id);
  }

  remove(id: number) {
    return this.clienteRepository.delete(id);
  }
}