import { Component, Input, OnInit } from '@angular/core';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { Draft } from '../../../models/draft';
import { DraftControllerService } from '../../../draft/services/draft-controller.service';
@Component({
  selector: 'app-terminal-drafting-progress',
  templateUrl: './terminal-drafting-progress.component.html',
  styleUrls: ['./terminal-drafting-progress.component.scss'],
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
export class TerminalDraftingProgressComponent implements OnInit {
  @Input() draft: Draft;
  timer: number = 30;
  timeout: NodeJS.Timeout;
  draftingAudio = new Audio('../../assets/kp_lang_music.wav');

  constructor(private draftControllerService: DraftControllerService) {

  }

  ngOnInit(): void {
    this.draftControllerService.startDraftTimer.subscribe(() => {
      this.startTimer();
    })

    this.draftControllerService.stopDraftTimer.subscribe(() => {
      this.stopTimer();
    })
  }

  private startTimer(): void {
    this.stopTimer();
    this.timer = 30;
    this.draftingAudio.currentTime = 0;
    this.draftingAudio.muted = true;
    this.draftingAudio.muted = false;
    var playPromise = this.draftingAudio.play();

    if (playPromise !== undefined) {
      playPromise.then(_ => {
      }).catch(error => {
      });
    }
    setTimeout(() => {
      this.timeout = setInterval(() => {
        if (this.timer > 0) {
          this.timer--;
        } else {
          this.timeElapsed();
        }
      }, 1000);
    }, 3000);
  }

  private timeElapsed(): void {
    this.stopTimer();
  }

  private stopTimer(): void {
    this.draftingAudio.pause();
    this.draftingAudio.currentTime = 0;
    clearInterval(this.timeout);
  }
}
