import { Component, Input } from '@angular/core';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { Draft, DraftManager, DraftManagerPick, DraftStatuses, SealedBid } from '../../../models/draft';
import { DraftControllerService } from '../../../draft/services/draft-controller.service';
@Component({
  selector: 'app-terminal-nomination-progress',
  templateUrl: './terminal-nomination-progress.component.html',
  styleUrls: ['./terminal-nomination-progress.component.scss'],
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
export class TerminalNominationProgressComponent {
  @Input() draft: Draft;
  @Input() currentPick: DraftManagerPick;
  @Input() signingManager: DraftManager;
  timer: number = 10;
  timeout: NodeJS.Timeout;

  bidsAudio = new Audio('../../assets/place_bids.wav');
  bidsReceivedAudio = new Audio('../../assets/bloodyhell.mp3');

  constructor(private draftControllerService: DraftControllerService) {

  }

  ngOnInit(): void {
    this.draftControllerService.startSealedBidsTimer.subscribe(() => {
      this.startTimer();
    })

    this.draftControllerService.stopSealedBidsTimer.subscribe(() => {
      this.stopTimer();
    })
  }

  getMaxBid(dmp: DraftManagerPick): SealedBid {
    return this.draftControllerService.getMaxBid(dmp);
  }

  getMaxBidAmount(dmp: DraftManagerPick): number {
    return this.draftControllerService.getMaxBidAmount(dmp);
  }

  private startTimer(): void {
    this.stopTimer();
    this.timer = 10;

    this.timeout = setInterval(() => {
      if (this.timer > 0) {
        this.timer--;
      } else {
        this.timerElapsed();
      }
    }, 1000);
  }

  private timerElapsed(): void {
    this.draftControllerService.setDraftStatus(DraftStatuses.CheckingBids);
    this.stopTimer();
  }

  private stopTimer(): void {
    this.bidsAudio.pause();
    this.bidsAudio.currentTime = 0;
    clearInterval(this.timeout);
  }
}
