import './instrument';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const esProduccion = configService.get<string>('NODE_ENV') === 'production';

  app.use(
    helmet({
      // En produccion usamos el CSP por defecto de Helmet (mas seguro).
      // En desarrollo lo desactivamos porque rompe los scripts/estilos
      // inline de Swagger UI, que solo se expone fuera de produccion.
      contentSecurityPolicy: esProduccion ? undefined : false,
    }),
  );

  app.enableCors({
    origin: process.env.FRONTEND_URL,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  if (!esProduccion) {
    const config = new DocumentBuilder()
      .setTitle('CMS Microempresas API')
      .setDescription(
        'API para el sistema de gestion de contenido de microempresas',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();