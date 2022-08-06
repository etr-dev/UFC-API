import { Test, TestingModule } from '@nestjs/testing';
import { UfcController } from './ufc.controller';
import { UfcService } from './ufc.service';

describe('UfcController', () => {
  let controller: UfcController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UfcController],
      providers: [UfcService],
    }).compile();

    controller = module.get<UfcController>(UfcController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
