import { trigger, transition, style, animate, state } from '@angular/animations';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
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
  draft: Draft;
  currentPick: DraftManagerPick;
  signingManager: DraftManager;

  constructor(private draftControllerService: DraftControllerService, public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.draft = data.draft;
    this.currentPick = data.currentPick;
    this.signingManager = data.signingManager;
  }

  ngOnInit(): void {

  }

  completePick(): void {
    this.draftControllerService.setNextDraftManager();
    this.dialog.closeAll();
  }

  replacePlayerImageNotFound(event, player) {
    event.target.src = `https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${player.club.code}-66.png`;
  }
}
