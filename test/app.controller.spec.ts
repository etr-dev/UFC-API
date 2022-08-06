import { Test, TestingModule } from '@nestjs/testing';
import { HealthResponse } from 'src/utils/constants';
import { AppController } from '../src/app/app.controller';
import { AppService } from '../src/app/app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should respond', () => {
      expect(appController.health()).toBe(HealthResponse);
    });
  });
});
