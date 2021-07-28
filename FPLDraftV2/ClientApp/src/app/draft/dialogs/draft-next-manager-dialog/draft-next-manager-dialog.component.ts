import { trigger, transition, style, animate, state } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Draft, DraftFunctions, DraftManager, DraftManagerPick, DraftStatuses } from '../../../models/draft';
import { DraftControllerService } from '../../services/draft-controller.service';
@Component({
  selector: 'draft-next-manager-dialog-component',
  templateUrl: './draft-next-manager-dialog.component.html',
  styleUrls: ['./draft-next-manager-dialog.component.scss'],
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
export class DraftNextManagerDialogComponent implements OnInit {
  draftId: number = 13;
  draft: Draft;
  currentPick: DraftManagerPick;
  signingManager: DraftManager;
  draftControllerService: DraftControllerService;

  constructor(draftControllerService: DraftControllerService, public dialog: MatDialog) {
    this.draftControllerService = draftControllerService;
    draftControllerService.draft.subscribe((draft: Draft) => {
      this.draft = draft;
      if (this.draft.status_id == DraftStatuses.SigningComplete) {
        this.currentPick = this.draftControllerService.getCurrentPick();
        this.signingManager = this.draftControllerService.getManagerById(this.currentPick.draft_manager_id);
      }
    });

    //this.draftControllerService.getDraft(this.draftId);
  }

  ngOnInit(): void {

  }

  completePick(): void {
    this.dialog.closeAll();
    this.draftControllerService.setNextDraftManager();
    this.draftControllerService.setDraftStatus(DraftStatuses.Waiting);
  }
}
