import { CacheModule, Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { AuthModule } from 'src/auth/auth.module';
import { UfcController } from 'src/ufc/ufc.controller';
import { UfcService } from 'src/ufc/ufc.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [ConfigModule.forRoot(), CacheModule.register(), AuthModule],
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
