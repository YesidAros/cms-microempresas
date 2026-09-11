import { Test, TestingModule } from '@nestjs/testing';
import { ServiciosController } from './servicios.controller';
import { ServiciosService } from './servicios.service';

describe('ServiciosController', () => {
  let serviciosController: ServiciosController;
  let serviciosService: Partial<Record<keyof ServiciosService, jest.Mock>>;

  beforeEach(async () => {
    serviciosService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      actualizarImagen: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiciosController],
      providers: [{ provide: ServiciosService, useValue: serviciosService }],
    }).compile();

    serviciosController = module.get<ServiciosController>(
      ServiciosController,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deberia estar definido', () => {
    expect(serviciosController).toBeDefined();
  });

  describe('create', () => {
    it('deberia llamar a serviciosService.create con el dto', async () => {
      const dtoDePrueba = { nombre: 'Servicio', empresaId: 1 };
      const resultadoEsperado = { id: 1, ...dtoDePrueba };
      serviciosService.create!.mockResolvedValue(resultadoEsperado);

      const resultado = await serviciosController.create(dtoDePrueba as any);

      expect(serviciosService.create).toHaveBeenCalledWith(dtoDePrueba);
      expect(resultado).toEqual(resultadoEsperado);
    });
  });

  describe('findAll', () => {
    it('deberia llamar a serviciosService.findAll con el dto de paginacion', async () => {
      const paginacionDto = { pagina: 1, limite: 10 };
      const resultadoEsperado = {
        data: [{ id: 1 }],
        total: 1,
        pagina: 1,
        limite: 10,
        totalPaginas: 1,
      };
      serviciosService.findAll!.mockResolvedValue(resultadoEsperado);

      const resultado = await serviciosController.findAll(
        paginacionDto as any,
      );

      expect(serviciosService.findAll).toHaveBeenCalledWith(paginacionDto);
      expect(resultado).toEqual(resultadoEsperado);
    });
  });

  describe('findOne', () => {
    it('deberia llamar a serviciosService.findOne con el id convertido a numero', async () => {
      const servicioDePrueba = { id: 5 };
      serviciosService.findOne!.mockResolvedValue(servicioDePrueba);

      const resultado = await serviciosController.findOne('5');

      expect(serviciosService.findOne).toHaveBeenCalledWith(5);
      expect(resultado).toEqual(servicioDePrueba);
    });
  });

  describe('update', () => {
    it('deberia llamar a serviciosService.update con el id convertido a numero y el dto', async () => {
      const dtoDePrueba = { nombre: 'Nombre Actualizado' };
      const resultadoEsperado = { id: 5, ...dtoDePrueba };
      serviciosService.update!.mockResolvedValue(resultadoEsperado);

      const resultado = await serviciosController.update(
        '5',
        dtoDePrueba as any,
      );

      expect(serviciosService.update).toHaveBeenCalledWith(5, dtoDePrueba);
      expect(resultado).toEqual(resultadoEsperado);
    });
  });

  describe('subirImagen', () => {
    it('deberia llamar a serviciosService.actualizarImagen con el id y el nombre del archivo', async () => {
      const archivoDePrueba = { filename: 'abc.png' } as Express.Multer.File;
      const resultadoEsperado = { id: 5, imagenUrl: 'http://.../abc.png' };
      serviciosService.actualizarImagen!.mockResolvedValue(resultadoEsperado);

      const resultado = await serviciosController.subirImagen(
        '5',
        archivoDePrueba,
      );

      expect(serviciosService.actualizarImagen).toHaveBeenCalledWith(
        5,
        'abc.png',
      );
      expect(resultado).toEqual(resultadoEsperado);
    });
  });

  describe('remove', () => {
    it('deberia llamar a serviciosService.remove con el id convertido a numero', async () => {
      serviciosService.remove!.mockResolvedValue({ affected: 1 });

      const resultado = await serviciosController.remove('5');

      expect(serviciosService.remove).toHaveBeenCalledWith(5);
      expect(resultado).toEqual({ affected: 1 });
    });
  });
});