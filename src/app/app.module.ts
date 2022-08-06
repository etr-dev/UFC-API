import { Module } from '@nestjs/common';
import { UfcController } from 'src/ufc/ufc.controller';
import { UfcService } from 'src/ufc/ufc.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController, UfcController],
  providers: [AppService, UfcService],
})
export class AppModule {}
