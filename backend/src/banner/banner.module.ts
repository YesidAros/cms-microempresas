import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BannerService } from './banner.service';
import { BannerController } from './banner.controller';
import { Banner } from './entities/banner.entity';
import { Empresa } from '../empresa/entities/empresa.entity';
import { ArchivosModule } from '../archivos/archivos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Banner, Empresa]),
    ArchivosModule,
  ],
  controllers: [BannerController],
  providers: [BannerService],
})
export class BannerModule {}