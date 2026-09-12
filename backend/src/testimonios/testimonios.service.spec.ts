import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestimoniosService } from './testimonios.service';
import { Testimonio } from './entities/testimonio.entity';
import { Empresa } from '../empresa/entities/empresa.entity';

describe('TestimoniosService', () => {
  let testimoniosService: TestimoniosService;
  let testimonioRepository: Partial<Record<keyof Repository<Testimonio>, jest.Mock>>;
  let empresaRepository: Partial<Record<keyof Repository<Empresa>, jest.Mock>>;

  const empresaDePrueba = { id: 1, nombre: 'Mi Empresa' } as Empresa;

  beforeEach(async () => {
    testimonioRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    empresaRepository = {
      findOneBy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestimoniosService,
        {
          provide: getRepositoryToken(Testimonio),
          useValue: testimonioRepository,
        },
        { provide: getRepositoryToken(Empresa), useValue: empresaRepository },
      ],
    }).compile();

    testimoniosService = module.get<TestimoniosService>(TestimoniosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const dtoDePrueba = {
      nombreAutor: 'Juan Pérez',
      cargoOEmpresa: 'Gerente de Empresa X',
      texto: 'Excelente servicio.',
      empresaId: 1,
    };

    it('deberia lanzar NotFoundException si la empresa no existe', async () => {
      empresaRepository.findOneBy!.mockResolvedValue(null);

      await expect(
        testimoniosService.create(dtoDePrueba as any),
      ).rejects.toThrow(NotFoundException);
      expect(testimonioRepository.save).not.toHaveBeenCalled();
    });

    it('deberia crear y guardar el testimonio asociado a la empresa', async () => {
      empresaRepository.findOneBy!.mockResolvedValue(empresaDePrueba);
      const entidadCreada = {
        nombreAutor: dtoDePrueba.nombreAutor,
        cargoOEmpresa: dtoDePrueba.cargoOEmpresa,
        texto: dtoDePrueba.texto,
        empresa: empresaDePrueba,
      };
      const entidadGuardada = { id: 1, ...entidadCreada };
      testimonioRepository.create!.mockReturnValue(entidadCreada);
      testimonioRepository.save!.mockResolvedValue(entidadGuardada);

      const resultado = await testimoniosService.create(dtoDePrueba as any);

      expect(empresaRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(testimonioRepository.create).toHaveBeenCalledWith({
        nombreAutor: dtoDePrueba.nombreAutor,
        cargoOEmpresa: dtoDePrueba.cargoOEmpresa,
        texto: dtoDePrueba.texto,
        empresa: empresaDePrueba,
      });
      expect(resultado).toEqual(entidadGuardada);
    });
  });

  describe('findAllPublico', () => {
    it('deberia devolver solo los testimonios autorizados, paginados y ordenados por fecha', async () => {
      const listaDePrueba = [{ id: 1, autorizado: true }];
      testimonioRepository.findAndCount!.mockResolvedValue([listaDePrueba, 1]);

      const resultado = await testimoniosService.findAllPublico({
        pagina: 1,
        limite: 10,
      });

      expect(testimonioRepository.findAndCount).toHaveBeenCalledWith({
        where: { autorizado: true },
        relations: { empresa: true },
        order: { fechaCreacion: 'ASC' },
        skip: 0,
        take: 10,
      });
      expect(resultado).toEqual({
        data: listaDePrueba,
        total: 1,
        pagina: 1,
        limite: 10,
        totalPaginas: 1,
      });
    });
  });

  describe('findAllAdmin', () => {
    it('deberia devolver todos los testimonios sin filtrar por autorizado', async () => {
      const listaDePrueba = [
        { id: 1, autorizado: true },
        { id: 2, autorizado: false },
      ];
      testimonioRepository.findAndCount!.mockResolvedValue([listaDePrueba, 2]);

      const resultado = await testimoniosService.findAllAdmin({
        pagina: 1,
        limite: 10,
      });

      expect(testimonioRepository.findAndCount).toHaveBeenCalledWith({
        relations: { empresa: true },
        order: { fechaCreacion: 'ASC' },
        skip: 0,
        take: 10,
      });
      expect(resultado).toEqual({
        data: listaDePrueba,
        total: 2,
        pagina: 1,
        limite: 10,
        totalPaginas: 1,
      });
    });
  });

  describe('findOne', () => {
    it('deberia devolver un testimonio por id con su empresa', async () => {
      const testimonioDePrueba = { id: 1, nombreAutor: 'Juan Pérez' };
      testimonioRepository.findOne!.mockResolvedValue(testimonioDePrueba);

      const resultado = await testimoniosService.findOne(1);

      expect(testimonioRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { empresa: true },
      });
      expect(resultado).toEqual(testimonioDePrueba);
    });
  });

  describe('update', () => {
    it('deberia actualizar el testimonio y devolver la version actualizada', async () => {
      const dtoDePrueba = { autorizado: true };
      const testimonioActualizado = { id: 1, ...dtoDePrueba };
      testimonioRepository.update!.mockResolvedValue({ affected: 1 });
      testimonioRepository.findOne!.mockResolvedValue(testimonioActualizado);

      const resultado = await testimoniosService.update(
        1,
        dtoDePrueba as any,
      );

      expect(testimonioRepository.update).toHaveBeenCalledWith(
        1,
        dtoDePrueba,
      );
      expect(resultado).toEqual(testimonioActualizado);
    });
  });

  describe('remove', () => {
    it('deberia eliminar el testimonio por id', async () => {
      testimonioRepository.delete!.mockResolvedValue({ affected: 1 });

      const resultado = await testimoniosService.remove(1);

      expect(testimonioRepository.delete).toHaveBeenCalledWith(1);
      expect(resultado).toEqual({ affected: 1 });
    });
  });
});