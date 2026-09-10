import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsuarioService } from '../usuario/usuario.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let usuarioService: { findByEmailConPassword: jest.Mock };
  let jwtService: { sign: jest.Mock };

  const usuarioDePrueba = {
    id: 1,
    email: 'admin@miempresa.com',
    password: 'hash-falso',
    nombre: 'Admin',
    rol: 'admin',
  };

  beforeEach(async () => {
    usuarioService = {
      findByEmailConPassword: jest.fn(),
    };
    jwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsuarioService, useValue: usuarioService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUsuario', () => {
    it('deberia lanzar UnauthorizedException si el usuario no existe', async () => {
      usuarioService.findByEmailConPassword.mockResolvedValue(null);

      await expect(
        authService.validateUsuario('no-existe@correo.com', 'cualquier-cosa'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deberia lanzar UnauthorizedException si la contraseña es incorrecta', async () => {
      usuarioService.findByEmailConPassword.mockResolvedValue(usuarioDePrueba);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.validateUsuario(usuarioDePrueba.email, 'password-incorrecto'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deberia devolver el usuario sin el password si las credenciales son correctas', async () => {
      usuarioService.findByEmailConPassword.mockResolvedValue(usuarioDePrueba);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const resultado = await authService.validateUsuario(
        usuarioDePrueba.email,
        'password-correcto',
      );

      expect(resultado).toEqual({
        id: usuarioDePrueba.id,
        email: usuarioDePrueba.email,
        nombre: usuarioDePrueba.nombre,
        rol: usuarioDePrueba.rol,
      });
      expect(resultado).not.toHaveProperty('password');
    });
  });

  describe('login', () => {
    it('deberia devolver un access_token cuando las credenciales son correctas', async () => {
      usuarioService.findByEmailConPassword.mockResolvedValue(usuarioDePrueba);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('token-falso-de-prueba');

      const resultado = await authService.login(
        usuarioDePrueba.email,
        'password-correcto',
      );

      expect(resultado).toEqual({ access_token: 'token-falso-de-prueba' });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: usuarioDePrueba.id,
        email: usuarioDePrueba.email,
        rol: usuarioDePrueba.rol,
      });
    });
  });
});