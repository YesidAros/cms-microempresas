import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from './entities/banner.entity';
import { Empresa } from '../empresa/entities/empresa.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { ArchivosService } from '../archivos/archivos.service';
import { PaginacionQueryDto } from '../shared/dto/paginacion-query.dto';

@Injectable()
export class BannerService {
  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepository: Repository<Banner>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    private readonly archivosService: ArchivosService,
  ) {}

  async create(createBannerDto: CreateBannerDto) {
    const { empresaId, ...datosBanner } = createBannerDto;
    const empresa = await this.empresaRepository.findOneBy({ id: empresaId });
    if (!empresa) {
      throw new NotFoundException(`No existe una empresa con id ${empresaId}`);
    }
    const nuevoBanner = this.bannerRepository.create({
      ...datosBanner,
      empresa,
    });
    return this.bannerRepository.save(nuevoBanner);
  }

  async findAll(paginacionQueryDto: PaginacionQueryDto) {
    const { pagina, limite } = paginacionQueryDto;
    const [data, total] = await this.bannerRepository.findAndCount({
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
    return this.bannerRepository.findOne({
      where: { id },
      relations: { empresa: true },
    });
  }

  async update(id: number, updateBannerDto: UpdateBannerDto) {
    await this.bannerRepository.update(id, updateBannerDto);
    return this.findOne(id);
  }

  async actualizarImagen(id: number, nombreArchivo: string) {
    const imagenUrl = this.archivosService.construirUrlPublica(
      'banners',
      nombreArchivo,
    );
    await this.bannerRepository.update(id, { imagenUrl });
    return this.findOne(id);
  }

  remove(id: number) {
    return this.bannerRepository.delete(id);
  }
}