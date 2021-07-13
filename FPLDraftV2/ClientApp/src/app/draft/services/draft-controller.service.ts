import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { DraftManagerFavourite, Draft, DraftManagerPick, DraftFunctions, DraftManager, DraftStatuses } from '../../models/draft';
import { FplService } from '../../services/fpl.service';
import { SignalRService } from '../../services/signalR.service';
import { FPLBase } from '../../models/fpl';
import { DraftService } from '../../services/draft.service';
import { stat } from 'fs';

@Injectable({ providedIn: 'root' })
export class DraftControllerService {
  draft: BehaviorSubject<Draft> = new BehaviorSubject<Draft>(undefined);
  pick: BehaviorSubject<DraftManagerPick> = new BehaviorSubject<DraftManagerPick>(undefined);
  fplBase: BehaviorSubject<FPLBase> = new BehaviorSubject<FPLBase>(undefined);  

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
    let updateDraft = this.draftService.updateDraft(draft);
    //updateDraft.subscribe((draft: Draft) => {
    //  this.draft.next(draft);
    //  this.signalRService.updateDraft(draft);
    //});
    return updateDraft;
  }

  savePick(pick: DraftManagerPick): Observable<DraftManagerPick> {
    let savePick = this.draftService.savePick(pick);
    //savePick.subscribe((pick: DraftManagerPick) => {
    //  this.pick.next(pick);
    //  this.signalRService.updatePick(pick);
    //});
    return savePick;
  }

  updatePick(pick: DraftManagerPick): Observable<DraftManagerPick> {
    let savePick = this.draftService.updatePick(pick);
    //savePick.subscribe((pick: DraftManagerPick) => {
    //  this.pick.next(pick);
    //  this.signalRService.updatePick(pick);
    //});
    return savePick;
  }

  setDraftStatus(status: DraftStatuses) {
    this.draft.value.status_id = status;
    this.saveDraft(this.draft.value).subscribe((draft: Draft) => {
      this.draft.next(this.draft.value);
      this.updateDraftNotification(this.draft.value);
    });
  }

  setNextDraftManager(): void {
    let draft_managers = this.draft.value.draft_managers;
    draft_managers.forEach(dm => {
      dm.draft_manager_picks = this.draft.value.draft_manager_picks.filter(dmp => dmp.draft_manager_id == dm.id)
        .map((dmp: DraftManagerPick) => DraftFunctions.getBasicDraftManagerPickObject(dmp));
    });
    let min_seed = draft_managers.reduce((p, c) => p.draft_seed < c.draft_seed ? p : c).draft_seed;
    let max_seed = draft_managers.reduce((p, c) => p.draft_seed > c.draft_seed ? p : c).draft_seed;
    let current_seed = this.draft.value.draft_manager.draft_seed;
    let draft_round = this.draft.value.draft_round;
    let draft_direction = this.draft.value.direction;
    let managers_with_pick_left_this_round = draft_direction
                                              ? draft_managers.filter(dm => dm.draft_seed <= current_seed && (!dm.draft_manager_picks.some(dmp => dmp.pick_order == draft_round)))
                                              : draft_managers.filter(dm => dm.draft_seed >= current_seed && (!dm.draft_manager_picks.some(dmp => dmp.pick_order == draft_round)));


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
    }

    this.draft.value.draft_manager.draft_squad = DraftFunctions.getDraftSquadForManager(this.draft.value.draft_manager);
    this.updateDraftNotification(this.draft.value);
  }

  subscribeToEvents(): void {
    this.signalRService.connectionEstablished.subscribe(() => {
      // we could send a message out.
    });

    this.signalRService.updateReceived.subscribe((draft: Draft) => {
      this.draft.next(draft);
    });

    this.signalRService.pickReceived.subscribe((pick: DraftManagerPick) => {
      this.pick.next(pick);
    });
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
}
