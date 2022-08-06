import { Controller, Get } from '@nestjs/common';
import { logServer } from 'src/utils/log';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('')
  health(): string {
    logServer('Health Endpoint Hit')
    return this.appService.health();
  }
}
