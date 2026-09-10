import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';

describe('UsuarioController', () => {
  let usuarioController: UsuarioController;
  let usuarioService: Partial<Record<keyof UsuarioService, jest.Mock>>;

  beforeEach(async () => {
    usuarioService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuarioController],
      providers: [{ provide: UsuarioService, useValue: usuarioService }],
    }).compile();

    usuarioController = module.get<UsuarioController>(UsuarioController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deberia estar definido', () => {
    expect(usuarioController).toBeDefined();
  });

  describe('create', () => {
    it('deberia llamar a usuarioService.create con el dto y devolver el resultado', async () => {
      const dtoDePrueba = {
        email: 'a@a.com',
        password: 'clave123',
        nombre: 'Test',
        empresaId: 1,
      };
      const resultadoEsperado = { id: 1, ...dtoDePrueba };
      usuarioService.create!.mockResolvedValue(resultadoEsperado);

      const resultado = await usuarioController.create(dtoDePrueba as any);

      expect(usuarioService.create).toHaveBeenCalledWith(dtoDePrueba);
      expect(resultado).toEqual(resultadoEsperado);
    });
  });

  describe('findAll', () => {
    it('deberia llamar a usuarioService.findAll y devolver el resultado', async () => {
      const listaDePrueba = [{ id: 1 }, { id: 2 }];
      usuarioService.findAll!.mockResolvedValue(listaDePrueba);

      const resultado = await usuarioController.findAll();

      expect(usuarioService.findAll).toHaveBeenCalled();
      expect(resultado).toEqual(listaDePrueba);
    });
  });

  describe('findOne', () => {
    it('deberia llamar a usuarioService.findOne con el id convertido a numero', async () => {
      const usuarioDePrueba = { id: 5 };
      usuarioService.findOne!.mockResolvedValue(usuarioDePrueba);

      const resultado = await usuarioController.findOne('5');

      expect(usuarioService.findOne).toHaveBeenCalledWith(5);
      expect(resultado).toEqual(usuarioDePrueba);
    });
  });

  describe('update', () => {
    it('deberia llamar a usuarioService.update con el id convertido a numero y el dto', async () => {
      const dtoDePrueba = { nombre: 'Nuevo Nombre' };
      usuarioService.update!.mockResolvedValue({ id: 5, ...dtoDePrueba });

      const resultado = await usuarioController.update('5', dtoDePrueba as any);

      expect(usuarioService.update).toHaveBeenCalledWith(5, dtoDePrueba);
      expect(resultado).toEqual({ id: 5, ...dtoDePrueba });
    });
  });

  describe('remove', () => {
    it('deberia llamar a usuarioService.remove con el id convertido a numero', async () => {
      usuarioService.remove!.mockResolvedValue({ affected: 1 });

      const resultado = await usuarioController.remove('5');

      expect(usuarioService.remove).toHaveBeenCalledWith(5);
      expect(resultado).toEqual({ affected: 1 });
    });
  });
});