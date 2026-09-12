import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientesService } from './clientes.service';
import { Cliente } from './entities/cliente.entity';
import { Empresa } from '../empresa/entities/empresa.entity';
import { ArchivosService } from '../archivos/archivos.service';

describe('ClientesService', () => {
  let clientesService: ClientesService;
  let clienteRepository: Partial<Record<keyof Repository<Cliente>, jest.Mock>>;
  let empresaRepository: Partial<Record<keyof Repository<Empresa>, jest.Mock>>;
  let archivosService: Partial<Record<keyof ArchivosService, jest.Mock>>;

  const empresaDePrueba = { id: 1, nombre: 'Mi Empresa' } as Empresa;

  beforeEach(async () => {
    clienteRepository = {
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
        ClientesService,
        { provide: getRepositoryToken(Cliente), useValue: clienteRepository },
        { provide: getRepositoryToken(Empresa), useValue: empresaRepository },
        { provide: ArchivosService, useValue: archivosService },
      ],
    }).compile();

    clientesService = module.get<ClientesService>(ClientesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const dtoDePrueba = {
      nombre: 'Cliente de prueba',
      empresaId: 1,
    };

    it('deberia lanzar NotFoundException si la empresa no existe', async () => {
      empresaRepository.findOneBy!.mockResolvedValue(null);

      await expect(
        clientesService.create(dtoDePrueba as any),
      ).rejects.toThrow(NotFoundException);
      expect(clienteRepository.save).not.toHaveBeenCalled();
    });

    it('deberia crear y guardar el cliente asociado a la empresa', async () => {
      empresaRepository.findOneBy!.mockResolvedValue(empresaDePrueba);
      const entidadCreada = {
        nombre: dtoDePrueba.nombre,
        empresa: empresaDePrueba,
      };
      const entidadGuardada = { id: 1, ...entidadCreada };
      clienteRepository.create!.mockReturnValue(entidadCreada);
      clienteRepository.save!.mockResolvedValue(entidadGuardada);

      const resultado = await clientesService.create(dtoDePrueba as any);

      expect(empresaRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(clienteRepository.create).toHaveBeenCalledWith({
        nombre: dtoDePrueba.nombre,
        empresa: empresaDePrueba,
      });
      expect(resultado).toEqual(entidadGuardada);
    });
  });

  describe('findAllPublico', () => {
    it('deberia devolver solo los clientes autorizados, paginados y ordenados por fecha', async () => {
      const listaDePrueba = [{ id: 1, autorizado: true }];
      clienteRepository.findAndCount!.mockResolvedValue([listaDePrueba, 1]);

      const resultado = await clientesService.findAllPublico({
        pagina: 1,
        limite: 10,
      });

      expect(clienteRepository.findAndCount).toHaveBeenCalledWith({
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
    it('deberia devolver todos los clientes sin filtrar por autorizado', async () => {
      const listaDePrueba = [
        { id: 1, autorizado: true },
        { id: 2, autorizado: false },
      ];
      clienteRepository.findAndCount!.mockResolvedValue([listaDePrueba, 2]);

      const resultado = await clientesService.findAllAdmin({
        pagina: 1,
        limite: 10,
      });

      expect(clienteRepository.findAndCount).toHaveBeenCalledWith({
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
    it('deberia devolver un cliente por id con su empresa', async () => {
      const clienteDePrueba = { id: 1, nombre: 'Cliente de prueba' };
      clienteRepository.findOne!.mockResolvedValue(clienteDePrueba);

      const resultado = await clientesService.findOne(1);

      expect(clienteRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { empresa: true },
      });
      expect(resultado).toEqual(clienteDePrueba);
    });
  });

  describe('update', () => {
    it('deberia actualizar el cliente y devolver la version actualizada', async () => {
      const dtoDePrueba = { autorizado: true };
      const clienteActualizado = { id: 1, ...dtoDePrueba };
      clienteRepository.update!.mockResolvedValue({ affected: 1 });
      clienteRepository.findOne!.mockResolvedValue(clienteActualizado);

      const resultado = await clientesService.update(1, dtoDePrueba as any);

      expect(clienteRepository.update).toHaveBeenCalledWith(1, dtoDePrueba);
      expect(resultado).toEqual(clienteActualizado);
    });
  });

  describe('actualizarLogo', () => {
    it('deberia construir la url del logo, actualizarlo y devolver el cliente', async () => {
      const urlEsperada = 'http://localhost:3000/uploads/clientes/abc.png';
      const clienteActualizado = { id: 1, logoUrl: urlEsperada };
      archivosService.construirUrlPublica!.mockReturnValue(urlEsperada);
      clienteRepository.update!.mockResolvedValue({ affected: 1 });
      clienteRepository.findOne!.mockResolvedValue(clienteActualizado);

      const resultado = await clientesService.actualizarLogo(1, 'abc.png');

      expect(archivosService.construirUrlPublica).toHaveBeenCalledWith(
        'clientes',
        'abc.png',
      );
      expect(clienteRepository.update).toHaveBeenCalledWith(1, {
        logoUrl: urlEsperada,
      });
      expect(resultado).toEqual(clienteActualizado);
    });
  });

  describe('remove', () => {
    it('deberia eliminar el cliente por id', async () => {
      clienteRepository.delete!.mockResolvedValue({ affected: 1 });

      const resultado = await clientesService.remove(1);

      expect(clienteRepository.delete).toHaveBeenCalledWith(1);
      expect(resultado).toEqual({ affected: 1 });
    });
  });
});