import { Test, TestingModule } from '@nestjs/testing';
import { EmpresaController } from './empresa.controller';
import { EmpresaService } from './empresa.service';

describe('EmpresaController', () => {
  let empresaController: EmpresaController;
  let empresaService: Partial<Record<keyof EmpresaService, jest.Mock>>;

  beforeEach(async () => {
    empresaService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      actualizarLogo: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmpresaController],
      providers: [{ provide: EmpresaService, useValue: empresaService }],
    }).compile();

    empresaController = module.get<EmpresaController>(EmpresaController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deberia estar definido', () => {
    expect(empresaController).toBeDefined();
  });

  describe('create', () => {
    it('deberia llamar a empresaService.create con el dto', async () => {
      const dtoDePrueba = { nombre: 'Mi Empresa' };
      const resultadoEsperado = { id: 1, ...dtoDePrueba };
      empresaService.create!.mockResolvedValue(resultadoEsperado);

      const resultado = await empresaController.create(dtoDePrueba as any);

      expect(empresaService.create).toHaveBeenCalledWith(dtoDePrueba);
      expect(resultado).toEqual(resultadoEsperado);
    });
  });

  describe('findAll', () => {
    it('deberia llamar a empresaService.findAll', async () => {
      const listaDePrueba = [{ id: 1 }];
      empresaService.findAll!.mockResolvedValue(listaDePrueba);

      const resultado = await empresaController.findAll();

      expect(empresaService.findAll).toHaveBeenCalled();
      expect(resultado).toEqual(listaDePrueba);
    });
  });

  describe('findOne', () => {
    it('deberia llamar a empresaService.findOne con el id convertido a numero', async () => {
      const empresaDePrueba = { id: 5 };
      empresaService.findOne!.mockResolvedValue(empresaDePrueba);

      const resultado = await empresaController.findOne('5');

      expect(empresaService.findOne).toHaveBeenCalledWith(5);
      expect(resultado).toEqual(empresaDePrueba);
    });
  });

  describe('update', () => {
    it('deberia llamar a empresaService.update con el id convertido a numero y el dto', async () => {
      const dtoDePrueba = { nombre: 'Nombre Actualizado' };
      const resultadoEsperado = { id: 5, ...dtoDePrueba };
      empresaService.update!.mockResolvedValue(resultadoEsperado);

      const resultado = await empresaController.update('5', dtoDePrueba as any);

      expect(empresaService.update).toHaveBeenCalledWith(5, dtoDePrueba);
      expect(resultado).toEqual(resultadoEsperado);
    });
  });

  describe('subirLogo', () => {
    it('deberia llamar a empresaService.actualizarLogo con el id y el nombre del archivo', async () => {
      const archivoDePrueba = { filename: 'abc.png' } as Express.Multer.File;
      const resultadoEsperado = { id: 5, logoUrl: 'http://.../abc.png' };
      empresaService.actualizarLogo!.mockResolvedValue(resultadoEsperado);

      const resultado = await empresaController.subirLogo(
        '5',
        archivoDePrueba,
      );

      expect(empresaService.actualizarLogo).toHaveBeenCalledWith(
        5,
        'abc.png',
      );
      expect(resultado).toEqual(resultadoEsperado);
    });
  });

  describe('remove', () => {
    it('deberia llamar a empresaService.remove con el id convertido a numero', async () => {
      empresaService.remove!.mockResolvedValue({ affected: 1 });

      const resultado = await empresaController.remove('5');

      expect(empresaService.remove).toHaveBeenCalledWith(5);
      expect(resultado).toEqual({ affected: 1 });
    });
  });
});