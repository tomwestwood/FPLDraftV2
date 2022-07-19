import { Component, Inject, OnInit } from '@angular/core';
import { FPLBase } from '../../../models/fpl';
import { Draft, DraftFunctions, DraftManager, DraftManagerPick, SealedBid } from '../../../models/draft';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { DraftControllerService } from '../../../draft/services/draft-controller.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
  selector: 'app-terminal-bids-component',
  templateUrl: './terminal-bids.component.html',
  styleUrls: ['./terminal-bids.component.scss'],
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
export class TerminalBidsComponent {
  currentPick: DraftManagerPick;
  draft: Draft;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.currentPick = data.pick;
    this.draft = data.draft;
  }

  getManagerImageUrlFromId(sealedBid: SealedBid): string {
    return DraftFunctions.getManagerFromId(this.draft, sealedBid.draft_manager_id)?.team_image_url ?? '';
  }
}
