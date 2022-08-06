import { PartialType } from '@nestjs/mapped-types';
import { CreateUfcDto } from './create-ufc.dto';

export class UpdateUfcDto extends PartialType(CreateUfcDto) {}
