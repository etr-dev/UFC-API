import { Module } from '@nestjs/common';
import { UfcService } from './ufc.service';
import { UfcController } from './ufc.controller';

@Module({
  controllers: [UfcController],
  providers: [UfcService]
})
export class UfcModule {}
