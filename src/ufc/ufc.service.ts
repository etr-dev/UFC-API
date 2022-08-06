import { Injectable } from '@nestjs/common';
import { CreateUfcDto } from './dto/create-ufc.dto';
import { UpdateUfcDto } from './dto/update-ufc.dto';

@Injectable()
export class UfcService {
  nextEvent() {
    return `This action returns the next ufc event`;
  }
}
