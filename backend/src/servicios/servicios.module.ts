import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiciosService } from './servicios.service';
import { ServiciosController } from './servicios.controller';
import { Servicio } from './entities/servicio.entity';
import { Empresa } from '../empresa/entities/empresa.entity';
import { ArchivosModule } from '../archivos/archivos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Servicio, Empresa]),
    ArchivosModule,
  ],
  controllers: [ServiciosController],
  providers: [ServiciosService],
})
export class ServiciosModule {}