import { debug } from "console";
import { FancastPlayer } from "../fancast/models/fancast-player";
import { FancastDraftSquad } from "../FANCAST/models/fancast_draft_squad";
import { Player, Club, FPLBase } from "./fpl";

export enum DraftStatuses {
  NotStarted = 1,
  Waiting = 2,
  PreDraft = 3,
  Drafting = 4,
  DraftingComplete = 5,
  Timeout = 6,
  SealedBids = 7,
  CheckingBids = 8,
  BidsReceived = 9,
  FinalChance = 10,
  SigningComplete = 11,
  SigningFailed = 12
}

export class Draft {
  id: number;
  draft_name: string;
  draft_manager_id: number;
  draft_round: number;
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
  team_fpl_id: number;

  draft_manager_picks: DraftManagerPick[];
  draft_manager_favourites: DraftManagerFavourite[];
  draft_squad: DraftSquad;
  fancast_draft_squad: FancastDraftSquad;

  bid: number;

  more_info: DraftManagerMoreInfo;

  // special:
  has_picked_this_round: boolean;
}
export class DraftManagerMoreInfo {
  intro_audio: string;
  main_audio: string;
  announce_audio: string;
}
export class DraftManagerPick {
  id: number;
  nominator_id: number;
  draft_manager_id: number;
  draft_id: number;
  player_id: number;
  pick_order: number;
  player_name: string;
  value_price: number;
  signed_price: number;
  player: Player;
  fancast_player: FancastPlayer;
  sealed_bids: SealedBid[];
}
export class SealedBid {
  draft_manager_id: number;
  draft_manager_name: string;
  draft_manager_team: string;
  player_id: number;
  player_name: string;
  bid_amount: number;
  bid_eligible: boolean = true;
  is_max_bid: boolean = false;
}
export class DraftManagerFavourite {
  id: number;
  draft_manager_id: number;
  player_id: number;
  player: Player;
}
export class DraftSquad {
  gk_1: DraftManagerPick;
  gk_2: DraftManagerPick;
  def_1: DraftManagerPick;
  def_2: DraftManagerPick;
  def_3: DraftManagerPick;
  def_4: DraftManagerPick;
  def_5: DraftManagerPick;
  mid_1: DraftManagerPick;
  mid_2: DraftManagerPick;
  mid_3: DraftManagerPick;
  mid_4: DraftManagerPick;
  mid_5: DraftManagerPick;
  fw_1: DraftManagerPick;
  fw_2: DraftManagerPick;
  fw_3: DraftManagerPick;

  num_of_picks: number;
  budget_spent: number;
  budget_remaining: number;
  budget_per_player: number;
}
export class SquadTicker {
  ticker_manager: DraftManager;
  ticker_squad: DraftSquad;
  ticker_index: number;
  ticker_direction: boolean = false;
  ticker_timer: number;
  ticker_timeout: NodeJS.Timeout;
}
export class RoundPicks {
  round: number;
  draft_managers: DraftManager[];
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
    basicDraft.draft_round = draft.draft_round;
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
    basicManager.team_fpl_id = draft.draft_manager.team_fpl_id;
    //basicManager.more_info.announce_audio = draft.draft_manager.more_info.announce_audio;
    //basicManager.more_info.intro_audio = draft.draft_manager.more_info.intro_audio;
    //basicManager.more_info.main_audio = draft.draft_manager.more_info.main_audio;
    basicManager.more_info = draft.draft_manager.more_info;

    basicDraft.draft_manager = basicManager;

    basicDraft.draft_managers = [];
    draft.draft_managers.forEach(dm => {
      basicDraft.draft_managers.push(dm);
    });

    basicDraft.draft_manager_picks = [];
    basicDraft.draft_manager.draft_manager_picks = [];
    draft.draft_manager_picks.forEach(dmp => {
      basicDraft.draft_manager_picks.push(this.getBasicDraftManagerPickObject(dmp, false));
      if (dmp.draft_manager_id == draft.draft_manager.id) {
        basicDraft.draft_manager.draft_manager_picks.push(this.getBasicDraftManagerPickObject(dmp, false));
      }
    });

    if (draft.draft_manager.draft_squad) {
      basicDraft.draft_manager.draft_squad = draft.draft_manager.draft_squad;
    } else {
      basicDraft.draft_manager.draft_squad = this.getDraftSquadForManager(basicDraft.draft_manager);
    }

    return basicDraft;
  }
  static getBasicDraftManagerPickObject(pick: DraftManagerPick, includeManager: boolean = true): DraftManagerPick {
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
    basicPick.nominator_id = pick.nominator_id;
    basicPick.player = basicPlayer;
    basicPick.player.club = basicClub;
    basicPick.draft_id = pick.draft_id;
    basicPick.value_price = pick.value_price;
    basicPick.signed_price = pick.signed_price;
    basicPick.player_name = pick.player_name;

    basicPick.sealed_bids = [];
    pick.sealed_bids?.forEach(sb => {
      basicPick.sealed_bids.push(this.getBasicSealedBidsObject(sb));
    });

    return basicPick;
  }

  static getBasicSealedBidsObject(sealedBid: SealedBid): SealedBid {
    var basicSealedBid = new SealedBid();
    basicSealedBid.draft_manager_id = sealedBid.draft_manager_id;
    basicSealedBid.draft_manager_name = sealedBid.draft_manager_name;
    basicSealedBid.draft_manager_team = sealedBid.draft_manager_team;
    basicSealedBid.player_id = sealedBid.player_id;
    basicSealedBid.player_name = sealedBid.player_name;
    basicSealedBid.bid_amount = sealedBid.bid_amount;
    basicSealedBid.bid_eligible = sealedBid.bid_eligible;
    return basicSealedBid;
  }

  static getDraftPicksForManager(manager: DraftManager, draft: Draft, fplBase: FPLBase): DraftManagerPick[] {
    if (manager && draft.draft_manager_picks) {
      manager.draft_manager_picks = draft.draft_manager_picks?.filter(dmp => dmp.draft_manager_id == manager.id) ?? [];
      manager.draft_manager_picks.forEach(dmp => {
        fplBase.elements.filter(e => e.id == dmp.player_id).forEach(e => {
          e.draft_manager_id = manager.id;
          //e.draft_manager = manager;
          dmp.player = e;
        });
      });
      return manager.draft_manager_picks;
    }

    return undefined;
  }
  static getDraftSquadForManager(manager: DraftManager): DraftSquad {
    var squad = new DraftSquad();

    if (manager?.draft_manager_picks) {
      squad.gk_1 = manager.draft_manager_picks.filter(pick => pick.player.position.id == 1)[0] ?? undefined;
      squad.gk_2 = manager.draft_manager_picks.filter(pick => pick.player.position.id == 1)[1] ?? undefined;
      squad.def_1 = manager.draft_manager_picks.filter(pick => pick.player.position.id == 2)[0] ?? undefined;
      squad.def_2 = manager.draft_manager_picks.filter(pick => pick.player.position.id == 2)[1] ?? undefined;
      squad.def_3 = manager.draft_manager_picks.filter(pick => pick.player.position.id == 2)[2] ?? undefined;
      squad.def_4 = manager.draft_manager_picks.filter(pick => pick.player.position.id == 2)[3] ?? undefined;
      squad.def_5 = manager.draft_manager_picks.filter(pick => pick.player.position.id == 2)[4] ?? undefined;
      squad.mid_1 = manager.draft_manager_picks.filter(pick => pick.player.position.id == 3)[0] ?? undefined;
      squad.mid_2 = manager.draft_manager_picks.filter(pick => pick.player.position.id == 3)[1] ?? undefined;
      squad.mid_3 = manager.draft_manager_picks.filter(pick => pick.player.position.id == 3)[2] ?? undefined;
      squad.mid_4 = manager.draft_manager_picks.filter(pick => pick.player.position.id == 3)[3] ?? undefined;
      squad.mid_5 = manager.draft_manager_picks.filter(pick => pick.player.position.id == 3)[4] ?? undefined;
      squad.fw_1 = manager.draft_manager_picks.filter(pick => pick.player.position.id == 4)[0] ?? undefined;
      squad.fw_2 = manager.draft_manager_picks.filter(pick => pick.player.position.id == 4)[1] ?? undefined;
      squad.fw_3 = manager.draft_manager_picks.filter(pick => pick.player.position.id == 4)[2] ?? undefined;

      squad.num_of_picks = manager.draft_manager_picks.length;
      squad.budget_spent = manager.draft_manager_picks.reduce((sum, current) => sum + current.signed_price, 0);
      squad.budget_remaining = 100 - squad.budget_spent;
      squad.budget_per_player = squad.budget_remaining / (15 - squad.num_of_picks);
    } else {
      squad.num_of_picks = 0;
      squad.budget_spent = 0;
      squad.budget_remaining = 100;
      squad.budget_per_player = 100 / 15;
    }

    return squad;
  }

  static getManagerFromId(draft: Draft, id: number) {
    return draft.draft_managers.find(dm => dm.id == id);
  }

  static setPlayerOwner(player: Player, draftManager: DraftManager): void {
    player.draft_manager_id = draftManager.id;
    player.draft_manager = draftManager;
  }

  static convertStatusToString(status: number): string {
    switch (status) {
      case 1:   return 'Not started';
      case 2:   return 'Waiting';
      case 3:   return 'Pre-draft';
      case 4:   return 'Drafting';
      case 5:   return 'Drafting complete';
      case 6:   return 'TIMEOUT';
      case 7:   return 'Sealed bids';
      case 8:	  return 'Checking bids';
      case 9:	  return 'Bids received';
      case 10:	return 'Final chance';
      case 11:	return 'Signing complete';
      case 12:	return 'Signing failed';
      default:  return 'Unknown';
    }
  }
  static convertStatusToIcon(status: number): string {
    switch (status) {
      case 1: return 'play_circle_outline';
      case 2: return 'access_time';
      case 3: return 'hourglass_top';
      case 4: return 'shopping_cart';
      case 5: return 'check';
      case 6: return 'block';
      default: return 'adb';
    }
  }
}
