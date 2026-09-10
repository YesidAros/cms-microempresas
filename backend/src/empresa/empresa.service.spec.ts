import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmpresaService } from './empresa.service';
import { Empresa } from './entities/empresa.entity';
import { ArchivosService } from '../archivos/archivos.service';

describe('EmpresaService', () => {
  let empresaService: EmpresaService;
  let empresaRepository: Partial<Record<keyof Repository<Empresa>, jest.Mock>>;
  let archivosService: Partial<Record<keyof ArchivosService, jest.Mock>>;

  beforeEach(async () => {
    empresaRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOneBy: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    archivosService = {
      construirUrlPublica: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmpresaService,
        { provide: getRepositoryToken(Empresa), useValue: empresaRepository },
        { provide: ArchivosService, useValue: archivosService },
      ],
    }).compile();

    empresaService = module.get<EmpresaService>(EmpresaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deberia crear y guardar la empresa', async () => {
      const dtoDePrueba = { nombre: 'Mi Empresa' };
      const entidadCreada = { ...dtoDePrueba };
      const entidadGuardada = { id: 1, ...dtoDePrueba };
      empresaRepository.create!.mockReturnValue(entidadCreada);
      empresaRepository.save!.mockResolvedValue(entidadGuardada);

      const resultado = await empresaService.create(dtoDePrueba as any);

      expect(empresaRepository.create).toHaveBeenCalledWith(dtoDePrueba);
      expect(empresaRepository.save).toHaveBeenCalledWith(entidadCreada);
      expect(resultado).toEqual(entidadGuardada);
    });
  });

  describe('findAll', () => {
    it('deberia devolver la lista de empresas', async () => {
      const listaDePrueba = [{ id: 1 }, { id: 2 }];
      empresaRepository.find!.mockResolvedValue(listaDePrueba);

      const resultado = await empresaService.findAll();

      expect(resultado).toEqual(listaDePrueba);
    });
  });

  describe('findOne', () => {
    it('deberia devolver una empresa por id', async () => {
      const empresaDePrueba = { id: 1, nombre: 'Mi Empresa' };
      empresaRepository.findOneBy!.mockResolvedValue(empresaDePrueba);

      const resultado = await empresaService.findOne(1);

      expect(empresaRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(resultado).toEqual(empresaDePrueba);
    });
  });

  describe('update', () => {
    it('deberia actualizar la empresa y devolver la version actualizada', async () => {
      const dtoDePrueba = { nombre: 'Nombre Actualizado' };
      const empresaActualizada = { id: 1, ...dtoDePrueba };
      empresaRepository.update!.mockResolvedValue({ affected: 1 });
      empresaRepository.findOneBy!.mockResolvedValue(empresaActualizada);

      const resultado = await empresaService.update(1, dtoDePrueba as any);

      expect(empresaRepository.update).toHaveBeenCalledWith(1, dtoDePrueba);
      expect(resultado).toEqual(empresaActualizada);
    });
  });

  describe('actualizarLogo', () => {
    it('deberia construir la url del logo, actualizarla y devolver la empresa', async () => {
      const urlEsperada = 'http://localhost:3000/uploads/logos/abc.png';
      const empresaActualizada = { id: 1, logoUrl: urlEsperada };
      archivosService.construirUrlPublica!.mockReturnValue(urlEsperada);
      empresaRepository.update!.mockResolvedValue({ affected: 1 });
      empresaRepository.findOneBy!.mockResolvedValue(empresaActualizada);

      const resultado = await empresaService.actualizarLogo(1, 'abc.png');

      expect(archivosService.construirUrlPublica).toHaveBeenCalledWith(
        'logos',
        'abc.png',
      );
      expect(empresaRepository.update).toHaveBeenCalledWith(1, {
        logoUrl: urlEsperada,
      });
      expect(resultado).toEqual(empresaActualizada);
    });
  });

  describe('remove', () => {
    it('deberia eliminar la empresa por id', async () => {
      empresaRepository.delete!.mockResolvedValue({ affected: 1 });

      const resultado = await empresaService.remove(1);

      expect(empresaRepository.delete).toHaveBeenCalledWith(1);
      expect(resultado).toEqual({ affected: 1 });
    });
  });
});