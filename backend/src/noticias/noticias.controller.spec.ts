import { Test, TestingModule } from '@nestjs/testing';
import { NoticiasController } from './noticias.controller';
import { NoticiasService } from './noticias.service';

describe('NoticiasController', () => {
  let noticiasController: NoticiasController;
  let noticiasService: Partial<Record<keyof NoticiasService, jest.Mock>>;

  beforeEach(async () => {
    noticiasService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      actualizarImagen: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NoticiasController],
      providers: [{ provide: NoticiasService, useValue: noticiasService }],
    }).compile();

    noticiasController = module.get<NoticiasController>(NoticiasController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deberia estar definido', () => {
    expect(noticiasController).toBeDefined();
  });

  describe('create', () => {
    it('deberia llamar a noticiasService.create con el dto', async () => {
      const dtoDePrueba = { titulo: 'Noticia', slug: 'noticia', empresaId: 1 };
      const resultadoEsperado = { id: 1, ...dtoDePrueba };
      noticiasService.create!.mockResolvedValue(resultadoEsperado);

      const resultado = await noticiasController.create(dtoDePrueba as any);

      expect(noticiasService.create).toHaveBeenCalledWith(dtoDePrueba);
      expect(resultado).toEqual(resultadoEsperado);
    });
  });

  describe('findAll', () => {
    it('deberia llamar a noticiasService.findAll con el dto de paginacion', async () => {
      const paginacionDto = { pagina: 1, limite: 10 };
      const resultadoEsperado = {
        data: [{ id: 1 }],
        total: 1,
        pagina: 1,
        limite: 10,
        totalPaginas: 1,
      };
      noticiasService.findAll!.mockResolvedValue(resultadoEsperado);

      const resultado = await noticiasController.findAll(
        paginacionDto as any,
      );

      expect(noticiasService.findAll).toHaveBeenCalledWith(paginacionDto);
      expect(resultado).toEqual(resultadoEsperado);
    });
  });

  describe('findOne', () => {
    it('deberia llamar a noticiasService.findOne con el id convertido a numero', async () => {
      const noticiaDePrueba = { id: 5 };
      noticiasService.findOne!.mockResolvedValue(noticiaDePrueba);

      const resultado = await noticiasController.findOne('5');

      expect(noticiasService.findOne).toHaveBeenCalledWith(5);
      expect(resultado).toEqual(noticiaDePrueba);
    });
  });

  describe('update', () => {
    it('deberia llamar a noticiasService.update con el id convertido a numero y el dto', async () => {
      const dtoDePrueba = { titulo: 'Titulo Actualizado' };
      const resultadoEsperado = { id: 5, ...dtoDePrueba };
      noticiasService.update!.mockResolvedValue(resultadoEsperado);

      const resultado = await noticiasController.update(
        '5',
        dtoDePrueba as any,
      );

      expect(noticiasService.update).toHaveBeenCalledWith(5, dtoDePrueba);
      expect(resultado).toEqual(resultadoEsperado);
    });
  });

  describe('subirImagen', () => {
    it('deberia llamar a noticiasService.actualizarImagen con el id y el nombre del archivo', async () => {
      const archivoDePrueba = { filename: 'abc.png' } as Express.Multer.File;
      const resultadoEsperado = { id: 5, imagenUrl: 'http://.../abc.png' };
      noticiasService.actualizarImagen!.mockResolvedValue(resultadoEsperado);

      const resultado = await noticiasController.subirImagen(
        '5',
        archivoDePrueba,
      );

      expect(noticiasService.actualizarImagen).toHaveBeenCalledWith(
        5,
        'abc.png',
      );
      expect(resultado).toEqual(resultadoEsperado);
    });
  });

  describe('remove', () => {
    it('deberia llamar a noticiasService.remove con el id convertido a numero', async () => {
      noticiasService.remove!.mockResolvedValue({ affected: 1 });

      const resultado = await noticiasController.remove('5');

      expect(noticiasService.remove).toHaveBeenCalledWith(5);
      expect(resultado).toEqual({ affected: 1 });
    });
  });
});