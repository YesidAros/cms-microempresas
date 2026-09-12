import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './entities/usuario.entity';
import { Empresa } from '../empresa/entities/empresa.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PaginacionQueryDto } from '../shared/dto/paginacion-query.dto';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    const empresa = await this.empresaRepository.findOneBy({
      id: createUsuarioDto.empresaId,
    });

    if (!empresa) {
      throw new NotFoundException(
        `No existe una empresa con id ${createUsuarioDto.empresaId}`,
      );
    }

    const passwordHasheado = await bcrypt.hash(createUsuarioDto.password, 10);

    const nuevoUsuario = this.usuarioRepository.create({
      email: createUsuarioDto.email,
      password: passwordHasheado,
      nombre: createUsuarioDto.nombre,
      empresa,
    });

    let usuarioGuardado: Usuario;
    try {
      usuarioGuardado = await this.usuarioRepository.save(nuevoUsuario);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('Ya existe un usuario con ese email');
      }
      throw error;
    }

    const { password, ...usuarioSinPassword } = usuarioGuardado;
    return usuarioSinPassword;
  }

  async findAll(paginacionQueryDto: PaginacionQueryDto) {
    const { pagina, limite } = paginacionQueryDto;
    const [data, total] = await this.usuarioRepository.findAndCount({
      relations: { empresa: true },
      skip: (pagina - 1) * limite,
      take: limite,
    });

    return {
      data,
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    };
  }

  findOne(id: number) {
    return this.usuarioRepository.findOne({
      where: { id },
      relations: { empresa: true },
    });
  }

  findByEmailConPassword(email: string) {
    return this.usuarioRepository.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        nombre: true,
        rol: true,
      },
    });
  }

  findByIdConPassword(id: number) {
    return this.usuarioRepository.findOne({
      where: { id },
      select: {
        id: true,
        email: true,
        password: true,
        nombre: true,
        rol: true,
      },
    });
  }

  findByEmail(email: string) {
    return this.usuarioRepository.findOneBy({ email });
  }

  async actualizarPassword(id: number, passwordHasheado: string) {
    await this.usuarioRepository.update(id, { password: passwordHasheado });
  }

  update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    return `This action updates a #${id} usuario`;
  }

  remove(id: number) {
    return this.usuarioRepository.delete(id);
  }
}