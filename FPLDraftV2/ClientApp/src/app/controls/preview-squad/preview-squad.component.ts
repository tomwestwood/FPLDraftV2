import { Component, OnInit, Input, Inject } from '@angular/core';
import { Player } from '../../models/fpl';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DraftManager, DraftSquad, DraftFunctions } from '../../models/draft';
import { trigger, transition, style, animate, state } from '@angular/animations';
@Component({
  selector: 'preview-squad',
  templateUrl: './preview-squad.component.html',
  styleUrls: ['./preview-squad.component.scss'],
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
export class PreviewSquadComponent {
  draftManager: DraftManager;
  draftSquad: DraftSquad;
  constructor(
    public dialogRef: MatDialogRef<DraftManager>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.draftManager = data.draftManager;
    this.draftSquad = DraftFunctions.getDraftSquadForManager(this.draftManager);
  }
  ngOnInit() { }

  replacePlayerImageNotFound(event, player) {
    event.target.src = `https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${player.club.code}-66.png`;
  }
}
