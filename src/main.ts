import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { config } from 'dotenv';
import { UfcModule } from './ufc/ufc.module';
import { startBrowser } from './utils/scraper';
import { logServer } from './utils/log';
import { ValidationPipe } from '@nestjs/common';

config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT || 8080);
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    validateCustomDecorators: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    stopAtFirstError: true,
    transformOptions: {enableImplicitConversion: true},
  }))
  await startBrowser();
  logServer(`App Started on port ${process.env.PORT}`);
  logServer(`Browser Initialized`);
}
bootstrap();
