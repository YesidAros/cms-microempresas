import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoticiasService } from './noticias.service';
import { Noticia } from './entities/noticia.entity';
import { Empresa } from '../empresa/entities/empresa.entity';
import { ArchivosService } from '../archivos/archivos.service';

describe('NoticiasService', () => {
  let noticiasService: NoticiasService;
  let noticiaRepository: Partial<Record<keyof Repository<Noticia>, jest.Mock>>;
  let empresaRepository: Partial<Record<keyof Repository<Empresa>, jest.Mock>>;
  let archivosService: Partial<Record<keyof ArchivosService, jest.Mock>>;

  const empresaDePrueba = { id: 1, nombre: 'Mi Empresa' } as Empresa;

  beforeEach(async () => {
    noticiaRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    empresaRepository = {
      findOneBy: jest.fn(),
    };
    archivosService = {
      construirUrlPublica: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoticiasService,
        { provide: getRepositoryToken(Noticia), useValue: noticiaRepository },
        { provide: getRepositoryToken(Empresa), useValue: empresaRepository },
        { provide: ArchivosService, useValue: archivosService },
      ],
    }).compile();

    noticiasService = module.get<NoticiasService>(NoticiasService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const dtoDePrueba = {
      titulo: 'Noticia de prueba',
      slug: 'noticia-de-prueba',
      contenido: 'Contenido de prueba',
      empresaId: 1,
    };

    it('deberia lanzar NotFoundException si la empresa no existe', async () => {
      empresaRepository.findOneBy!.mockResolvedValue(null);

      await expect(
        noticiasService.create(dtoDePrueba as any),
      ).rejects.toThrow(NotFoundException);
      expect(noticiaRepository.save).not.toHaveBeenCalled();
    });

    it('deberia crear y guardar la noticia asociada a la empresa', async () => {
      empresaRepository.findOneBy!.mockResolvedValue(empresaDePrueba);
      const entidadCreada = {
        titulo: dtoDePrueba.titulo,
        slug: dtoDePrueba.slug,
        contenido: dtoDePrueba.contenido,
        empresa: empresaDePrueba,
      };
      const entidadGuardada = { id: 1, ...entidadCreada };
      noticiaRepository.create!.mockReturnValue(entidadCreada);
      noticiaRepository.save!.mockResolvedValue(entidadGuardada);

      const resultado = await noticiasService.create(dtoDePrueba as any);

      expect(empresaRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(noticiaRepository.create).toHaveBeenCalledWith({
        titulo: dtoDePrueba.titulo,
        slug: dtoDePrueba.slug,
        contenido: dtoDePrueba.contenido,
        empresa: empresaDePrueba,
      });
      expect(resultado).toEqual(entidadGuardada);
    });

    it('deberia lanzar ConflictException si el slug ya existe', async () => {
      empresaRepository.findOneBy!.mockResolvedValue(empresaDePrueba);
      noticiaRepository.create!.mockReturnValue({});
      noticiaRepository.save!.mockRejectedValue({ code: '23505' });

      await expect(
        noticiasService.create(dtoDePrueba as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('deberia devolver las noticias paginadas con su empresa', async () => {
      const listaDePrueba = [{ id: 1 }, { id: 2 }];
      noticiaRepository.findAndCount!.mockResolvedValue([listaDePrueba, 2]);

      const resultado = await noticiasService.findAll({
        pagina: 1,
        limite: 10,
      });

      expect(noticiaRepository.findAndCount).toHaveBeenCalledWith({
        relations: { empresa: true },
        skip: 0,
        take: 10,
      });
      expect(resultado).toEqual({
        data: listaDePrueba,
        total: 2,
        pagina: 1,
        limite: 10,
        totalPaginas: 1,
      });
    });

    it('deberia calcular correctamente el skip para paginas mayores a 1', async () => {
      noticiaRepository.findAndCount!.mockResolvedValue([[], 5]);

      await noticiasService.findAll({ pagina: 2, limite: 2 });

      expect(noticiaRepository.findAndCount).toHaveBeenCalledWith({
        relations: { empresa: true },
        skip: 2,
        take: 2,
      });
    });
  });

  describe('findOne', () => {
    it('deberia devolver una noticia por id con su empresa', async () => {
      const noticiaDePrueba = { id: 1, titulo: 'Noticia de prueba' };
      noticiaRepository.findOne!.mockResolvedValue(noticiaDePrueba);

      const resultado = await noticiasService.findOne(1);

      expect(noticiaRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { empresa: true },
      });
      expect(resultado).toEqual(noticiaDePrueba);
    });
  });

  describe('update', () => {
    it('deberia actualizar la noticia y devolver la version actualizada', async () => {
      const dtoDePrueba = { titulo: 'Titulo Actualizado' };
      const noticiaActualizada = { id: 1, ...dtoDePrueba };
      noticiaRepository.update!.mockResolvedValue({ affected: 1 });
      noticiaRepository.findOne!.mockResolvedValue(noticiaActualizada);

      const resultado = await noticiasService.update(1, dtoDePrueba as any);

      expect(noticiaRepository.update).toHaveBeenCalledWith(1, dtoDePrueba);
      expect(resultado).toEqual(noticiaActualizada);
    });
  });

  describe('actualizarImagen', () => {
    it('deberia construir la url de la imagen, actualizarla y devolver la noticia', async () => {
      const urlEsperada = 'http://localhost:3000/uploads/noticias/abc.png';
      const noticiaActualizada = { id: 1, imagenUrl: urlEsperada };
      archivosService.construirUrlPublica!.mockReturnValue(urlEsperada);
      noticiaRepository.update!.mockResolvedValue({ affected: 1 });
      noticiaRepository.findOne!.mockResolvedValue(noticiaActualizada);

      const resultado = await noticiasService.actualizarImagen(1, 'abc.png');

      expect(archivosService.construirUrlPublica).toHaveBeenCalledWith(
        'noticias',
        'abc.png',
      );
      expect(noticiaRepository.update).toHaveBeenCalledWith(1, {
        imagenUrl: urlEsperada,
      });
      expect(resultado).toEqual(noticiaActualizada);
    });
  });

  describe('remove', () => {
    it('deberia eliminar la noticia por id', async () => {
      noticiaRepository.delete!.mockResolvedValue({ affected: 1 });

      const resultado = await noticiasService.remove(1);

      expect(noticiaRepository.delete).toHaveBeenCalledWith(1);
      expect(resultado).toEqual({ affected: 1 });
    });
  });
});