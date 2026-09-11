import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: {
    login: jest.Mock;
    solicitarRecuperacion: jest.Mock;
    restablecerPassword: jest.Mock;
  };

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
      solicitarRecuperacion: jest.fn(),
      restablecerPassword: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    authController = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('deberia delegar en authService.login con el email y password del dto', async () => {
      authService.login.mockResolvedValue({ access_token: 'token-falso' });

      const resultado = await authController.login({
        email: 'admin@miempresa.com',
        password: 'clave123',
      } as any);

      expect(authService.login).toHaveBeenCalledWith(
        'admin@miempresa.com',
        'clave123',
      );
      expect(resultado).toEqual({ access_token: 'token-falso' });
    });
  });

  describe('solicitarRecuperacion', () => {
    it('deberia delegar en authService.solicitarRecuperacion con el email del dto', async () => {
      const mensajeEsperado = { mensaje: 'mensaje-generico' };
      authService.solicitarRecuperacion.mockResolvedValue(mensajeEsperado);

      const resultado = await authController.solicitarRecuperacion({
        email: 'admin@miempresa.com',
      } as any);

      expect(authService.solicitarRecuperacion).toHaveBeenCalledWith(
        'admin@miempresa.com',
      );
      expect(resultado).toEqual(mensajeEsperado);
    });
  });

  describe('restablecerPassword', () => {
    it('deberia delegar en authService.restablecerPassword con el token y la nueva password del dto', async () => {
      const mensajeEsperado = {
        mensaje: 'Contraseña actualizada correctamente',
      };
      authService.restablecerPassword.mockResolvedValue(mensajeEsperado);

      const resultado = await authController.restablecerPassword({
        token: 'token-de-prueba',
        nuevaPassword: 'nuevaClave123',
      } as any);

      expect(authService.restablecerPassword).toHaveBeenCalledWith(
        'token-de-prueba',
        'nuevaClave123',
      );
      expect(resultado).toEqual(mensajeEsperado);
    });
  });
});