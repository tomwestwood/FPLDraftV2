import { Component, Input, SimpleChanges } from '@angular/core';
import { DraftManager, DraftSquad, DraftFunctions } from '../../models/draft';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { OnChanges } from '@angular/core';
@Component({
  selector: 'squad',
  templateUrl: './squad.component.html',
  styleUrls: ['./squad.component.scss'],
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
export class SquadComponent implements OnChanges {
  @Input() draftManager: DraftManager;
  draftSquad: DraftSquad;
  constructor() {
    this.draftSquad = DraftFunctions.getDraftSquadForManager(this.draftManager);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.draftSquad = DraftFunctions.getDraftSquadForManager(this.draftManager);
  }

  replacePlayerImageNotFound(event, player) {
    event.target.src = `https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${player.club.code}-66.png`;
  }
}
