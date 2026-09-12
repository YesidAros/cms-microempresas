import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { AuthService } from './auth.service';
import { UsuarioService } from '../usuario/usuario.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { PasswordResetToken } from './entities/password-reset-token.entity';

jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let usuarioService: {
    findByEmailConPassword: jest.Mock;
    findByEmail: jest.Mock;
    findByIdConPassword: jest.Mock;
    actualizarPassword: jest.Mock;
  };
  let jwtService: { sign: jest.Mock };
  let notificacionesService: { enviarCorreo: jest.Mock };
  let configService: { get: jest.Mock };
  let passwordResetTokenRepository: {
    delete: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
  };

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
      findByEmail: jest.fn(),
      findByIdConPassword: jest.fn(),
      actualizarPassword: jest.fn(),
    };
    jwtService = {
      sign: jest.fn(),
    };
    notificacionesService = {
      enviarCorreo: jest.fn(),
    };
    configService = {
      get: jest.fn(),
    };
    passwordResetTokenRepository = {
      delete: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsuarioService, useValue: usuarioService },
        { provide: JwtService, useValue: jwtService },
        { provide: NotificacionesService, useValue: notificacionesService },
        { provide: ConfigService, useValue: configService },
        {
          provide: getRepositoryToken(PasswordResetToken),
          useValue: passwordResetTokenRepository,
        },
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

  describe('solicitarRecuperacion', () => {
    it('deberia devolver el mensaje generico y no hacer nada mas si el usuario no existe', async () => {
      usuarioService.findByEmail.mockResolvedValue(null);

      const resultado = await authService.solicitarRecuperacion(
        'no-existe@correo.com',
      );

      expect(resultado).toEqual({
        mensaje:
          'Si el correo existe en nuestro sistema, se enviaron instrucciones para restablecer la contraseña',
      });
      expect(passwordResetTokenRepository.create).not.toHaveBeenCalled();
      expect(passwordResetTokenRepository.save).not.toHaveBeenCalled();
      expect(notificacionesService.enviarCorreo).not.toHaveBeenCalled();
    });

    it('deberia generar el token, guardarlo y enviar el correo si el usuario existe', async () => {
      usuarioService.findByEmail.mockResolvedValue(usuarioDePrueba);
      passwordResetTokenRepository.delete.mockResolvedValue({ affected: 0 });
      passwordResetTokenRepository.create.mockImplementation((datos) => datos);
      passwordResetTokenRepository.save.mockResolvedValue({});
      configService.get.mockReturnValue('http://localhost:4200');

      const resultado = await authService.solicitarRecuperacion(
        usuarioDePrueba.email,
      );

      expect(passwordResetTokenRepository.delete).toHaveBeenCalledWith({
        usuario: { id: usuarioDePrueba.id },
        usado: false,
      });
      expect(passwordResetTokenRepository.create).toHaveBeenCalled();
      expect(passwordResetTokenRepository.save).toHaveBeenCalled();

      const [destinatario, asunto, html] =
        notificacionesService.enviarCorreo.mock.calls[0];
      expect(destinatario).toBe(usuarioDePrueba.email);
      expect(asunto).toBe('Recuperación de contraseña');
      expect(html).toContain(
        'http://localhost:4200/restablecer-password?token=',
      );

      expect(resultado).toEqual({
        mensaje:
          'Si el correo existe en nuestro sistema, se enviaron instrucciones para restablecer la contraseña',
      });
    });
  });

  describe('restablecerPassword', () => {
    it('deberia lanzar BadRequestException si el token no existe, ya se uso o expiro', async () => {
      passwordResetTokenRepository.findOne.mockResolvedValue(null);

      await expect(
        authService.restablecerPassword('token-invalido', 'nuevaClave123'),
      ).rejects.toThrow(BadRequestException);
      expect(usuarioService.actualizarPassword).not.toHaveBeenCalled();
    });

    it('deberia actualizar la contraseña y marcar el token como usado si es valido', async () => {
      const tokenPlano = 'token-de-prueba-en-texto-plano';
      const tokenHashEsperado = crypto
        .createHash('sha256')
        .update(tokenPlano)
        .digest('hex');

      const tokenGuardado = {
        id: 10,
        tokenHash: tokenHashEsperado,
        usado: false,
        usuario: { id: usuarioDePrueba.id },
      };

      passwordResetTokenRepository.findOne.mockResolvedValue(tokenGuardado);
      (bcrypt.hash as jest.Mock).mockResolvedValue('nuevo-hash-falso');
      passwordResetTokenRepository.save.mockResolvedValue({
        ...tokenGuardado,
        usado: true,
      });

      const resultado = await authService.restablecerPassword(
        tokenPlano,
        'nuevaClave123',
      );

      expect(passwordResetTokenRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tokenHash: tokenHashEsperado }),
        }),
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('nuevaClave123', 10);
      expect(usuarioService.actualizarPassword).toHaveBeenCalledWith(
        usuarioDePrueba.id,
        'nuevo-hash-falso',
      );
      expect(tokenGuardado.usado).toBe(true);
      expect(passwordResetTokenRepository.save).toHaveBeenCalledWith(
        tokenGuardado,
      );
      expect(resultado).toEqual({
        mensaje: 'Contraseña actualizada correctamente',
      });
    });
  });

  describe('cambiarPassword', () => {
    it('deberia lanzar UnauthorizedException si el usuario no existe', async () => {
      usuarioService.findByIdConPassword.mockResolvedValue(null);

      await expect(
        authService.cambiarPassword(999, 'cualquier-cosa', 'nuevaClave123'),
      ).rejects.toThrow(UnauthorizedException);
      expect(usuarioService.actualizarPassword).not.toHaveBeenCalled();
    });

    it('deberia lanzar UnauthorizedException si la contraseña actual es incorrecta', async () => {
      usuarioService.findByIdConPassword.mockResolvedValue(usuarioDePrueba);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.cambiarPassword(
          usuarioDePrueba.id,
          'password-incorrecto',
          'nuevaClave123',
        ),
      ).rejects.toThrow(UnauthorizedException);
      expect(usuarioService.actualizarPassword).not.toHaveBeenCalled();
    });

    it('deberia actualizar la contraseña si la contraseña actual es correcta', async () => {
      usuarioService.findByIdConPassword.mockResolvedValue(usuarioDePrueba);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('nuevo-hash-falso');

      const resultado = await authService.cambiarPassword(
        usuarioDePrueba.id,
        'password-correcto',
        'nuevaClave123',
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password-correcto',
        usuarioDePrueba.password,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('nuevaClave123', 10);
      expect(usuarioService.actualizarPassword).toHaveBeenCalledWith(
        usuarioDePrueba.id,
        'nuevo-hash-falso',
      );
      expect(resultado).toEqual({
        mensaje: 'Contraseña actualizada correctamente',
      });
    });
  });
});