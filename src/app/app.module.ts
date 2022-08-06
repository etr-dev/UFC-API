import { CacheModule, Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { UfcController } from 'src/ufc/ufc.controller';
import { UfcService } from 'src/ufc/ufc.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [CacheModule.register()],
  controllers: [AppController, UfcController],
  providers: [
    AppService,
    UfcService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
