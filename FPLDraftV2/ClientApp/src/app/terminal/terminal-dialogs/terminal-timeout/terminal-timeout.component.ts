import { Component, OnInit } from '@angular/core';
import { FPLBase } from '../../../models/fpl';
import { Draft } from '../../../models/draft';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { DraftControllerService } from '../../../draft/services/draft-controller.service';
@Component({
  selector: 'app-terminal-timeout-component',
  templateUrl: './terminal-timeout.component.html',
  styleUrls: ['./terminal-timeout.component.scss'],
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
export class TerminalTimeoutComponent implements OnInit {
  draft: Draft;
  fplBase: FPLBase;

  constructor(private draftControllerService: DraftControllerService) {
  }

  ngOnInit() {
    this.draftControllerService.fplBase.subscribe((fplBase: FPLBase) => {
      this.fplBase = fplBase;
    });

    this.draftControllerService.draft.subscribe((draft: Draft) => {
      if (draft) {
        this.draft = draft;
      }
    });
  }
}
