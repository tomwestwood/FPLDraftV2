import { Component, Input, OnInit } from '@angular/core';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { Draft, DraftManager } from '../../../models/draft';
import { DraftControllerService } from '../../../draft/services/draft-controller.service';
@Component({
  selector: 'app-terminal-draft-managers',
  templateUrl: './terminal-draft-managers.component.html',
  styleUrls: ['./terminal-draft-managers.component.scss'],
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
export class TerminalDraftManagersComponent implements OnInit {
  picksTicker: DraftManager[];
  @Input() draft: Draft;

  constructor(private draftControllerService: DraftControllerService) {
    this.draftControllerService.draft.subscribe((draft: Draft) => {
      if (this.draft) {
        this.picksTicker = this.draftControllerService.getRoundPickStatus();
      }
    });
  }

  ngOnInit() {
    this.picksTicker = this.draftControllerService.getRoundPickStatus();
  }
}
