import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UfcService } from './ufc.service';
import { CreateUfcDto } from './dto/create-ufc.dto';
import { UpdateUfcDto } from './dto/update-ufc.dto';
import { logServer } from 'src/utils/log';
import { GetUfcEventResponse, GetUfcEventsResponse } from './models/responses/eventResponse.response';

@Controller('ufc')
export class UfcController {
  constructor(private readonly ufcService: UfcService) {}
  @Get('nextEvent')
  nextEvent(): Promise<GetUfcEventResponse> {
    logServer('Next Event endpoint hit');
    return this.ufcService.nextEvent();
  }

  @Get('eventByUrl')
  eventByUrl(@Query() query): Promise<GetUfcEventResponse> {
    const url: string = query.url;
    logServer('Event by URL endpoint hit');
    return this.ufcService.eventByUrl(url);
  }

  @Get('allEvents')
  allEvents(): Promise<GetUfcEventsResponse> {
    logServer('allEvents endpoint hit');
    return this.ufcService.allEvents();
  }
}
