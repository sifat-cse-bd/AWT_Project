import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //validation pipe for use globally
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  //Swagger UI setup
  const config = new DocumentBuilder().setTitle('Chemistry Lab Management and Inventory API').build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('ChemFlow-api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
