import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  CacheKey,
  CacheTTL,
  CacheInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { UfcService } from './ufc.service';
import { CreateUfcDto } from './dto/create-ufc.dto';
import { UpdateUfcDto } from './dto/update-ufc.dto';
import { logServer } from 'src/utils/log';
import { GetUfcEventResponse, GetUfcEventsResponse, GetUfcLinksResponse } from './models/responses/eventResponse.response';

@Controller('ufc')
@UseInterceptors(CacheInterceptor)
export class UfcController {
  constructor(private readonly ufcService: UfcService) { }
  @CacheKey('nextEvent')
  @CacheTTL(60)
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

  @CacheKey('allEvents')
  @CacheTTL(3600)
  @Get('allEvents')
  allEvents(): Promise<GetUfcEventsResponse> {
    logServer('allEvents endpoint hit');
    return this.ufcService.allEvents();
  }

  @CacheKey('allEventLinks')
  @CacheTTL(10)
  @Get('allEventLinks')
  allEventLinks(): Promise<GetUfcLinksResponse>  {
    logServer('allEvents endpoint hit');
    return this.ufcService.allEventLinks();
  }
}
