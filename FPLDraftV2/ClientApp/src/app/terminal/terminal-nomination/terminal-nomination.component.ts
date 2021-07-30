import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { Club, Player, FPLBase } from '../../models/fpl';
import { Draft, DraftManager, DraftManagerFavourite, DraftManagerPick, DraftFunctions, SquadTicker, DraftSquad, RoundPicks, DraftStatuses, SealedBid } from '../../models/draft';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { DraftControllerService } from '../../draft/services/draft-controller.service';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-terminal-nomination-component',
  templateUrl: './terminal-nomination.component.html',
  styleUrls: ['./terminal-nomination.component.scss'],
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
export class TerminalNominationComponent implements OnInit {

  draft: Draft;
  fplBase: FPLBase;
  currentPick: DraftManagerPick;

  constructor(private draftControllerService: DraftControllerService) {
  }

  ngOnInit() {
    

    this.draftControllerService.fplBase.subscribe((fplBase: FPLBase) => {
      this.fplBase = fplBase;
    });

    this.draftControllerService.draft.subscribe((draft: Draft) => {
      if (draft) {
        this.draft = draft;
        this.currentPick = this.draftControllerService.getCurrentPick();
      }
    });
  }

  replacePlayerImageNotFound(event, player) {
    event.target.src = `https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${player.club.code}-66.png`;
  }
}
