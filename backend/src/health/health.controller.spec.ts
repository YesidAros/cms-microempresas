import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let healthController: HealthController;
  let healthCheckService: Partial<Record<keyof HealthCheckService, jest.Mock>>;
  let typeOrmHealthIndicator: Partial<Record<keyof TypeOrmHealthIndicator, jest.Mock>>;

  beforeEach(async () => {
    healthCheckService = {
      check: jest.fn(),
    };
    typeOrmHealthIndicator = {
      pingCheck: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: healthCheckService },
        { provide: TypeOrmHealthIndicator, useValue: typeOrmHealthIndicator },
      ],
    }).compile();

    healthController = module.get<HealthController>(HealthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deberia estar definido', () => {
    expect(healthController).toBeDefined();
  });

  describe('verificar', () => {
    it('deberia ejecutar el chequeo de la base de datos y devolver el resultado', async () => {
      const resultadoEsperado = {
        status: 'ok',
        info: { base_de_datos: { status: 'up' } },
        error: {},
        details: { base_de_datos: { status: 'up' } },
      };
      healthCheckService.check!.mockImplementation(
        async (chequeos: Array<() => any>) => {
          for (const chequeo of chequeos) {
            await chequeo();
          }
          return resultadoEsperado;
        },
      );
      typeOrmHealthIndicator.pingCheck!.mockResolvedValue({
        base_de_datos: { status: 'up' },
      });

      const resultado = await healthController.verificar();

      expect(healthCheckService.check).toHaveBeenCalledWith([
        expect.any(Function),
      ]);
      expect(typeOrmHealthIndicator.pingCheck).toHaveBeenCalledWith(
        'base_de_datos',
      );
      expect(resultado).toEqual(resultadoEsperado);
    });
  });
});