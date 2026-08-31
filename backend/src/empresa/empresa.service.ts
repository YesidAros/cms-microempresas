import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa } from './entities/empresa.entity';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';

@Injectable()
export class EmpresaService {
  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
  ) {}

  create(createEmpresaDto: CreateEmpresaDto) {
    const nuevaEmpresa = this.empresaRepository.create(createEmpresaDto);
    return this.empresaRepository.save(nuevaEmpresa);
  }

  findAll() {
    return this.empresaRepository.find();
  }

  findOne(id: number) {
    return this.empresaRepository.findOneBy({ id });
  }

  async update(id: number, updateEmpresaDto: UpdateEmpresaDto) {
    await this.empresaRepository.update(id, updateEmpresaDto);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.empresaRepository.delete(id);
  }
}