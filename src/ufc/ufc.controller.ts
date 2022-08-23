import {
  Controller,
  Get,
  Query,
  CacheKey,
  CacheTTL,
  CacheInterceptor,
  UseInterceptors,
  createParamDecorator,
  UseGuards,
} from '@nestjs/common';
import { UfcService } from './ufc.service';
import { logServer } from 'src/utils/log';
import { GetUfcEventResponse, GetUfcEventsResponse, GetUfcLinksResponse } from './models/responses/eventResponse.response';
import { EventByLinkDto } from './dto/eventByLink.dto';
import { AuthGuard } from '@nestjs/passport';

const URL = createParamDecorator((data, req) => {
  const result = new EventByLinkDto();
  result.url = req.query.url;
  return result;
});


@Controller('ufc')
@UseGuards(AuthGuard('api-key'))
@UseInterceptors(CacheInterceptor)
export class UfcController {
  constructor(private readonly ufcService: UfcService) { }
  @CacheKey('nextEvent')
  @CacheTTL(600)
  @Get('nextEvent')
  nextEvent(): Promise<GetUfcEventResponse> {
    logServer('Next Event endpoint hit');
    return this.ufcService.nextEvent();
  }

  @Get('eventByUrl')
  eventByUrl(@Query() query: EventByLinkDto): Promise<GetUfcEventResponse> {
    logServer('Event by URL endpoint hit');
    return this.ufcService.eventByUrl(query.url);
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
