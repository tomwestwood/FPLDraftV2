import { Component, OnInit, NgZone } from '@angular/core';
import { FPLBase, Player } from '../models/fpl';
import { FplService } from '../services/fpl.service';
import { Draft, DraftFunctions, DraftManagerPick, DraftStatuses, SealedBid } from '../models/draft';
import { DraftService } from '../services/draft.service';
import { DraftControllerService } from '../draft/services/draft-controller.service';
import { DraftBaseComponent } from '../abstract/draft-base';

@Component({
  selector: 'app-admin-component',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent extends DraftBaseComponent {

  constructor(fplService: FplService, public draftControllerService: DraftControllerService, private draftService: DraftService) {
    super(draftControllerService);
  }

  setDraft(draft: Draft): void {
    this.draft = draft;
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
          draft_manager_team: dm.team_name,
          player_id: this.currentPick.player_id,
          player_name: this.currentPick.player.name,
          bid_eligible: true,
          is_max_bid: false
        };
        sealed_bid.bid_eligible = this.assessEligibility(sealed_bid);
        sealed_bids.push(sealed_bid);
      });
      this.currentPick.sealed_bids = sealed_bids;
      this.draft.draft_manager_picks.push(this.currentPick);
      this.draftControllerService.updatePick(this.currentPick).subscribe((dmp: DraftManagerPick) => {
        this.draftControllerService.setDraftStatus(DraftStatuses.BidsReceived);
        this.draftControllerService.updatePickNotification(dmp);
        setTimeout(() => {
          if (this.currentPick.sealed_bids.some(b => b.bid_eligible)) {
            this.draftControllerService.setDraftStatus(DraftStatuses.FinalChance)
          } else {
            this.currentPick.signed_price = this.currentPick.value_price;
            this.currentPick.draft_manager_id = this.currentPick.nominator_id;
            this.currentPick.pick_order = this.draft.draft_round;
            this.draftControllerService.updatePick(this.currentPick).subscribe((savedPick: DraftManagerPick) => {
              this.draftControllerService.setDraftStatus(DraftStatuses.SigningComplete);
              this.draftControllerService.updatePickNotification(savedPick);
            });
          }
        }, 10000);
      });
    }
  }

  noBids(): void {
    this.currentPick.pick_order = this.draft.draft_round;
    this.currentPick.draft_manager_id = this.draft.draft_manager_id;
    this.currentPick.signed_price = this.currentPick.player.now_cost / 10;
    this.draft.draft_manager_picks.push(this.currentPick);
    this.draft.draft_manager.draft_manager_picks.push(this.currentPick);
    this.draft.draft_manager.draft_squad = DraftFunctions.getDraftSquadForManager(this.draft.draft_manager);

    this.draftControllerService.updatePick(this.currentPick).subscribe((savedPick: DraftManagerPick) => {
      this.draftControllerService.updatePickNotification(savedPick);
      this.draftControllerService.saveDraft(this.draft).subscribe((draft: Draft) => {
        this.draftControllerService.setDraftStatus(DraftStatuses.SigningComplete);
      });
    });
  }

  switchDraftDirection(): void {
    this.draft.direction = !this.draft.direction;
  }

  private assessEligibility(bid: SealedBid): boolean {
    let isRemainingManager = this.draftControllerService.getRemainingDraftManagersInRound(this.draft.draft_managers, this.draft.draft_round, this.draft.draft_manager.draft_seed, this.draft.direction).some(dm => dm.id == bid.draft_manager_id);
    let minBid = this.currentPick.value_price + 0.5;
    let maxBid = this.currentPick.value_price * 2;
    let isHalfMilVariant = bid.bid_amount % 0.5 == 0;

    return isRemainingManager && bid.bid_amount >= minBid && bid.bid_amount <= maxBid && isHalfMilVariant;

  }
}
