import { Component, OnInit, NgZone } from '@angular/core';
import { FPLBase, Player } from '../models/fpl';
import { FplService } from '../services/fpl.service';
import { Draft, DraftFunctions, DraftManager, DraftManagerPick, DraftStatuses, SealedBid } from '../models/draft';
import { BehaviorSubject } from 'rxjs';
import { DraftControllerService } from './services/draft-controller.service';
import { DraftService } from '../services/draft.service';
import { MatDialog } from '@angular/material/dialog';
import { DraftNextManagerDialogComponent } from './dialogs/draft-next-manager-dialog/draft-next-manager-dialog.component';
import { DraftNewManagerDialogComponent } from './dialogs/draft-new-manager-dialog/draft-new-manager-dialog.component';
import { DraftFinalChanceDialogComponent } from './dialogs/draft-final-chance-dialog/draft-final-chance-dialog.component';
import { DraftBaseComponent } from '../abstract/draft-base';

@Component({
  selector: 'app-draft-component',
  templateUrl: './draft.component.html',
  styleUrls: ['./draft.component.scss']
})
export class DraftComponent extends DraftBaseComponent {
  onLaptop: boolean = false;

  constructor(public draftControllerService: DraftControllerService, public dialog: MatDialog) {
    super(draftControllerService);
  }

  public setDraft(draft: Draft) {
    if (draft) {
      this.draft = draft;

      if (draft.status_id == DraftStatuses.Waiting) {
        setTimeout(() => {
          this.dialog.open(DraftNewManagerDialogComponent, { disableClose: true });
        }, 1000);
      }

      if (draft.status_id == DraftStatuses.FinalChance) {
        setTimeout(() => {
          this.dialog.open(DraftFinalChanceDialogComponent, { disableClose: true });
        }, 1000);
      }

      if (draft.status_id == DraftStatuses.Timeout || draft.status_id == DraftStatuses.SigningComplete) {
        setTimeout(() => {
          this.dialog.open(DraftNextManagerDialogComponent, {
            disableClose: true,
            data: { draft: this.draft, currentPick: this.currentPick, signingManager: this.currentPick ? this.draftControllerService.getManagerById(this.currentPick.draft_manager_id) : undefined }
          });
        }, 1000);

        if (draft.status_id == DraftStatuses.SigningComplete && this.draft) {
          this.draft.draft_manager.draft_manager_picks = this.draft.draft_manager_picks.filter(dmp => dmp.draft_manager_id == this.draft.draft_manager_id)
          this.draft.draft_manager.draft_squad = DraftFunctions.getDraftSquadForManager(this.draft.draft_manager);
        }
      }
    }
  }

  getMaxBid(dmp: DraftManagerPick): SealedBid {
    return this.draftControllerService.getMaxBid(dmp);
  }

  getMaxBidAmount(dmp: DraftManagerPick): number {
    return this.draftControllerService.getMaxBidAmount(dmp);
  }
}
