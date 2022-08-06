import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { config } from 'dotenv';
import { UfcModule } from './ufc/ufc.module';
import { startBrowser } from './utils/scraper';

config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.APP_PORT);
  console.log(`App Started on port ${process.env.APP_PORT}`)
  await startBrowser();
  console.log(`Browser Started`)
}
bootstrap();
