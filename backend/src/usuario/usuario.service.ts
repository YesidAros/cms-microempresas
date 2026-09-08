import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './entities/usuario.entity';
import { Empresa } from '../empresa/entities/empresa.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

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

  findAll() {
    return this.usuarioRepository.find({ relations: { empresa: true } });
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

  update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    return `This action updates a #${id} usuario`;
  }

  remove(id: number) {
    return this.usuarioRepository.delete(id);
  }
}