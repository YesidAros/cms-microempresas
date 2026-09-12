import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SolicitarRecuperacionDto } from './dto/solicitar-recuperacion.dto';
import { RestablecerPasswordDto } from './dto/restablecer-password.dto';
import { CambiarPasswordDto } from './dto/cambiar-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

interface RequestConUsuario extends Request {
  user: { id: number; email: string; rol: string };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('solicitar-recuperacion')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  solicitarRecuperacion(
    @Body() solicitarRecuperacionDto: SolicitarRecuperacionDto,
  ) {
    return this.authService.solicitarRecuperacion(
      solicitarRecuperacionDto.email,
    );
  }

  @Post('restablecer-password')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  restablecerPassword(@Body() restablecerPasswordDto: RestablecerPasswordDto) {
    return this.authService.restablecerPassword(
      restablecerPasswordDto.token,
      restablecerPasswordDto.nuevaPassword,
    );
  }

  @Post('cambiar-password')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  cambiarPassword(
    @Req() request: RequestConUsuario,
    @Body() cambiarPasswordDto: CambiarPasswordDto,
  ) {
    return this.authService.cambiarPassword(
      request.user.id,
      cambiarPasswordDto.passwordActual,
      cambiarPasswordDto.passwordNueva,
    );
  }
}