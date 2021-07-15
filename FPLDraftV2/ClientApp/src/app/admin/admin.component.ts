import { Component, OnInit, NgZone } from '@angular/core';
import { FPLBase, Player } from '../models/fpl';
import { FplService } from '../services/fpl.service';
import { Draft, DraftFunctions, DraftManagerPick, DraftStatuses, SealedBid } from '../models/draft';
import { DraftService } from '../services/draft.service';
import { DraftControllerService } from '../draft/services/draft-controller.service';

@Component({
  selector: 'app-admin-component',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  draftId: number = 13;
  isAuction: boolean = true;
  draft: Draft;
  fplBase: FPLBase;
  current_pick: DraftManagerPick;

  constructor(fplService: FplService, private draftControllerService: DraftControllerService, private draftService: DraftService) {
    this.draftControllerService.fplBase.subscribe((fplBase: FPLBase) => {
      this.fplBase = fplBase;
    });

    this.draftControllerService.draft.subscribe((draft: Draft) => {
      if (draft) {
        let unset = !this.draft;
        this.draft = draft;
        this.draft.draft_manager = this.draft.draft_managers.find(dm => dm.id == this.draft.draft_manager_id);

        if (unset) {
          if (draft.status_id == DraftStatuses.SealedBids || draft.status_id == DraftStatuses.CheckingBids || draft.status_id == DraftStatuses.BidsReceived) {
            this.current_pick = draft.draft_manager_picks.filter(dmp => dmp.nominator_id == draft.draft_manager_id && dmp.pick_order == draft.draft_round).reduce((p, c) => p.id > c.id ? p : c);
            this.current_pick.player = this.fplBase.elements.find(p => p.id == this.current_pick.player_id);
          }
        }
      }
    });

    this.draftControllerService.pick.subscribe((pick: DraftManagerPick) => {
      this.current_pick = pick;
    })
  }

  ngOnInit() {
    this.draftControllerService.getDraft(this.draftId);    
  }

  updateDraft(): void {
    this.draft.draft_manager = this.draft.draft_managers.find(dm => dm.id == this.draft.draft_manager_id);
    this.draftControllerService.saveDraft(this.draft).subscribe((draft: Draft) => {
      this.draftControllerService.updateDraftNotification(this.draft);
    });
  }

  submitBids(): void {
    let bidding_managers = this.draft.draft_managers.filter(dm => dm.bid && dm.bid > 0);
    if (bidding_managers) {
      let sealed_bids: SealedBid[] = [];
      bidding_managers.forEach(dm => {
        let sealed_bid: SealedBid = {
          bid_amount: dm.bid,
          draft_manager_id: dm.id,
          draft_manager_name: dm.name,
          player_id: this.current_pick.player_id,
          player_name: this.current_pick.player.name,
          bid_eligible: true // todo: check this...
        };        
        sealed_bids.push(sealed_bid);
      });
      this.current_pick.sealed_bids = sealed_bids;
      this.draft.draft_manager_picks.push(this.current_pick);
      this.draftControllerService.updatePick(this.current_pick).subscribe((dmp: DraftManagerPick) => {
        this.draftControllerService.setDraftStatus(DraftStatuses.BidsReceived);
        setTimeout(() => {
          this.draftControllerService.setDraftStatus(DraftStatuses.FinalChance)
        }, 10000);
      });
    }
  }

  noBids(): void {
    this.current_pick.pick_order = this.draft.draft_round;
    this.current_pick.draft_manager_id = this.draft.draft_manager_id;
    this.current_pick.signed_price = this.current_pick.player.now_cost;
    this.draft.draft_manager_picks.push(this.current_pick);

    this.draftControllerService.updatePick(this.current_pick).subscribe((savedPick: DraftManagerPick) => {
      this.draftControllerService.setDraftStatus(DraftStatuses.SigningComplete);
    });
  }

  switchDraftDirection(): void {
    this.draft.direction = !this.draft.direction;
  }

  getStatusDescriptionFromId(status_id: number): string {
    return DraftFunctions.convertStatusToString(status_id);
  }

  getDraftDirectionDescription(): string {
    return this.draft.direction ? 'going back up' : 'going down';
  }
}
