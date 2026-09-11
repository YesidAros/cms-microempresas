import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiciosService } from './servicios.service';
import { Servicio } from './entities/servicio.entity';
import { Empresa } from '../empresa/entities/empresa.entity';
import { ArchivosService } from '../archivos/archivos.service';

describe('ServiciosService', () => {
  let serviciosService: ServiciosService;
  let servicioRepository: Partial<Record<keyof Repository<Servicio>, jest.Mock>>;
  let empresaRepository: Partial<Record<keyof Repository<Empresa>, jest.Mock>>;
  let archivosService: Partial<Record<keyof ArchivosService, jest.Mock>>;

  const empresaDePrueba = { id: 1, nombre: 'Mi Empresa' } as Empresa;

  beforeEach(async () => {
    servicioRepository = {
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
    archivosService = {
      construirUrlPublica: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiciosService,
        { provide: getRepositoryToken(Servicio), useValue: servicioRepository },
        { provide: getRepositoryToken(Empresa), useValue: empresaRepository },
        { provide: ArchivosService, useValue: archivosService },
      ],
    }).compile();

    serviciosService = module.get<ServiciosService>(ServiciosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const dtoDePrueba = {
      nombre: 'Servicio de prueba',
      descripcion: 'Descripcion de prueba',
      empresaId: 1,
    };

    it('deberia lanzar NotFoundException si la empresa no existe', async () => {
      empresaRepository.findOneBy!.mockResolvedValue(null);

      await expect(
        serviciosService.create(dtoDePrueba as any),
      ).rejects.toThrow(NotFoundException);
      expect(servicioRepository.save).not.toHaveBeenCalled();
    });

    it('deberia crear y guardar el servicio asociado a la empresa', async () => {
      empresaRepository.findOneBy!.mockResolvedValue(empresaDePrueba);
      const entidadCreada = {
        nombre: dtoDePrueba.nombre,
        descripcion: dtoDePrueba.descripcion,
        empresa: empresaDePrueba,
      };
      const entidadGuardada = { id: 1, ...entidadCreada };
      servicioRepository.create!.mockReturnValue(entidadCreada);
      servicioRepository.save!.mockResolvedValue(entidadGuardada);

      const resultado = await serviciosService.create(dtoDePrueba as any);

      expect(empresaRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(servicioRepository.create).toHaveBeenCalledWith({
        nombre: dtoDePrueba.nombre,
        descripcion: dtoDePrueba.descripcion,
        empresa: empresaDePrueba,
      });
      expect(resultado).toEqual(entidadGuardada);
    });
  });

  describe('findAll', () => {
    it('deberia devolver los servicios paginados con su empresa', async () => {
      const listaDePrueba = [{ id: 1 }, { id: 2 }];
      servicioRepository.findAndCount!.mockResolvedValue([listaDePrueba, 2]);

      const resultado = await serviciosService.findAll({
        pagina: 1,
        limite: 10,
      });

      expect(servicioRepository.findAndCount).toHaveBeenCalledWith({
        relations: { empresa: true },
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

    it('deberia calcular correctamente el skip para paginas mayores a 1', async () => {
      servicioRepository.findAndCount!.mockResolvedValue([[], 5]);

      await serviciosService.findAll({ pagina: 2, limite: 2 });

      expect(servicioRepository.findAndCount).toHaveBeenCalledWith({
        relations: { empresa: true },
        skip: 2,
        take: 2,
      });
    });
  });

  describe('findOne', () => {
    it('deberia devolver un servicio por id con su empresa', async () => {
      const servicioDePrueba = { id: 1, nombre: 'Servicio de prueba' };
      servicioRepository.findOne!.mockResolvedValue(servicioDePrueba);

      const resultado = await serviciosService.findOne(1);

      expect(servicioRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { empresa: true },
      });
      expect(resultado).toEqual(servicioDePrueba);
    });
  });

  describe('update', () => {
    it('deberia actualizar el servicio y devolver la version actualizada', async () => {
      const dtoDePrueba = { nombre: 'Nombre Actualizado' };
      const servicioActualizado = { id: 1, ...dtoDePrueba };
      servicioRepository.update!.mockResolvedValue({ affected: 1 });
      servicioRepository.findOne!.mockResolvedValue(servicioActualizado);

      const resultado = await serviciosService.update(1, dtoDePrueba as any);

      expect(servicioRepository.update).toHaveBeenCalledWith(1, dtoDePrueba);
      expect(resultado).toEqual(servicioActualizado);
    });
  });

  describe('actualizarImagen', () => {
    it('deberia construir la url de la imagen, actualizarla y devolver el servicio', async () => {
      const urlEsperada = 'http://localhost:3000/uploads/servicios/abc.png';
      const servicioActualizado = { id: 1, imagenUrl: urlEsperada };
      archivosService.construirUrlPublica!.mockReturnValue(urlEsperada);
      servicioRepository.update!.mockResolvedValue({ affected: 1 });
      servicioRepository.findOne!.mockResolvedValue(servicioActualizado);

      const resultado = await serviciosService.actualizarImagen(1, 'abc.png');

      expect(archivosService.construirUrlPublica).toHaveBeenCalledWith(
        'servicios',
        'abc.png',
      );
      expect(servicioRepository.update).toHaveBeenCalledWith(1, {
        imagenUrl: urlEsperada,
      });
      expect(resultado).toEqual(servicioActualizado);
    });
  });

  describe('remove', () => {
    it('deberia eliminar el servicio por id', async () => {
      servicioRepository.delete!.mockResolvedValue({ affected: 1 });

      const resultado = await serviciosService.remove(1);

      expect(servicioRepository.delete).toHaveBeenCalledWith(1);
      expect(resultado).toEqual({ affected: 1 });
    });
  });
});