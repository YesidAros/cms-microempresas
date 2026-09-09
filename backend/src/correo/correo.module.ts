import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CorreoService } from './correo.service';
import { CorreoController } from './correo.controller';
import { Correo } from './entities/correo.entity';
import { Empresa } from '../empresa/entities/empresa.entity';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [TypeOrmModule.forFeature([Correo, Empresa]), NotificacionesModule],
  controllers: [CorreoController],
  providers: [CorreoService],
})
export class CorreoModule {}