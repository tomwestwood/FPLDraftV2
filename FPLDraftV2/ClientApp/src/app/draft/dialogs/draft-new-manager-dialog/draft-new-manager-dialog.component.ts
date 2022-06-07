import { trigger, transition, style, animate, state } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Draft, DraftFunctions, DraftManager, DraftManagerPick, DraftStatuses } from '../../../models/draft';
import { DraftControllerService } from '../../services/draft-controller.service';
@Component({
  selector: 'draft-new-manager-dialog-component',
  templateUrl: './draft-new-manager-dialog.component.html',
  styleUrls: ['./draft-new-manager-dialog.component.scss'],
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
export class DraftNewManagerDialogComponent implements OnInit {
  draftId: number = 15;
  draft: Draft;
  draftControllerService: DraftControllerService;

  constructor(draftControllerService: DraftControllerService, public dialog: MatDialog) {
    this.draftControllerService = draftControllerService;
    draftControllerService.draft.subscribe((draft: Draft) => {
      this.draft = draft;
    });
  }

  ngOnInit(): void {

  }

  continue(): void {
    this.dialog.closeAll();
  }
}
