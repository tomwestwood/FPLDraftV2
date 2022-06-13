import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { DraftManagerFavourite, Draft, DraftManagerPick, DraftFunctions, DraftManager, DraftStatuses, RoundPicks, SealedBid } from '../../models/draft';
import { FplService } from '../../services/fpl.service';
import { SignalRService } from '../../services/signalR.service';
import { FPLBase } from '../../models/fpl';
import { DraftService } from '../../services/draft.service';
import { stat } from 'fs';

@Injectable({ providedIn: 'root' })
export class DraftControllerService {
  draft: BehaviorSubject<Draft> = new BehaviorSubject<Draft>(undefined);
  fplBase: BehaviorSubject<FPLBase> = new BehaviorSubject<FPLBase>(undefined);
  pick: BehaviorSubject<DraftManagerPick> = new BehaviorSubject<DraftManagerPick>(undefined);
  status: BehaviorSubject<DraftStatuses> = new BehaviorSubject<DraftStatuses>(undefined); 

  startDraftTimer = new EventEmitter<boolean>();
  stopDraftTimer = new EventEmitter<boolean>();
  startSealedBidsTimer = new EventEmitter<boolean>();
  stopSealedBidsTimer = new EventEmitter<boolean>();

  constructor(private http: HttpClient, private fplService: FplService, private draftService: DraftService, private signalRService: SignalRService) {
    this.subscribeToEvents();
  }

  getDraft(draftId: number): void {
    this.fplService.getFplBase().subscribe((fplBase: FPLBase) => {

      this.fplBase.next(fplBase);

      this.draftService.getDraftById(draftId).subscribe((draft: Draft) => {
        draft.draft_manager = draft.draft_managers.find(dm => dm.id == draft.draft_manager_id);
        draft.draft_manager_picks.forEach(dmp => dmp.player = fplBase.elements.find(e => e.id == dmp.player_id));
        draft.draft_manager.draft_manager_picks = DraftFunctions.getDraftPicksForManager(draft.draft_manager, draft, this.fplBase.value);
        draft.draft_manager.draft_squad = DraftFunctions.getDraftSquadForManager(draft.draft_manager);
        draft.draft_managers.forEach(dm => dm.draft_manager_picks = draft.draft_manager_picks.filter(dmp => dmp.draft_manager_id == dm.id));
        this.draft.next(draft);
      });

    });
  }

  saveDraft(draft: Draft): Observable<Draft> {
    return this.draftService.updateDraft(draft);
  }

  savePick(pick: DraftManagerPick): Observable<DraftManagerPick> {
    return this.draftService.savePick(pick);
  }

  updatePick(pick: DraftManagerPick): Observable<DraftManagerPick> {
    return this.draftService.updatePick(pick);
  }

  setDraftStatus(status: DraftStatuses) {
    this.draft.value.status_id = status;
    this.status.next(status);

    this.saveDraft(this.draft.value).subscribe((draft: Draft) => {
      this.updateDraftStatusNotification(status);
    });
  }

  setNextDraftManager(): void {
    let draft_managers = this.draft.value.draft_managers;
    draft_managers.forEach(dm => {
      dm.draft_manager_picks = this.draft.value.draft_manager_picks.filter(dmp => dmp.draft_manager_id == dm.id)
        .map((dmp: DraftManagerPick) => DraftFunctions.getBasicDraftManagerPickObject(dmp));
    });

    let current_seed = this.draft.value.draft_manager.draft_seed;
    let draft_round = this.draft.value.draft_round;
    let draft_direction = this.draft.value.direction;
    let managers_with_pick_left_this_round = this.getRemainingDraftManagersInRound(draft_managers, draft_round, current_seed, draft_direction);    

    if (this.draft.value.status_id == DraftStatuses.Timeout && managers_with_pick_left_this_round.some(dm => dm.id == this.draft.value.draft_manager_id)) {
      managers_with_pick_left_this_round.splice(managers_with_pick_left_this_round.findIndex(dm => dm.id == this.draft.value.draft_manager_id), 1);
    }

    if (managers_with_pick_left_this_round.length > 0) {
      let next_manager = draft_direction
        ? managers_with_pick_left_this_round.reduce((p, c) => p.draft_seed > c.draft_seed ? p : c)
        : managers_with_pick_left_this_round.reduce((p, c) => p.draft_seed < c.draft_seed ? p : c);
      this.draft.value.draft_manager = next_manager;
      this.draft.value.draft_manager_id = next_manager.id;
    } else {
      this.draft.value.direction = !this.draft.value.direction;
      this.draft.value.draft_round = this.draft.value.draft_round + 1;
      let next_manager = draft_direction
        ? draft_managers.reduce((p, c) => p.draft_seed < c.draft_seed ? p : c)
        : draft_managers.reduce((p, c) => p.draft_seed > c.draft_seed ? p : c);
      this.draft.value.draft_manager = next_manager;
      this.draft.value.draft_manager_id = next_manager.id;
    }

    this.draft.value.draft_manager.draft_squad = DraftFunctions.getDraftSquadForManager(this.draft.value.draft_manager);
    this.saveDraft(this.draft.value).subscribe((draft: Draft) => {
      this.updateDraftNotification(this.draft.value);
    });
  }

  getCurrentPick(): DraftManagerPick {
    let current_pick = this.draft.value.draft_manager_picks.filter(dmp => dmp.nominator_id == this.draft.value.draft_manager_id && dmp.pick_order == this.draft.value.draft_round).reduce((p, c) => p.id > c.id ? p : c);
    if (current_pick) {
      current_pick.player = this.fplBase.value.elements.find(p => p.id == current_pick.player_id);

      if (current_pick.sealed_bids?.length > 0) {
        this.getMaxBid(current_pick);
      }
    }

    return current_pick;
  }

  getNext12Picks(): RoundPicks[] {
    let roundPicks: RoundPicks[] = [];

    let draft_managers = this.draft.value.draft_managers;
    draft_managers.forEach(dm => {
      dm.draft_manager_picks = this.draft.value.draft_manager_picks.filter(dmp => dmp.draft_manager_id == dm.id)
        .map((dmp: DraftManagerPick) => DraftFunctions.getBasicDraftManagerPickObject(dmp));
    });

    let current_seed = this.draft.value.draft_manager.draft_seed;
    let draft_round = this.draft.value.draft_round;
    let draft_direction = this.draft.value.direction;

    let managers_with_pick_left_this_round = this.getRemainingDraftManagersInRound(draft_managers, draft_round, current_seed, draft_direction);
    let roundPick = new RoundPicks();
    roundPick.round = draft_round;
    roundPick.draft_managers = managers_with_pick_left_this_round;
    roundPicks.push(roundPick);

    if (!(roundPicks.length >= draft_managers.length)) {
      let remaining_picks = draft_managers.length - managers_with_pick_left_this_round.length;
      draft_round++;
      draft_direction = !draft_direction;
      current_seed = draft_direction ? 12 : 1;

      managers_with_pick_left_this_round = this.getRemainingDraftManagersInRound(draft_managers, draft_round, current_seed, draft_direction).slice(0, remaining_picks);
      let roundPick = new RoundPicks();
      roundPick.round = draft_round;
      roundPick.draft_managers = managers_with_pick_left_this_round;
      roundPicks.push(roundPick);
    }

    return roundPicks;
  }

  getRoundPickStatus(): DraftManager[] {
    let draft_managers = this.draft.value.draft_managers;
    draft_managers.forEach(dm => {
      dm.draft_manager_picks = this.draft.value.draft_manager_picks.filter(dmp => dmp.draft_manager_id == dm.id)
        .map((dmp: DraftManagerPick) => DraftFunctions.getBasicDraftManagerPickObject(dmp));
    });

    let draft_round = this.draft.value.draft_round;
    let draft_direction = this.draft.value.direction;

    draft_managers.forEach(dm => {
      dm.has_picked_this_round = false;
      if (dm.draft_manager_picks.some(dmp => dmp.pick_order == draft_round)) {
        dm.has_picked_this_round = true;
      }
    });

    return draft_managers.sort((a, b) => {
      return draft_direction
        ? (a.draft_seed < b.draft_seed ? 1 : -1)
        : (a.draft_seed > b.draft_seed ? 1 : -1)
    });
  }

  getRemainingDraftManagersInRound(draft_managers: DraftManager[], draft_round: number, current_seed: number, draft_direction: boolean): DraftManager[] {
    let managers_with_pick_left_this_round = draft_direction
      ? draft_managers.filter(dm => dm.draft_seed <= current_seed && (!dm.draft_manager_picks.some(dmp => dmp.pick_order == draft_round)))
      : draft_managers.filter(dm => dm.draft_seed >= current_seed && (!dm.draft_manager_picks.some(dmp => dmp.pick_order == draft_round)));

    // now order it...
    managers_with_pick_left_this_round.sort((a, b) => {
      return draft_direction
        ? (a.draft_seed < b.draft_seed ? 1 : -1)
        : (a.draft_seed > b.draft_seed ? 1 : -1)
    });

    return managers_with_pick_left_this_round;
  }

  private subscribeToEvents(): void {
    this.signalRService.connectionEstablished.subscribe(() => {
      // we could send a message out.
    });

    this.signalRService.updateReceived.subscribe((draft: Draft) => {
      this.draft.next(draft);
    });

    this.signalRService.statusReceived.subscribe((status: DraftStatuses) => {
      if (this.draft.value.status_id != status) {
        this.draft.value.status_id = status;
        this.draft.next(this.draft.value);
      }
    });

    this.signalRService.pickReceived.subscribe((pick: DraftManagerPick) => {
      this.pick.next(pick);
    });
  }

  updateDraftStatusNotification(draftStatus: DraftStatuses) : void {
    this.signalRService.updateStatus(draftStatus);
  }

  updateDraftNotification(draft: Draft): void {
    this.signalRService.updateDraft(draft);
  }

  updatePickNotification(pick: DraftManagerPick): void {
    this.signalRService.updatePick(pick);
  }

  draftIsAuction(): boolean {
    return true;
  }

  getMaxBid(dmp: DraftManagerPick): SealedBid {
    if (!dmp.sealed_bids.some(sb => sb.bid_eligible)) {
      return undefined;
    }

    let maxBids = dmp.sealed_bids.filter(b => b.bid_eligible && b.bid_amount == this.getMaxBidAmount(dmp));
    let maxBid: SealedBid;

    if (this.draft.value.direction)
      maxBid = maxBids.reduce((p, c) => this.getManagerById(p.draft_manager_id).draft_seed > this.getManagerById(c.draft_manager_id).draft_seed ? p : c);
    else
      maxBid = maxBids.reduce((p, c) => this.getManagerById(p.draft_manager_id).draft_seed < this.getManagerById(c.draft_manager_id).draft_seed ? p : c);

    maxBid.is_max_bid = true;
    return maxBid;
  }

  getMaxBidAmount(dmp: DraftManagerPick): number {
    if (dmp.sealed_bids?.length > 1)
      return dmp.sealed_bids?.filter(sb => sb.bid_eligible)?.reduce((p, c) => p.bid_amount > c.bid_amount ? p : c)?.bid_amount ?? dmp.value_price;
    else
      return dmp.value_price;
  }

  getManagerById(id: number): DraftManager {
    return this.draft.value.draft_managers.find(dm => dm.id == id);
  }

  startDraftingTimer(): void {
    this.startDraftTimer.emit(true);
  }

  stopDraftingTimer(): void {
    this.stopDraftTimer.emit(true);
  }

  startBidsTimer(): void {
    this.startSealedBidsTimer.emit(true);
  }

  stopBidsTimer(): void {
    this.stopSealedBidsTimer.emit(true);
  }
}
