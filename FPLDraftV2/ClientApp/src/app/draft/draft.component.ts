import { Component, OnInit, NgZone } from '@angular/core';
import { FPLBase, Player } from '../models/fpl';
import { FplService } from '../services/fpl.service';
import { Draft, DraftFunctions, DraftManager, DraftManagerPick, DraftStatuses, SealedBid } from '../models/draft';
import { BehaviorSubject } from 'rxjs';
import { DraftControllerService } from './services/draft-controller.service';
import { DraftService } from '../services/draft.service';

@Component({
  selector: 'app-draft-component',
  templateUrl: './draft.component.html',
  styleUrls: ['./draft.component.scss']
})
export class DraftComponent implements OnInit {
  draftId: number = 13;
  isDraftAuction: boolean = true;
  fplBase: FPLBase;
  draft: Draft;
  pick: BehaviorSubject<DraftManagerPick>;
  current_pick: DraftManagerPick;

  constructor(private draftControllerService: DraftControllerService) {
    draftControllerService.getDraft(this.draftId);
  }

  ngOnInit() {
    this.draftControllerService.fplBase.subscribe((fplBase: FPLBase) => {
      this.fplBase = fplBase;
    });

    this.draftControllerService.draft.subscribe((draft: Draft) => {
      if (draft) {
        this.draft = draft;

        if (draft.status_id == DraftStatuses.FinalChance) {
          this.current_pick = draft.draft_manager_picks.filter(dmp => dmp.nominator_id == draft.draft_manager_id /* && dmp.pick_order == draft.draft_round */).reduce((p, c) => p.id > c.id ? p : c);
          this.current_pick.player = this.fplBase.elements.find(p => p.id == this.current_pick.player_id);
        }
      }
    });

    this.draftControllerService.pick.subscribe((pick: DraftManagerPick) => {
      this.pick.next(pick);
    });
  }

  signPick(dmp: DraftManagerPick): void {
    let highest_bid = this.getMaxBid(dmp);
    let highest_bidder = this.draft.draft_managers.find(dm => dm.id == highest_bid.draft_manager_id);
    dmp.pick_order = this.draft.draft_round;
    dmp.draft_manager_id = this.draft.draft_manager_id;
    dmp.signed_price = highest_bid.bid_amount;
    
    this.draftControllerService.updatePick(dmp).subscribe((savedPick: DraftManagerPick) => {
      this.draftControllerService.setDraftStatus(DraftStatuses.SigningComplete);
    });
  }

  passPick(dmp: DraftManagerPick): void {
    let highest_bid = this.getMaxBid(dmp);
    let highest_bidder = this.draft.draft_managers.find(dm => dm.id == highest_bid.draft_manager_id);
    dmp.pick_order = this.draft.draft_manager_picks.filter(pick => pick.draft_manager_id == highest_bidder.id).length + 1;
    dmp.draft_manager_id = highest_bidder.id;
    dmp.signed_price = highest_bid.bid_amount;
    
    this.draftControllerService.updatePick(dmp).subscribe((savedPick: DraftManagerPick) => {
      this.draftControllerService.setDraftStatus(DraftStatuses.SigningComplete);
    });    
  }

  completePick(): void {
    this.draftControllerService.setDraftStatus(DraftStatuses.Waiting);
    this.draftControllerService.setNextDraftManager();
  }

  getMaxBid(dmp: DraftManagerPick): SealedBid {
    return this.draftControllerService.getMaxBid(dmp);
  }

  getMaxBidAmount(dmp: DraftManagerPick): number {
    return this.draftControllerService.getMaxBidAmount(dmp);
  }
}
