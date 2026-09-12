import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';
import { Cliente } from './entities/cliente.entity';
import { Empresa } from '../empresa/entities/empresa.entity';
import { ArchivosModule } from '../archivos/archivos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cliente, Empresa]),
    ArchivosModule,
  ],
  controllers: [ClientesController],
  providers: [ClientesService],
})
export class ClientesModule {}