import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Noticia } from './entities/noticia.entity';
import { Empresa } from '../empresa/entities/empresa.entity';
import { CreateNoticiaDto } from './dto/create-noticia.dto';
import { UpdateNoticiaDto } from './dto/update-noticia.dto';

@Injectable()
export class NoticiasService {
  constructor(
    @InjectRepository(Noticia)
    private readonly noticiaRepository: Repository<Noticia>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
  ) {}

  async create(createNoticiaDto: CreateNoticiaDto) {
    const { empresaId, ...datosNoticia } = createNoticiaDto;
    const empresa = await this.empresaRepository.findOneBy({ id: empresaId });
    if (!empresa) {
      throw new NotFoundException(`No existe una empresa con id ${empresaId}`);
    }
    const nuevaNoticia = this.noticiaRepository.create({
      ...datosNoticia,
      empresa,
    });
    return this.noticiaRepository.save(nuevaNoticia);
  }

  findAll() {
    return this.noticiaRepository.find({ relations: { empresa: true } });
  }

  findOne(id: number) {
    return this.noticiaRepository.findOne({
      where: { id },
      relations: { empresa: true },
    });
  }

  async update(id: number, updateNoticiaDto: UpdateNoticiaDto) {
    await this.noticiaRepository.update(id, updateNoticiaDto);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.noticiaRepository.delete(id);
  }
}