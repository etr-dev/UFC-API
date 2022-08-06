import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UfcService } from './ufc.service';
import { CreateUfcDto } from './dto/create-ufc.dto';
import { UpdateUfcDto } from './dto/update-ufc.dto';

@Controller('ufc')
export class UfcController {
  constructor(private readonly ufcService: UfcService) {}
  @Get('nextEvent')
  nextEvent() {
    return this.ufcService.nextEvent();
  }
}
