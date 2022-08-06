import { Injectable } from '@nestjs/common';
import { HealthResponse } from 'src/utils/constants';

@Injectable()
export class AppService {
  health(): string {
    return HealthResponse;
  }
}
