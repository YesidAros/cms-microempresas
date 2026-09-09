import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoticiasService } from './noticias.service';
import { NoticiasController } from './noticias.controller';
import { Noticia } from './entities/noticia.entity';
import { Empresa } from '../empresa/entities/empresa.entity';
import { ArchivosModule } from '../archivos/archivos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Noticia, Empresa]),
    ArchivosModule,
  ],
  controllers: [NoticiasController],
  providers: [NoticiasService],
})
export class NoticiasModule {}