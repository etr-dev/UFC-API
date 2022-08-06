import { PickType } from '@nestjs/mapped-types';
import { UfcEvent } from '../entities/event.entity';

export class BaseUfcEventResponse {
  message: string;
}

export class GetUfcEventSuccessResponse extends PickType(BaseUfcEventResponse, [
  'message',
] as const) {
  data: UfcEvent;
}

export class GetUfcEventsSuccessResponse extends PickType(BaseUfcEventResponse, [
    'message',
  ] as const) {
    data: UfcEvent[];
}

export class GetUfcLinksSuccessResponse extends PickType(BaseUfcEventResponse, [
  'message',
] as const) {
  data: string[];
}
  
export class GetUfcEventErrorResponse extends PickType(BaseUfcEventResponse, [
  'message',
] as const) {}

export type GetUfcEventResponse = GetUfcEventSuccessResponse | GetUfcEventErrorResponse
export type GetUfcEventsResponse = GetUfcEventsSuccessResponse | GetUfcEventErrorResponse
export type GetUfcLinksResponse = GetUfcLinksSuccessResponse | GetUfcEventErrorResponse