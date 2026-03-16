import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Зоомагазин API')
    .setDescription('Документация API для зоомагазина')
    .setVersion('1.0')
    .addTag('api')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(5000, '0.0.0.0');
  console.log(`Сервер запущен на порту 5000`);
  console.log(`Swagger документация: http://localhost:5000/api/docs`);
}
bootstrap();