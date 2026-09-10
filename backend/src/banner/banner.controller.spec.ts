import { Test, TestingModule } from '@nestjs/testing';
import { BannerController } from './banner.controller';
import { BannerService } from './banner.service';

describe('BannerController', () => {
  let bannerController: BannerController;
  let bannerService: Partial<Record<keyof BannerService, jest.Mock>>;

  beforeEach(async () => {
    bannerService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      actualizarImagen: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BannerController],
      providers: [{ provide: BannerService, useValue: bannerService }],
    }).compile();

    bannerController = module.get<BannerController>(BannerController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deberia estar definido', () => {
    expect(bannerController).toBeDefined();
  });

  describe('create', () => {
    it('deberia llamar a bannerService.create con el dto', async () => {
      const dtoDePrueba = { titulo: 'Banner', empresaId: 1 };
      const resultadoEsperado = { id: 1, ...dtoDePrueba };
      bannerService.create!.mockResolvedValue(resultadoEsperado);

      const resultado = await bannerController.create(dtoDePrueba as any);

      expect(bannerService.create).toHaveBeenCalledWith(dtoDePrueba);
      expect(resultado).toEqual(resultadoEsperado);
    });
  });

  describe('findAll', () => {
    it('deberia llamar a bannerService.findAll', async () => {
      const listaDePrueba = [{ id: 1 }];
      bannerService.findAll!.mockResolvedValue(listaDePrueba);

      const resultado = await bannerController.findAll();

      expect(bannerService.findAll).toHaveBeenCalled();
      expect(resultado).toEqual(listaDePrueba);
    });
  });

  describe('findOne', () => {
    it('deberia llamar a bannerService.findOne con el id convertido a numero', async () => {
      const bannerDePrueba = { id: 5 };
      bannerService.findOne!.mockResolvedValue(bannerDePrueba);

      const resultado = await bannerController.findOne('5');

      expect(bannerService.findOne).toHaveBeenCalledWith(5);
      expect(resultado).toEqual(bannerDePrueba);
    });
  });

  describe('update', () => {
    it('deberia llamar a bannerService.update con el id convertido a numero y el dto', async () => {
      const dtoDePrueba = { titulo: 'Titulo Actualizado' };
      const resultadoEsperado = { id: 5, ...dtoDePrueba };
      bannerService.update!.mockResolvedValue(resultadoEsperado);

      const resultado = await bannerController.update(
        '5',
        dtoDePrueba as any,
      );

      expect(bannerService.update).toHaveBeenCalledWith(5, dtoDePrueba);
      expect(resultado).toEqual(resultadoEsperado);
    });
  });

  describe('subirImagen', () => {
    it('deberia llamar a bannerService.actualizarImagen con el id y el nombre del archivo', async () => {
      const archivoDePrueba = { filename: 'abc.png' } as Express.Multer.File;
      const resultadoEsperado = { id: 5, imagenUrl: 'http://.../abc.png' };
      bannerService.actualizarImagen!.mockResolvedValue(resultadoEsperado);

      const resultado = await bannerController.subirImagen(
        '5',
        archivoDePrueba,
      );

      expect(bannerService.actualizarImagen).toHaveBeenCalledWith(
        5,
        'abc.png',
      );
      expect(resultado).toEqual(resultadoEsperado);
    });
  });

  describe('remove', () => {
    it('deberia llamar a bannerService.remove con el id convertido a numero', async () => {
      bannerService.remove!.mockResolvedValue({ affected: 1 });

      const resultado = await bannerController.remove('5');

      expect(bannerService.remove).toHaveBeenCalledWith(5);
      expect(resultado).toEqual({ affected: 1 });
    });
  });
});