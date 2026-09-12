import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsuarioService } from './usuario.service';
import { Usuario } from './entities/usuario.entity';
import { Empresa } from '../empresa/entities/empresa.entity';

jest.mock('bcrypt');

describe('UsuarioService', () => {
  let usuarioService: UsuarioService;
  let usuarioRepository: Partial<Record<keyof Repository<Usuario>, jest.Mock>>;
  let empresaRepository: Partial<Record<keyof Repository<Empresa>, jest.Mock>>;

  const empresaDePrueba = { id: 1, nombre: 'Mi Empresa' } as Empresa;

  beforeEach(async () => {
    usuarioRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    empresaRepository = {
      findOneBy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuarioService,
        { provide: getRepositoryToken(Usuario), useValue: usuarioRepository },
        { provide: getRepositoryToken(Empresa), useValue: empresaRepository },
      ],
    }).compile();

    usuarioService = module.get<UsuarioService>(UsuarioService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const dtoDePrueba = {
      email: 'nuevo@miempresa.com',
      password: 'clave123',
      nombre: 'Nuevo Usuario',
      empresaId: 1,
    };

    it('deberia lanzar NotFoundException si la empresa no existe', async () => {
      empresaRepository.findOneBy!.mockResolvedValue(null);

      await expect(usuarioService.create(dtoDePrueba as any)).rejects.toThrow(
        NotFoundException,
      );
      expect(usuarioRepository.save).not.toHaveBeenCalled();
    });

    it('deberia crear el usuario y devolverlo sin el password si todo es correcto', async () => {
      empresaRepository.findOneBy!.mockResolvedValue(empresaDePrueba);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hash-falso');
      usuarioRepository.create!.mockReturnValue({
        email: dtoDePrueba.email,
        password: 'hash-falso',
        nombre: dtoDePrueba.nombre,
        empresa: empresaDePrueba,
      });
      usuarioRepository.save!.mockResolvedValue({
        id: 5,
        email: dtoDePrueba.email,
        password: 'hash-falso',
        nombre: dtoDePrueba.nombre,
        rol: 'admin',
        empresa: empresaDePrueba,
      });

      const resultado = await usuarioService.create(dtoDePrueba as any);

      expect(bcrypt.hash).toHaveBeenCalledWith(dtoDePrueba.password, 10);
      expect(resultado).not.toHaveProperty('password');
      expect(resultado).toMatchObject({ id: 5, email: dtoDePrueba.email });
    });

    it('deberia lanzar ConflictException si el email ya existe', async () => {
      empresaRepository.findOneBy!.mockResolvedValue(empresaDePrueba);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hash-falso');
      usuarioRepository.create!.mockReturnValue({});
      usuarioRepository.save!.mockRejectedValue({ code: '23505' });

      await expect(usuarioService.create(dtoDePrueba as any)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('deberia devolver los usuarios paginados con su empresa', async () => {
      const listaDePrueba = [{ id: 1 }, { id: 2 }];
      usuarioRepository.findAndCount!.mockResolvedValue([listaDePrueba, 2]);

      const resultado = await usuarioService.findAll({
        pagina: 1,
        limite: 10,
      });

      expect(usuarioRepository.findAndCount).toHaveBeenCalledWith({
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
      usuarioRepository.findAndCount!.mockResolvedValue([[], 5]);

      await usuarioService.findAll({ pagina: 2, limite: 2 });

      expect(usuarioRepository.findAndCount).toHaveBeenCalledWith({
        relations: { empresa: true },
        skip: 2,
        take: 2,
      });
    });
  });

  describe('findOne', () => {
    it('deberia devolver un usuario por id con su empresa', async () => {
      const usuarioDePrueba = { id: 1, email: 'a@a.com' };
      usuarioRepository.findOne!.mockResolvedValue(usuarioDePrueba);

      const resultado = await usuarioService.findOne(1);

      expect(usuarioRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { empresa: true },
      });
      expect(resultado).toEqual(usuarioDePrueba);
    });
  });

  describe('findByEmailConPassword', () => {
    it('deberia devolver el usuario incluyendo el password', async () => {
      const usuarioDePrueba = {
        id: 1,
        email: 'a@a.com',
        password: 'hash-falso',
      };
      usuarioRepository.findOne!.mockResolvedValue(usuarioDePrueba);

      const resultado =
        await usuarioService.findByEmailConPassword('a@a.com');

      expect(usuarioRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'a@a.com' },
        select: {
          id: true,
          email: true,
          password: true,
          nombre: true,
          rol: true,
        },
      });
      expect(resultado).toEqual(usuarioDePrueba);
    });
  });

  describe('findByIdConPassword', () => {
    it('deberia devolver el usuario por id incluyendo el password', async () => {
      const usuarioDePrueba = {
        id: 1,
        email: 'a@a.com',
        password: 'hash-falso',
      };
      usuarioRepository.findOne!.mockResolvedValue(usuarioDePrueba);

      const resultado = await usuarioService.findByIdConPassword(1);

      expect(usuarioRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        select: {
          id: true,
          email: true,
          password: true,
          nombre: true,
          rol: true,
        },
      });
      expect(resultado).toEqual(usuarioDePrueba);
    });
  });

  describe('findByEmail', () => {
    it('deberia devolver el usuario por email', async () => {
      const usuarioDePrueba = { id: 1, email: 'a@a.com', nombre: 'A' };
      usuarioRepository.findOneBy!.mockResolvedValue(usuarioDePrueba);

      const resultado = await usuarioService.findByEmail('a@a.com');

      expect(usuarioRepository.findOneBy).toHaveBeenCalledWith({
        email: 'a@a.com',
      });
      expect(resultado).toEqual(usuarioDePrueba);
    });

    it('deberia devolver null si no existe un usuario con ese email', async () => {
      usuarioRepository.findOneBy!.mockResolvedValue(null);

      const resultado = await usuarioService.findByEmail('no-existe@a.com');

      expect(resultado).toBeNull();
    });
  });

  describe('actualizarPassword', () => {
    it('deberia actualizar el password del usuario por id', async () => {
      usuarioRepository.update!.mockResolvedValue({ affected: 1 });

      await usuarioService.actualizarPassword(1, 'nuevo-hash');

      expect(usuarioRepository.update).toHaveBeenCalledWith(1, {
        password: 'nuevo-hash',
      });
    });
  });

  describe('remove', () => {
    it('deberia eliminar el usuario por id', async () => {
      usuarioRepository.delete!.mockResolvedValue({ affected: 1, raw: {} });

      const resultado = await usuarioService.remove(1);

      expect(usuarioRepository.delete).toHaveBeenCalledWith(1);
      expect(resultado).toEqual({ affected: 1, raw: {} });
    });
  });
});