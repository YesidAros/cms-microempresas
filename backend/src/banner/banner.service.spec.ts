import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BannerService } from './banner.service';
import { Banner } from './entities/banner.entity';
import { Empresa } from '../empresa/entities/empresa.entity';
import { ArchivosService } from '../archivos/archivos.service';

describe('BannerService', () => {
  let bannerService: BannerService;
  let bannerRepository: Partial<Record<keyof Repository<Banner>, jest.Mock>>;
  let empresaRepository: Partial<Record<keyof Repository<Empresa>, jest.Mock>>;
  let archivosService: Partial<Record<keyof ArchivosService, jest.Mock>>;

  const empresaDePrueba = { id: 1, nombre: 'Mi Empresa' } as Empresa;

  beforeEach(async () => {
    bannerRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    empresaRepository = {
      findOneBy: jest.fn(),
    };
    archivosService = {
      construirUrlPublica: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BannerService,
        { provide: getRepositoryToken(Banner), useValue: bannerRepository },
        { provide: getRepositoryToken(Empresa), useValue: empresaRepository },
        { provide: ArchivosService, useValue: archivosService },
      ],
    }).compile();

    bannerService = module.get<BannerService>(BannerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const dtoDePrueba = {
      titulo: 'Banner de prueba',
      empresaId: 1,
    };

    it('deberia lanzar NotFoundException si la empresa no existe', async () => {
      empresaRepository.findOneBy!.mockResolvedValue(null);

      await expect(bannerService.create(dtoDePrueba as any)).rejects.toThrow(
        NotFoundException,
      );
      expect(bannerRepository.save).not.toHaveBeenCalled();
    });

    it('deberia crear y guardar el banner asociado a la empresa', async () => {
      empresaRepository.findOneBy!.mockResolvedValue(empresaDePrueba);
      const entidadCreada = {
        titulo: dtoDePrueba.titulo,
        empresa: empresaDePrueba,
      };
      const entidadGuardada = { id: 1, ...entidadCreada };
      bannerRepository.create!.mockReturnValue(entidadCreada);
      bannerRepository.save!.mockResolvedValue(entidadGuardada);

      const resultado = await bannerService.create(dtoDePrueba as any);

      expect(empresaRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(bannerRepository.create).toHaveBeenCalledWith({
        titulo: dtoDePrueba.titulo,
        empresa: empresaDePrueba,
      });
      expect(resultado).toEqual(entidadGuardada);
    });
  });

  describe('findAll', () => {
    it('deberia devolver la lista de banners con su empresa', async () => {
      const listaDePrueba = [{ id: 1 }, { id: 2 }];
      bannerRepository.find!.mockResolvedValue(listaDePrueba);

      const resultado = await bannerService.findAll();

      expect(bannerRepository.find).toHaveBeenCalledWith({
        relations: { empresa: true },
      });
      expect(resultado).toEqual(listaDePrueba);
    });
  });

  describe('findOne', () => {
    it('deberia devolver un banner por id con su empresa', async () => {
      const bannerDePrueba = { id: 1, titulo: 'Banner de prueba' };
      bannerRepository.findOne!.mockResolvedValue(bannerDePrueba);

      const resultado = await bannerService.findOne(1);

      expect(bannerRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { empresa: true },
      });
      expect(resultado).toEqual(bannerDePrueba);
    });
  });

  describe('update', () => {
    it('deberia actualizar el banner y devolver la version actualizada', async () => {
      const dtoDePrueba = { titulo: 'Titulo Actualizado' };
      const bannerActualizado = { id: 1, ...dtoDePrueba };
      bannerRepository.update!.mockResolvedValue({ affected: 1 });
      bannerRepository.findOne!.mockResolvedValue(bannerActualizado);

      const resultado = await bannerService.update(1, dtoDePrueba as any);

      expect(bannerRepository.update).toHaveBeenCalledWith(1, dtoDePrueba);
      expect(resultado).toEqual(bannerActualizado);
    });
  });

  describe('actualizarImagen', () => {
    it('deberia construir la url de la imagen, actualizarla y devolver el banner', async () => {
      const urlEsperada = 'http://localhost:3000/uploads/banners/abc.png';
      const bannerActualizado = { id: 1, imagenUrl: urlEsperada };
      archivosService.construirUrlPublica!.mockReturnValue(urlEsperada);
      bannerRepository.update!.mockResolvedValue({ affected: 1 });
      bannerRepository.findOne!.mockResolvedValue(bannerActualizado);

      const resultado = await bannerService.actualizarImagen(1, 'abc.png');

      expect(archivosService.construirUrlPublica).toHaveBeenCalledWith(
        'banners',
        'abc.png',
      );
      expect(bannerRepository.update).toHaveBeenCalledWith(1, {
        imagenUrl: urlEsperada,
      });
      expect(resultado).toEqual(bannerActualizado);
    });
  });

  describe('remove', () => {
    it('deberia eliminar el banner por id', async () => {
      bannerRepository.delete!.mockResolvedValue({ affected: 1 });

      const resultado = await bannerService.remove(1);

      expect(bannerRepository.delete).toHaveBeenCalledWith(1);
      expect(resultado).toEqual({ affected: 1 });
    });
  });
});