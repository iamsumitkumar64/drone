import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { initializeTransactionalContext, StorageDriver } from 'typeorm-transactional';
import cookieParser from 'cookie-parser';
import { CommonExceptionFilter } from './infrastructure/exception-filter/common-exception/common-exception.filter.js';

async function bootstrap() {
  initializeTransactionalContext({ storageDriver: StorageDriver.ASYNC_LOCAL_STORAGE });

  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  app.use(cookieParser());

  const configService = app.get(ConfigService);

  app.enableCors({
    origin: [configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'authorization', 'Authorization'],
  });

  app.useGlobalPipes(new ValidationPipe({
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
    whitelist: true,
    transform: true,
  }));

  app.useGlobalFilters(new CommonExceptionFilter());

  const port = configService.get<number>('PORT') ?? 8090;
  await app.listen(port);
}
await bootstrap();
