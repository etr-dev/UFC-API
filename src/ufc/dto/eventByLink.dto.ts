import { IsInt, IsString, IsUrl } from "class-validator";

export class EventByLinkDto {
    @IsUrl()
    @IsString()
    url: string;
}