import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CorreoService } from './correo.service';
import { Correo } from './entities/correo.entity';
import { Empresa } from '../empresa/entities/empresa.entity';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

describe('CorreoService', () => {
  let correoService: CorreoService;
  let correoRepository: Partial<Record<keyof Repository<Correo>, jest.Mock>>;
  let empresaRepository: Partial<Record<keyof Repository<Empresa>, jest.Mock>>;
  let notificacionesService: Partial<Record<keyof NotificacionesService, jest.Mock>>;

  const dtoDePrueba = {
    nombre: 'Visitante de prueba',
    email: 'visitante@correo.com',
    telefono: '3001234567',
    mensaje: 'Hola, quiero mas informacion',
    empresaId: 1,
  };

  beforeEach(async () => {
    correoRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    empresaRepository = {
      findOneBy: jest.fn(),
    };
    notificacionesService = {
      enviarCorreo: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CorreoService,
        { provide: getRepositoryToken(Correo), useValue: correoRepository },
        { provide: getRepositoryToken(Empresa), useValue: empresaRepository },
        {
          provide: NotificacionesService,
          useValue: notificacionesService,
        },
      ],
    }).compile();

    correoService = module.get<CorreoService>(CorreoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deberia lanzar NotFoundException si la empresa no existe', async () => {
      empresaRepository.findOneBy!.mockResolvedValue(null);

      await expect(correoService.create(dtoDePrueba as any)).rejects.toThrow(
        NotFoundException,
      );
      expect(correoRepository.save).not.toHaveBeenCalled();
    });

    it('deberia guardar el correo y NO enviar notificacion si la empresa no tiene emailContacto', async () => {
      const empresaSinEmailContacto = {
        id: 1,
        nombre: 'Mi Empresa',
        emailContacto: null,
      } as unknown as Empresa;
      empresaRepository.findOneBy!.mockResolvedValue(empresaSinEmailContacto);
      const entidadCreada = { ...dtoDePrueba, empresa: empresaSinEmailContacto };
      const entidadGuardada = { id: 1, ...entidadCreada };
      correoRepository.create!.mockReturnValue(entidadCreada);
      correoRepository.save!.mockResolvedValue(entidadGuardada);

      const resultado = await correoService.create(dtoDePrueba as any);

      expect(correoRepository.save).toHaveBeenCalled();
      expect(notificacionesService.enviarCorreo).not.toHaveBeenCalled();
      expect(resultado).toEqual(entidadGuardada);
    });

    it('deberia guardar el correo y enviar notificacion con la plantilla por defecto', async () => {
      const empresaDePrueba = {
        id: 1,
        nombre: 'Mi Empresa',
        emailContacto: 'contacto@miempresa.com',
        plantillaCorreoHtml: null,
      } as unknown as Empresa;
      empresaRepository.findOneBy!.mockResolvedValue(empresaDePrueba);
      const entidadCreada = { ...dtoDePrueba, empresa: empresaDePrueba };
      const entidadGuardada = { id: 1, ...entidadCreada };
      correoRepository.create!.mockReturnValue(entidadCreada);
      correoRepository.save!.mockResolvedValue(entidadGuardada);

      const resultado = await correoService.create(dtoDePrueba as any);

      expect(notificacionesService.enviarCorreo).toHaveBeenCalledWith(
        'contacto@miempresa.com',
        `Nuevo mensaje de contacto de ${dtoDePrueba.nombre}`,
        expect.any(String),
        dtoDePrueba.email,
      );
      expect(resultado).toEqual(entidadGuardada);
    });

    it('deberia guardar el correo y enviar notificacion con la plantilla personalizada si existe', async () => {
      const empresaDePrueba = {
        id: 1,
        nombre: 'Mi Empresa',
        emailContacto: 'contacto@miempresa.com',
        plantillaCorreoHtml: '<p>Hola {{ nombre }}</p>',
      } as unknown as Empresa;
      empresaRepository.findOneBy!.mockResolvedValue(empresaDePrueba);
      const entidadCreada = { ...dtoDePrueba, empresa: empresaDePrueba };
      const entidadGuardada = { id: 1, ...entidadCreada };
      correoRepository.create!.mockReturnValue(entidadCreada);
      correoRepository.save!.mockResolvedValue(entidadGuardada);

      await correoService.create(dtoDePrueba as any);

      expect(notificacionesService.enviarCorreo).toHaveBeenCalledWith(
        'contacto@miempresa.com',
        `Nuevo mensaje de contacto de ${dtoDePrueba.nombre}`,
        expect.stringContaining(dtoDePrueba.nombre),
        dtoDePrueba.email,
      );
    });
  });

  describe('findAll', () => {
    it('deberia devolver la lista de correos con su empresa', async () => {
      const listaDePrueba = [{ id: 1 }, { id: 2 }];
      correoRepository.find!.mockResolvedValue(listaDePrueba);

      const resultado = await correoService.findAll();

      expect(correoRepository.find).toHaveBeenCalledWith({
        relations: { empresa: true },
      });
      expect(resultado).toEqual(listaDePrueba);
    });
  });

  describe('findOne', () => {
    it('deberia devolver un correo por id con su empresa', async () => {
      const correoDePrueba = { id: 1, nombre: 'Visitante de prueba' };
      correoRepository.findOne!.mockResolvedValue(correoDePrueba);

      const resultado = await correoService.findOne(1);

      expect(correoRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { empresa: true },
      });
      expect(resultado).toEqual(correoDePrueba);
    });
  });

  describe('update', () => {
    it('deberia actualizar el correo', async () => {
      const dtoActualizacion = { mensaje: 'Mensaje actualizado' };
      correoRepository.update!.mockResolvedValue({ affected: 1 });

      const resultado = await correoService.update(1, dtoActualizacion as any);

      expect(correoRepository.update).toHaveBeenCalledWith(1, dtoActualizacion);
      expect(resultado).toEqual({ affected: 1 });
    });
  });

  describe('remove', () => {
    it('deberia eliminar el correo por id', async () => {
      correoRepository.delete!.mockResolvedValue({ affected: 1 });

      const resultado = await correoService.remove(1);

      expect(correoRepository.delete).toHaveBeenCalledWith(1);
      expect(resultado).toEqual({ affected: 1 });
    });
  });
});