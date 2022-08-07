import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { logServer } from 'src/utils/log';
import { AppService } from './app.service';

@Controller()
@UseGuards(AuthGuard('api-key'))
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('')
  health(): string {
    logServer('Health Endpoint Hit')
    return this.appService.health();
  }
}
