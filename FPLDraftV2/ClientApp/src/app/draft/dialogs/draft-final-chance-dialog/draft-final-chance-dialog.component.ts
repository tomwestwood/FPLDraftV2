import { trigger, transition, style, animate, state } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Draft, DraftFunctions, DraftManager, DraftManagerPick, DraftStatuses, SealedBid } from '../../../models/draft';
import { DraftControllerService } from '../../services/draft-controller.service';
@Component({
  selector: 'draft-final-chance-dialog-component',
  templateUrl: './draft-final-chance-dialog.component.html',
  styleUrls: ['./draft-final-chance-dialog.component.scss'],
  animations: [
    trigger('flyInOut', [
      state('in', style({ transform: 'translateX(0)' })),
      transition('void => *', [
        style({ transform: 'translateX(-100%)' }),
        animate(100)
      ]),
      transition('* => void', [
        animate(100, style({ transform: 'translateX(100%)' }))
      ])
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate(500, style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate(0, style({ opacity: 0 }))
      ])
    ])
  ]
})
export class DraftFinalChanceDialogComponent implements OnInit {
  draftId: number = 13;
  draft: Draft;
  currentPick: DraftManagerPick;
  signingManager: DraftManager;
  draftControllerService: DraftControllerService;

  constructor(draftControllerService: DraftControllerService, public dialog: MatDialog) {
    this.draftControllerService = draftControllerService;
    draftControllerService.draft.subscribe((draft: Draft) => {
      this.draft = draft;
      if (this.draft.status_id == DraftStatuses.FinalChance) {
        this.currentPick = this.draftControllerService.getCurrentPick();
        this.signingManager = this.draftControllerService.getManagerById(this.currentPick.draft_manager_id);
      }
    });
  }

  ngOnInit(): void {

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

  getMaxBid(dmp: DraftManagerPick): SealedBid {
    return this.draftControllerService.getMaxBid(dmp);
  }

  getMaxBidAmount(dmp: DraftManagerPick): number {
    return this.draftControllerService.getMaxBidAmount(dmp);
  }
}
