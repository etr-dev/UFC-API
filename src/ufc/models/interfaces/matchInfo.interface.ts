import { UfcFighterInfo } from "./fighterInfor.interface";
import { UfcMatchDetails } from "./matchDetails.interface";

export interface UfcMatchInfo {
    details: UfcMatchDetails;

    Red: UfcFighterInfo;
    
    Blue: UfcFighterInfo;
}