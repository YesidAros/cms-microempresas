import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsuarioService } from '../usuario/usuario.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { PasswordResetToken } from './entities/password-reset-token.entity';

const DURACION_TOKEN_MINUTOS = 15;

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly jwtService: JwtService,
    private readonly notificacionesService: NotificacionesService,
    private readonly configService: ConfigService,
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetTokenRepository: Repository<PasswordResetToken>,
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

  async solicitarRecuperacion(email: string) {
    const usuario = await this.usuarioService.findByEmail(email);

    if (usuario) {
      await this.passwordResetTokenRepository.delete({
        usuario: { id: usuario.id },
        usado: false,
      });

      const tokenPlano = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto
        .createHash('sha256')
        .update(tokenPlano)
        .digest('hex');
      const fechaExpiracion = new Date(
        Date.now() + DURACION_TOKEN_MINUTOS * 60 * 1000,
      );

      const nuevoToken = this.passwordResetTokenRepository.create({
        tokenHash,
        usuario,
        fechaExpiracion,
      });
      await this.passwordResetTokenRepository.save(nuevoToken);

      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      const linkRecuperacion = `${frontendUrl}/restablecer-password?token=${tokenPlano}`;

      await this.notificacionesService.enviarCorreo(
        usuario.email,
        'Recuperación de contraseña',
        `<p>Hola ${usuario.nombre},</p>
         <p>Recibimos una solicitud para restablecer tu contraseña. Este enlace es válido por ${DURACION_TOKEN_MINUTOS} minutos:</p>
         <p><a href="${linkRecuperacion}">${linkRecuperacion}</a></p>
         <p>Si no solicitaste esto, puedes ignorar este correo.</p>`,
      );
    }

    return {
      mensaje:
        'Si el correo existe en nuestro sistema, se enviaron instrucciones para restablecer la contraseña',
    };
  }

  async restablecerPassword(token: string, nuevaPassword: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const tokenGuardado = await this.passwordResetTokenRepository.findOne({
      where: {
        tokenHash,
        usado: false,
        fechaExpiracion: MoreThan(new Date()),
      },
      relations: { usuario: true },
    });

    if (!tokenGuardado) {
      throw new BadRequestException('Token inválido o expirado');
    }

    const passwordHasheado = await bcrypt.hash(nuevaPassword, 10);
    await this.usuarioService.actualizarPassword(
      tokenGuardado.usuario.id,
      passwordHasheado,
    );

    tokenGuardado.usado = true;
    await this.passwordResetTokenRepository.save(tokenGuardado);

    return { mensaje: 'Contraseña actualizada correctamente' };
  }
}