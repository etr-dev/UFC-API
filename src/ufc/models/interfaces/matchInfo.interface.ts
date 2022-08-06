import { UfcFighterInfo } from "./fighterInfor.interface";
import { UfcMatchDetails } from "./matchDetails.interface";

export interface UfcMatchInfo {
    Details: UfcMatchDetails;

    Red: UfcFighterInfo;
    
    Blue: UfcFighterInfo;
}