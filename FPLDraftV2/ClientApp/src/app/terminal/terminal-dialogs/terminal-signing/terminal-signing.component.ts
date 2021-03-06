import { Component, OnInit } from '@angular/core';
import { FPLBase } from '../../../models/fpl';
import { Draft, DraftManager, DraftManagerPick } from '../../../models/draft';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { DraftControllerService } from '../../../draft/services/draft-controller.service';
@Component({
  selector: 'app-terminal-signing-component',
  templateUrl: './terminal-signing.component.html',
  styleUrls: ['./terminal-signing.component.scss'],
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
export class TerminalSigningComponent implements OnInit {

  draft: Draft;
  fplBase: FPLBase;
  currentPick: DraftManagerPick;
  nominatingManager: DraftManager;
  signingManager: DraftManager;

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
        if (this.currentPick) {
          this.signingManager = this.draftControllerService.getManagerById(this.currentPick.draft_manager_id);
          this.nominatingManager = this.draftControllerService.getManagerById(this.currentPick.nominator_id);
        }
      }
    });
  }

  replacePlayerImageNotFound(event, player) {
    event.target.src = `https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${player.club.code}-66.png`;
  }
}
