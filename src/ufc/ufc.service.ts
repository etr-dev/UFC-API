import { CacheKey, CacheTTL, CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { SUCCESS_MESSAGE } from 'src/utils/constants';
import { getAllEventLinks, scrapeUfcPage } from 'src/utils/scraper';
import { UfcEvent } from './models/entities/event.entity';
import { GetUfcEventResponse, GetUfcEventsResponse, GetUfcLinksResponse } from './models/responses/eventResponse.response';

@Injectable()
export class UfcService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) { }

  async addToCache<T>(key: string, item: T) {
    await this.cacheManager.set(key, item);
  }

  async getFromCache<T>(key: string): Promise<T> {
    const value: T = await this.cacheManager.get(key);
    return value;
  }

  async isInCache(key: string) {
    return await this.cacheManager.get(key) ? true : false;
  }

  async nextEvent(): Promise<GetUfcEventResponse> {
    const eventLinks: string[] = await getAllEventLinks('https://www.ufc.com/tickets')
    const scraped: UfcEvent = await scrapeUfcPage(eventLinks[0]);
  
    return {message: SUCCESS_MESSAGE, data: scraped}
  }

  async eventByUrl(url: string): Promise<GetUfcEventResponse> {
    const cachedEvent: UfcEvent = await this.getFromCache(url);
    let event: UfcEvent;

    if (cachedEvent) {
      event = cachedEvent;
    } else {
      event = await scrapeUfcPage(url);
      await this.addToCache(url, event);
    }

    return {message: SUCCESS_MESSAGE, data: event}
  }

  async allEvents(): Promise<GetUfcEventsResponse> {
    let allEvents: UfcEvent[] = []

    const eventLinks = await getAllEventLinks('https://www.ufc.com/tickets')
    for (let event of eventLinks) {
      allEvents.push(await scrapeUfcPage(event));
    }

    return {message: SUCCESS_MESSAGE, data: allEvents}
  }

  async allEventLinks(): Promise<GetUfcLinksResponse> {
    let eventLinks: string[] = await getAllEventLinks('https://www.ufc.com/tickets');
    return {message: SUCCESS_MESSAGE, data: eventLinks}
  }
}
