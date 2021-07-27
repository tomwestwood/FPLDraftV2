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

  constructor(private draftControllerService: DraftControllerService, public dialog: MatDialog) {
    draftControllerService.getDraft(this.draftId);
  }

  ngOnInit() {
    this.draftControllerService.fplBase.subscribe((fplBase: FPLBase) => {
      this.fplBase = fplBase;
    });

    this.draftControllerService.draft.subscribe((draft: Draft) => {
      if (draft) {
        this.draft = draft;

        if (draft.status_id == DraftStatuses.Waiting) {
          setTimeout(() => {
            this.dialog.open(DraftNewManagerDialogComponent, { disableClose: true });
          }, 1000);
        }

        if (draft.status_id == DraftStatuses.FinalChance) {
          this.current_pick = this.draftControllerService.getCurrentPick();
          setTimeout(() => {
            this.dialog.open(DraftFinalChanceDialogComponent, { disableClose: true });
          }, 1000);
        }

        if (draft.status_id == DraftStatuses.Timeout || draft.status_id == DraftStatuses.SigningComplete) {
          setTimeout(() => {
            this.dialog.open(DraftNextManagerDialogComponent, { disableClose: true });
          }, 1000);
        }
      }
    });

    this.draftControllerService.pick.subscribe((pick: DraftManagerPick) => {
      if (pick) {
        this.pick.next(pick);
      }
    });
  }

  getMaxBid(dmp: DraftManagerPick): SealedBid {
    return this.draftControllerService.getMaxBid(dmp);
  }

  getMaxBidAmount(dmp: DraftManagerPick): number {
    return this.draftControllerService.getMaxBidAmount(dmp);
  }
}
