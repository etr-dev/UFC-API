import { Injectable } from '@nestjs/common';
import { SUCCESS_MESSAGE } from 'src/utils/constants';
import { getAllEventLinks, scrapeUfcPage } from 'src/utils/scraper';
import { UfcEvent } from './models/entities/event.entity';
import { GetUfcEventResponse, GetUfcEventsResponse } from './models/responses/eventResponse.response';

@Injectable()
export class UfcService {
  async nextEvent(): Promise<GetUfcEventResponse> {
    const scraped: UfcEvent = await scrapeUfcPage('https://www.ufc.com/tickets', true);
    return {message: SUCCESS_MESSAGE, data: scraped}
  }

  async eventByUrl(url: string): Promise<GetUfcEventResponse> {
    const scraped: UfcEvent = await scrapeUfcPage(url);
    return {message: SUCCESS_MESSAGE, data: scraped}
  }

  async allEvents(): Promise<GetUfcEventsResponse> {
    const eventLinks: string[] = await getAllEventLinks('https://www.ufc.com/tickets')

    let scraped: UfcEvent[] = [];
    for (let event of eventLinks) {
      scraped.push(await scrapeUfcPage(event));
    }

    return {message: SUCCESS_MESSAGE, data: scraped}
  }

  async allEventLinks() {
    const eventLinks: string[] = await getAllEventLinks('https://www.ufc.com/tickets')
    return {message: SUCCESS_MESSAGE, data: eventLinks}
  }
}
