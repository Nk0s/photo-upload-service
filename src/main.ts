import 'dotenv/config';
import { BullModule } from '@nestjs/bull';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const bullConfig = {
    redis: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
    },
  };

  BullModule.registerQueue(bullConfig);

  // Регистрация Bull Board
  BullModule.registerQueue({
    name: 'photo', // замените на реальное имя вашей очереди
    redis: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
    },
  });

  // Добавьте middleware BullBoard
  BullModule.registerQueue({
    name: 'photo', // замените на реальное имя вашей очереди
    redis: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
    },
  });

  await app.listen(3000);
}

bootstrap();
