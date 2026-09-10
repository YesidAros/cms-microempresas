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
      findOne: jest.fn(),
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
    it('deberia devolver la lista de usuarios con su empresa', async () => {
      const listaDePrueba = [{ id: 1, email: 'a@a.com' }];
      usuarioRepository.find!.mockResolvedValue(listaDePrueba);

      const resultado = await usuarioService.findAll();

      expect(usuarioRepository.find).toHaveBeenCalledWith({
        relations: { empresa: true },
      });
      expect(resultado).toEqual(listaDePrueba);
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

  describe('remove', () => {
    it('deberia eliminar el usuario por id', async () => {
      usuarioRepository.delete!.mockResolvedValue({ affected: 1, raw: {} });

      const resultado = await usuarioService.remove(1);

      expect(usuarioRepository.delete).toHaveBeenCalledWith(1);
      expect(resultado).toEqual({ affected: 1, raw: {} });
    });
  });
});