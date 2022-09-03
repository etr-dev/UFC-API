import { Outcomes } from "../enums/outcome.enum";

export interface UfcFighterInfo {
    name: string;
    odds: string;
    outcome: Outcomes;
    image: string;
}