import { DraftManager } from "./draft";
export class FPLBase {
  elements: Player[];
  positions: Position[];
  clubs: Club[];
  events: Event[];
}
export class Player {
  id: number;
  name: string;
  first_name: string;
  web_name: string;
  safe_web_name: string;
  now_cost: number;
  code: string;
  photo_url: string;
  draft_manager_id: number;
  total_points: number;
  position: Position;
  draft_manager: DraftManager;
  favourited: boolean;
  club: Club;
}
export class Position {
  id: number;
  singular_name: string;
  singular_name_short: string;
  plural_name: string;
}
export class Club {
  id: number;
  name: string;
  code: string;
  badge_url: string;
}
export class Event {
  id: number;
}
export class H2hLeagueMatch {
  id: number;
  teamAId: number;
  //teamAEntry: H2hLeagueEntry;
  teamAName: string;
  teamBId: number;
  //teamBEntry: H2hLeagueEntry;
  teamBName: string;

  teamALiveScore: number;
  teamBLiveScore: number;

  teamAEntry: Entry;
  teamAManager: DraftManager;
  teamALivePoints: number;
  teamBEntry: Entry;
  teamBManager: DraftManager;
  teamBLivePoints: number;
}
export class H2hLeagueEntry {
  id: number;
  entryId: number;
  entryName: string;
  playerName: string;
  entryObject: Entry;
}
export class Entry {
  id: number;
  playerFirstName: string;
  playerLastName: string;
  teamName: string;
  points: number;
  picks: EntryPicks;
}
export class EntryPicks {
  picks: Pick[];
  livePoints: number;
}
export class Pick {
  playerId: number;
  elementType: number;
  teamPosition: number;
  points: number;
  isCaptain: boolean;
  isViceCaptain: boolean;
  isSub: boolean;
  hasPlayed: boolean;
  multiplier: number;

  minutesPlayed: number;
  currentGameHasStarted: number;
  currentGameHasFinished: number;

  player: Player;
}
