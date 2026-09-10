import { Test, TestingModule } from '@nestjs/testing';
import { CorreoController } from './correo.controller';
import { CorreoService } from './correo.service';

describe('CorreoController', () => {
  let correoController: CorreoController;
  let correoService: Partial<Record<keyof CorreoService, jest.Mock>>;

  beforeEach(async () => {
    correoService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CorreoController],
      providers: [{ provide: CorreoService, useValue: correoService }],
    }).compile();

    correoController = module.get<CorreoController>(CorreoController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deberia estar definido', () => {
    expect(correoController).toBeDefined();
  });

  describe('create', () => {
    it('deberia llamar a correoService.create con el dto', async () => {
      const dtoDePrueba = {
        nombre: 'Visitante',
        email: 'visitante@correo.com',
        mensaje: 'Hola',
        empresaId: 1,
      };
      const resultadoEsperado = { id: 1, ...dtoDePrueba };
      correoService.create!.mockResolvedValue(resultadoEsperado);

      const resultado = await correoController.create(dtoDePrueba as any);

      expect(correoService.create).toHaveBeenCalledWith(dtoDePrueba);
      expect(resultado).toEqual(resultadoEsperado);
    });
  });

  describe('findAll', () => {
    it('deberia llamar a correoService.findAll', async () => {
      const listaDePrueba = [{ id: 1 }];
      correoService.findAll!.mockResolvedValue(listaDePrueba);

      const resultado = await correoController.findAll();

      expect(correoService.findAll).toHaveBeenCalled();
      expect(resultado).toEqual(listaDePrueba);
    });
  });

  describe('findOne', () => {
    it('deberia llamar a correoService.findOne con el id convertido a numero', async () => {
      const correoDePrueba = { id: 5 };
      correoService.findOne!.mockResolvedValue(correoDePrueba);

      const resultado = await correoController.findOne('5');

      expect(correoService.findOne).toHaveBeenCalledWith(5);
      expect(resultado).toEqual(correoDePrueba);
    });
  });

  describe('update', () => {
    it('deberia llamar a correoService.update con el id convertido a numero y el dto', async () => {
      const dtoDePrueba = { mensaje: 'Mensaje actualizado' };
      const resultadoEsperado = { affected: 1 };
      correoService.update!.mockResolvedValue(resultadoEsperado);

      const resultado = await correoController.update(
        '5',
        dtoDePrueba as any,
      );

      expect(correoService.update).toHaveBeenCalledWith(5, dtoDePrueba);
      expect(resultado).toEqual(resultadoEsperado);
    });
  });

  describe('remove', () => {
    it('deberia llamar a correoService.remove con el id convertido a numero', async () => {
      correoService.remove!.mockResolvedValue({ affected: 1 });

      const resultado = await correoController.remove('5');

      expect(correoService.remove).toHaveBeenCalledWith(5);
      expect(resultado).toEqual({ affected: 1 });
    });
  });
});