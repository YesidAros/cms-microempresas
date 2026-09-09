import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmpresaService } from './empresa.service';
import { EmpresaController } from './empresa.controller';
import { Empresa } from './entities/empresa.entity';
import { ArchivosModule } from '../archivos/archivos.module';

@Module({
  imports: [TypeOrmModule.forFeature([Empresa]), ArchivosModule],
  controllers: [EmpresaController],
  providers: [EmpresaService],
})
export class EmpresaModule {}