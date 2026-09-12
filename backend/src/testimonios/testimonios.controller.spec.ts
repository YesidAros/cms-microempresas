import { Test, TestingModule } from '@nestjs/testing';
import { TestimoniosController } from './testimonios.controller';
import { TestimoniosService } from './testimonios.service';

describe('TestimoniosController', () => {
  let testimoniosController: TestimoniosController;
  let testimoniosService: Partial<Record<keyof TestimoniosService, jest.Mock>>;

  beforeEach(async () => {
    testimoniosService = {
      create: jest.fn(),
      findAllPublico: jest.fn(),
      findAllAdmin: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestimoniosController],
      providers: [
        { provide: TestimoniosService, useValue: testimoniosService },
      ],
    }).compile();

    testimoniosController = module.get<TestimoniosController>(
      TestimoniosController,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deberia estar definido', () => {
    expect(testimoniosController).toBeDefined();
  });

  describe('create', () => {
    it('deberia llamar a testimoniosService.create con el dto', async () => {
      const dtoDePrueba = {
        nombreAutor: 'Juan Pérez',
        texto: 'Excelente servicio.',
        empresaId: 1,
      };
      const resultadoEsperado = { id: 1, ...dtoDePrueba };
      testimoniosService.create!.mockResolvedValue(resultadoEsperado);

      const resultado = await testimoniosController.create(
        dtoDePrueba as any,
      );

      expect(testimoniosService.create).toHaveBeenCalledWith(dtoDePrueba);
      expect(resultado).toEqual(resultadoEsperado);
    });
  });

  describe('findAllPublico', () => {
    it('deberia llamar a testimoniosService.findAllPublico con el dto de paginacion', async () => {
      const paginacionDto = { pagina: 1, limite: 10 };
      const resultadoEsperado = {
        data: [{ id: 1, autorizado: true }],
        total: 1,
        pagina: 1,
        limite: 10,
        totalPaginas: 1,
      };
      testimoniosService.findAllPublico!.mockResolvedValue(resultadoEsperado);

      const resultado = await testimoniosController.findAllPublico(
        paginacionDto as any,
      );

      expect(testimoniosService.findAllPublico).toHaveBeenCalledWith(
        paginacionDto,
      );
      expect(resultado).toEqual(resultadoEsperado);
    });
  });

  describe('findAllAdmin', () => {
    it('deberia llamar a testimoniosService.findAllAdmin con el dto de paginacion', async () => {
      const paginacionDto = { pagina: 1, limite: 10 };
      const resultadoEsperado = {
        data: [
          { id: 1, autorizado: true },
          { id: 2, autorizado: false },
        ],
        total: 2,
        pagina: 1,
        limite: 10,
        totalPaginas: 1,
      };
      testimoniosService.findAllAdmin!.mockResolvedValue(resultadoEsperado);

      const resultado = await testimoniosController.findAllAdmin(
        paginacionDto as any,
      );

      expect(testimoniosService.findAllAdmin).toHaveBeenCalledWith(
        paginacionDto,
      );
      expect(resultado).toEqual(resultadoEsperado);
    });
  });

  describe('findOne', () => {
    it('deberia llamar a testimoniosService.findOne con el id convertido a numero', async () => {
      const testimonioDePrueba = { id: 5 };
      testimoniosService.findOne!.mockResolvedValue(testimonioDePrueba);

      const resultado = await testimoniosController.findOne('5');

      expect(testimoniosService.findOne).toHaveBeenCalledWith(5);
      expect(resultado).toEqual(testimonioDePrueba);
    });
  });

  describe('update', () => {
    it('deberia llamar a testimoniosService.update con el id convertido a numero y el dto', async () => {
      const dtoDePrueba = { autorizado: true };
      const resultadoEsperado = { id: 5, ...dtoDePrueba };
      testimoniosService.update!.mockResolvedValue(resultadoEsperado);

      const resultado = await testimoniosController.update(
        '5',
        dtoDePrueba as any,
      );

      expect(testimoniosService.update).toHaveBeenCalledWith(5, dtoDePrueba);
      expect(resultado).toEqual(resultadoEsperado);
    });
  });

  describe('remove', () => {
    it('deberia llamar a testimoniosService.remove con el id convertido a numero', async () => {
      testimoniosService.remove!.mockResolvedValue({ affected: 1 });

      const resultado = await testimoniosController.remove('5');

      expect(testimoniosService.remove).toHaveBeenCalledWith(5);
      expect(resultado).toEqual({ affected: 1 });
    });
  });
});