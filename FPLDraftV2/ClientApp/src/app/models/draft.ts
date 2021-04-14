import { FancastPlayer } from "../fancast/models/fancast-player";
import { FancastDraftSquad } from "../FANCAST/models/fancast_draft_squad";
import { Player, Club } from "./fpl";
export class Draft {
  id: number;
  draft_name: string;
  draft_manager_id: number;
  status_id: number;
  direction: boolean;
  passcode: string;
  draft_manager: DraftManager;
  draft_managers: DraftManager[];
  draft_manager_picks: DraftManagerPick[];
  draft_manager_favourites: DraftManagerFavourite[];
}
export class DraftManager {
  id: number;
  draft_id: number;
  name: string;
  team_name: string;
  draft_seed: number;
  team_nickname: string;
  team_image_url: string;
  manager_image_url: string;
  team_colour_1: string;
  team_colour_2: string;
  draft_manager_picks: DraftManagerPick[];
  draft_manager_favourites: DraftManagerFavourite[];
  draft_squad: DraftSquad;
  fancast_draft_squad: FancastDraftSquad;
}
export class DraftManagerPick {
  id: number;
  draft_manager_id: number;
  player_id: number;
  pick_order: number;
  player_name: string;
  player: Player;
  fancast_player: FancastPlayer;
}
export class DraftManagerFavourite {
  id: number;
  draft_manager_id: number;
  player_id: number;
  player: Player;
}
export class DraftSquad {
  gk_1: Player;
  gk_2: Player;
  def_1: Player;
  def_2: Player;
  def_3: Player;
  def_4: Player;
  def_5: Player;
  mid_1: Player;
  mid_2: Player;
  mid_3: Player;
  mid_4: Player;
  mid_5: Player;
  fw_1: Player;
  fw_2: Player;
  fw_3: Player;
}
export class SquadTicker {
  ticker_manager: DraftManager;
  ticker_squad: DraftSquad;
  ticker_index: number;
  ticker_direction: boolean = false;
  ticker_timer: number;
  ticker_timeout: NodeJS.Timeout;
}
export class FancastSquadTicker {
  ticker_manager: DraftManager;
  ticker_squad: FancastDraftSquad;
  ticker_index: number;
  ticker_direction: boolean = false;
  ticker_timer: number;
  ticker_timeout: NodeJS.Timeout;
}
export class DraftFunctions {
  static getBasicDraftObject(draft: Draft): Draft {
    var basicDraft = new Draft();
    basicDraft.id = draft.id;
    basicDraft.direction = draft.direction;
    basicDraft.draft_manager_id = draft.draft_manager_id;
    basicDraft.draft_name = draft.draft_name;
    basicDraft.passcode = draft.passcode;
    basicDraft.status_id = draft.status_id;
    var basicManager = new DraftManager();
    basicManager.id = draft.draft_manager.id;
    basicManager.draft_id = draft.id;
    basicManager.draft_seed = draft.draft_manager.draft_seed;
    basicManager.name = draft.draft_manager.name;
    basicManager.team_name = draft.draft_manager.team_name;
    basicManager.team_nickname = draft.draft_manager.team_nickname;
    basicManager.team_image_url = draft.draft_manager.team_image_url;
    basicManager.manager_image_url = draft.draft_manager.manager_image_url;
    basicManager.team_colour_1 = draft.draft_manager.team_colour_1;
    basicManager.team_colour_2 = draft.draft_manager.team_colour_2;
    basicDraft.draft_manager = basicManager;
    return basicDraft;
  }
  static getBasicDraftManagerPickObject(pick: DraftManagerPick): DraftManagerPick {
    var basicClub = new Club();
    basicClub.id = pick.player.club.id;
    basicClub.code = pick.player.club.code;
    basicClub.name = pick.player.club.name;
    basicClub.badge_url = pick.player.club.badge_url;
    var basicPlayer = new Player();
    basicPlayer.id = pick.player_id;
    basicPlayer.name = pick.player.name;
    basicPlayer.first_name = pick.player.first_name;
    basicPlayer.web_name = pick.player.web_name;
    basicPlayer.position = pick.player.position;
    basicPlayer.club = pick.player.club;
    basicPlayer.photo_url = pick.player.photo_url;
    basicPlayer.now_cost = pick.player.now_cost;
    basicPlayer.photo_url = pick.player.photo_url;
    basicPlayer.code = pick.player.code;
    var basicPick = new DraftManagerPick();
    basicPick.id = pick.id;
    basicPick.player_id = pick.player_id;
    basicPick.pick_order = pick.pick_order;
    basicPick.draft_manager_id = pick.draft_manager_id;
    basicPick.player = basicPlayer;
    basicPick.player.club = basicClub;
    return basicPick;
  }
  static getDraftSquadForManager(manager: DraftManager): DraftSquad {
    var squad = new DraftSquad();
    if (manager.draft_manager_picks) {
      if (manager.draft_manager_picks.filter(pick => pick.player.position.id == 1)[0])
        squad.gk_1 = manager.draft_manager_picks.filter(pick => pick.player.position.id == 1)[0].player;
      if (manager.draft_manager_picks.filter(pick => pick.player.position.id == 1)[1])
        squad.gk_2 = manager.draft_manager_picks.filter(pick => pick.player.position.id == 1)[1].player;
      if (manager.draft_manager_picks.filter(pick => pick.player.position.id == 2)[0])
        squad.def_1 = manager.draft_manager_picks.filter(pick => pick.player.position.id == 2)[0].player;
      if (manager.draft_manager_picks.filter(pick => pick.player.position.id == 2)[1])
        squad.def_2 = manager.draft_manager_picks.filter(pick => pick.player.position.id == 2)[1].player;
      if (manager.draft_manager_picks.filter(pick => pick.player.position.id == 2)[2])
        squad.def_3 = manager.draft_manager_picks.filter(pick => pick.player.position.id == 2)[2].player;
      if (manager.draft_manager_picks.filter(pick => pick.player.position.id == 2)[3])
        squad.def_4 = manager.draft_manager_picks.filter(pick => pick.player.position.id == 2)[3].player;
      if (manager.draft_manager_picks.filter(pick => pick.player.position.id == 2)[4])
        squad.def_5 = manager.draft_manager_picks.filter(pick => pick.player.position.id == 2)[4].player;
      if (manager.draft_manager_picks.filter(pick => pick.player.position.id == 3)[0])
        squad.mid_1 = manager.draft_manager_picks.filter(pick => pick.player.position.id == 3)[0].player;
      if (manager.draft_manager_picks.filter(pick => pick.player.position.id == 3)[1])
        squad.mid_2 = manager.draft_manager_picks.filter(pick => pick.player.position.id == 3)[1].player;
      if (manager.draft_manager_picks.filter(pick => pick.player.position.id == 3)[2])
        squad.mid_3 = manager.draft_manager_picks.filter(pick => pick.player.position.id == 3)[2].player;
      if (manager.draft_manager_picks.filter(pick => pick.player.position.id == 3)[3])
        squad.mid_4 = manager.draft_manager_picks.filter(pick => pick.player.position.id == 3)[3].player;
      if (manager.draft_manager_picks.filter(pick => pick.player.position.id == 3)[4])
        squad.mid_5 = manager.draft_manager_picks.filter(pick => pick.player.position.id == 3)[4].player;
      if (manager.draft_manager_picks.filter(pick => pick.player.position.id == 4)[0])
        squad.fw_1 = manager.draft_manager_picks.filter(pick => pick.player.position.id == 4)[0].player;
      if (manager.draft_manager_picks.filter(pick => pick.player.position.id == 4)[1])
        squad.fw_2 = manager.draft_manager_picks.filter(pick => pick.player.position.id == 4)[1].player;
      if (manager.draft_manager_picks.filter(pick => pick.player.position.id == 4)[2])
        squad.fw_3 = manager.draft_manager_picks.filter(pick => pick.player.position.id == 4)[2].player;
    }
    return squad;
  }
}
