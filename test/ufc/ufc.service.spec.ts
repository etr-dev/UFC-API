import { Test, TestingModule } from '@nestjs/testing';
import { UfcService } from '../../src/ufc/ufc.service';

describe('UfcService', () => {
  let service: UfcService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UfcService],
    }).compile();

    service = module.get<UfcService>(UfcService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
