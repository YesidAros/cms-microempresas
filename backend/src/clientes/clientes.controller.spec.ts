import { Test, TestingModule } from '@nestjs/testing';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';
import { validarFirmaArchivo } from '../archivos/multer-config.util';

jest.mock('../archivos/multer-config.util');

describe('ClientesController', () => {
  let clientesController: ClientesController;
  let clientesService: Partial<Record<keyof ClientesService, jest.Mock>>;

  beforeEach(async () => {
    clientesService = {
      create: jest.fn(),
      findAllPublico: jest.fn(),
      findAllAdmin: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      actualizarLogo: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientesController],
      providers: [{ provide: ClientesService, useValue: clientesService }],
    }).compile();

    clientesController =
      module.get<ClientesController>(ClientesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deberia estar definido', () => {
    expect(clientesController).toBeDefined();
  });

  describe('create', () => {
    it('deberia llamar a clientesService.create con el dto', async () => {
      const dtoDePrueba = { nombre: 'Cliente de prueba', empresaId: 1 };
      const resultadoEsperado = { id: 1, ...dtoDePrueba };
      clientesService.create!.mockResolvedValue(resultadoEsperado);

      const resultado = await clientesController.create(dtoDePrueba as any);

      expect(clientesService.create).toHaveBeenCalledWith(dtoDePrueba);
      expect(resultado).toEqual(resultadoEsperado);
    });
  });

  describe('findAllPublico', () => {
    it('deberia llamar a clientesService.findAllPublico con el dto de paginacion', async () => {
      const paginacionDto = { pagina: 1, limite: 10 };
      const resultadoEsperado = {
        data: [{ id: 1, autorizado: true }],
        total: 1,
        pagina: 1,
        limite: 10,
        totalPaginas: 1,
      };
      clientesService.findAllPublico!.mockResolvedValue(resultadoEsperado);

      const resultado = await clientesController.findAllPublico(
        paginacionDto as any,
      );

      expect(clientesService.findAllPublico).toHaveBeenCalledWith(
        paginacionDto,
      );
      expect(resultado).toEqual(resultadoEsperado);
    });
  });

  describe('findAllAdmin', () => {
    it('deberia llamar a clientesService.findAllAdmin con el dto de paginacion', async () => {
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
      clientesService.findAllAdmin!.mockResolvedValue(resultadoEsperado);

      const resultado = await clientesController.findAllAdmin(
        paginacionDto as any,
      );

      expect(clientesService.findAllAdmin).toHaveBeenCalledWith(
        paginacionDto,
      );
      expect(resultado).toEqual(resultadoEsperado);
    });
  });

  describe('findOne', () => {
    it('deberia llamar a clientesService.findOne con el id convertido a numero', async () => {
      const clienteDePrueba = { id: 5 };
      clientesService.findOne!.mockResolvedValue(clienteDePrueba);

      const resultado = await clientesController.findOne('5');

      expect(clientesService.findOne).toHaveBeenCalledWith(5);
      expect(resultado).toEqual(clienteDePrueba);
    });
  });

  describe('update', () => {
    it('deberia llamar a clientesService.update con el id convertido a numero y el dto', async () => {
      const dtoDePrueba = { autorizado: true };
      const resultadoEsperado = { id: 5, ...dtoDePrueba };
      clientesService.update!.mockResolvedValue(resultadoEsperado);

      const resultado = await clientesController.update(
        '5',
        dtoDePrueba as any,
      );

      expect(clientesService.update).toHaveBeenCalledWith(5, dtoDePrueba);
      expect(resultado).toEqual(resultadoEsperado);
    });
  });

  describe('subirLogo', () => {
    it('deberia validar la firma del archivo y llamar a clientesService.actualizarLogo con el id y el nombre del archivo', async () => {
      const archivoDePrueba = {
        filename: 'abc.png',
        path: './uploads/clientes/abc.png',
      } as Express.Multer.File;
      const resultadoEsperado = { id: 5, logoUrl: 'http://.../abc.png' };
      clientesService.actualizarLogo!.mockResolvedValue(resultadoEsperado);

      const resultado = await clientesController.subirLogo(
        '5',
        archivoDePrueba,
      );

      expect(validarFirmaArchivo).toHaveBeenCalledWith(archivoDePrueba.path);
      expect(clientesService.actualizarLogo).toHaveBeenCalledWith(
        5,
        'abc.png',
      );
      expect(resultado).toEqual(resultadoEsperado);
    });
  });

  describe('remove', () => {
    it('deberia llamar a clientesService.remove con el id convertido a numero', async () => {
      clientesService.remove!.mockResolvedValue({ affected: 1 });

      const resultado = await clientesController.remove('5');

      expect(clientesService.remove).toHaveBeenCalledWith(5);
      expect(resultado).toEqual({ affected: 1 });
    });
  });
});