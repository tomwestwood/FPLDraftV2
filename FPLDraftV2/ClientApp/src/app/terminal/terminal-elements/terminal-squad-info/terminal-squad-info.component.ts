import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { Draft, DraftFunctions, DraftManager, DraftManagerPick, DraftStatuses, SealedBid } from '../../../models/draft';
import { DraftControllerService } from '../../../draft/services/draft-controller.service';
@Component({
  selector: 'app-terminal-squad-info',
  templateUrl: './terminal-squad-info.component.html',
  styleUrls: ['./terminal-squad-info.component.scss'],
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
export class TerminalSquadInfoComponent implements OnInit, OnChanges {
  @Input() squadManager: DraftManager;

  constructor(private draftControllerService: DraftControllerService) { }

  ngOnInit() {
    this.updateManagerSquad();

    this.draftControllerService.draft.subscribe(() => {
      this.updateManagerSquad();
    })

    this.draftControllerService.pick.subscribe(() => {
      this.updateManagerSquad();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.updateManagerSquad();
  }

  private updateManagerSquad(): void {
    if (this.squadManager) {
      this.squadManager.draft_squad = DraftFunctions.getDraftSquadForManager(this.squadManager);
    }
  }
}
