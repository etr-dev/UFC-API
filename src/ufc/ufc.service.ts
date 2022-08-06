import { Injectable } from '@nestjs/common';
import { scrapeUfcPage } from 'src/utils/scraper';

@Injectable()
export class UfcService {
  async nextEvent() {
    const scraped = await scrapeUfcPage('https://www.ufc.com/event/ufc-277', false);
    return scraped;
  }
}
