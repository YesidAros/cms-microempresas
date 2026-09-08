import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuarioService } from '../usuario/usuario.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUsuario(email: string, password: string) {
    const usuario = await this.usuarioService.findByEmailConPassword(email);

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValido = await bcrypt.compare(password, usuario.password);

    if (!passwordValido) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const { password: _password, ...usuarioSinPassword } = usuario;
    return usuarioSinPassword;
  }

  async login(email: string, password: string) {
    const usuario = await this.validateUsuario(email, password);

    const payload = { sub: usuario.id, email: usuario.email, rol: usuario.rol };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}