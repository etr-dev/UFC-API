import { Injectable } from '@nestjs/common';
import { SUCCESS_MESSAGE } from 'src/utils/constants';
import { scrapeAllEvents, scrapeUfcPage } from 'src/utils/scraper';
import { UfcEvent } from './models/entities/event.entity';
import { GetUfcEventResponse, GetUfcEventsResponse } from './models/responses/eventResponse.response';

@Injectable()
export class UfcService {
  async nextEvent(): Promise<GetUfcEventResponse> {
    const scraped: UfcEvent = await scrapeUfcPage('https://www.ufc.com/tickets', true);
    return {message: SUCCESS_MESSAGE, data: scraped}
  }

  async eventByUrl(url: string): Promise<GetUfcEventResponse> {
    const scraped: UfcEvent = await scrapeUfcPage(url, false);
    return {message: SUCCESS_MESSAGE, data: scraped}
  }

  async allEvents(): Promise<GetUfcEventsResponse> {
    const scraped: UfcEvent[] = await scrapeAllEvents('https://www.ufc.com/tickets');
    return {message: SUCCESS_MESSAGE, data: scraped}
  }
}
