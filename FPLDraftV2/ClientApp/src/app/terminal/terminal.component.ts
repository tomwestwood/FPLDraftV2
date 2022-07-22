import { Component, OnInit, NgZone } from '@angular/core';
import { Player, FPLBase } from '../models/fpl';
import { Draft, DraftManager, DraftManagerPick, DraftFunctions, SquadTicker, DraftStatuses, SealedBid } from '../models/draft';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { DraftControllerService } from '../draft/services/draft-controller.service';
import { MatDialog } from '@angular/material/dialog';
import { TerminalWaitingComponent } from './terminal-dialogs/terminal-waiting/terminal-waiting.component';
import { TerminalNominationComponent } from './terminal-dialogs/terminal-nomination/terminal-nomination.component';
import { TerminalSigningComponent } from './terminal-dialogs/terminal-signing/terminal-signing.component';
import { TerminalTimeoutComponent } from './terminal-dialogs/terminal-timeout/terminal-timeout.component';
import { DraftBaseComponent } from '../abstract/draft-base';
import { TerminalBidsComponent } from './terminal-dialogs/terminal-bids/terminal-bids.component';
@Component({
  selector: 'app-terminal-component',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.scss'],
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
export class TerminalComponent extends DraftBaseComponent implements OnInit {
  announcementPick: DraftManagerPick;
  squadTicker: SquadTicker;
  displaySquadTicker: boolean;
  statusUpdated: boolean;
  managerUpdated: boolean;
  breakingNews: boolean;
  announcingPick: boolean;

  newManagerAudio = new Audio('../../assets/mustang.mp3');
  nominatedAudio = new Audio('../../assets/player_nominated.wav');
  timeoutAudio = new Audio('../../assets/Sad-trombone.mp3');
  announceAudio = new Audio('../../assets/player_signed.wav');

  constructor(public draftControllerService: DraftControllerService, public dialog: MatDialog) {
    super(draftControllerService);
  }

  ngOnInit() {
    this.displaySquadTicker = true;
    this.statusUpdated = true;
    this.managerUpdated = true;
    this.breakingNews = false;
  }

  public setDraft(draft: Draft): void {
    if (draft) {
      this.draft = draft;

      this.draftControllerService.stopDraftingTimer();
      this.draftControllerService.stopBidsTimer();

      // actions:
      switch (this.draft.status_id) {

        case DraftStatuses.Waiting:
          this.announce(TerminalWaitingComponent, 4000, this.newManagerAudio, {
            draft: this.draft,
            squadManager: this.draft.draft_manager
          });

          if (this.draft.draft_manager_picks.filter(dmp => dmp.draft_manager_id == this.draft.draft_manager_id).length != this.draft.draft_manager.draft_manager_picks.length) {
            this.draft.draft_manager.draft_manager_picks = this.draft.draft_manager_picks.filter(dmp => dmp.draft_manager_id == this.draft.draft_manager_id);
          }

          this.draft.draft_manager.draft_squad = DraftFunctions.getDraftSquadForManager(this.draft.draft_manager);
          this.draftControllerService.getRoundPickStatus();
          break;

        case DraftStatuses.Drafting:
          this.draftControllerService.startDraftingTimer();
          break;

        case DraftStatuses.Timeout:
          this.announceTimeout();
          break;

        case DraftStatuses.SealedBids:
          this.announceNomination();
          break;

        case DraftStatuses.BidsReceived:          
          this.announceBids();
          break;

        case DraftStatuses.SigningComplete:
          if (this.signingManager) {
            this.signingManager.draft_manager_picks = this.draft.draft_manager_picks.filter(dmp => dmp.draft_manager_id == this.signingManager.id);
            this.draft.draft_manager.draft_squad = DraftFunctions.getDraftSquadForManager(this.draft.draft_manager);
            this.signingManager.draft_squad = DraftFunctions.getDraftSquadForManager(this.signingManager);

            this.announceSigningComplete();
          }
          break;
      }

      this.statusUpdated = false;
      setTimeout(() => { this.statusUpdated = true; }, 50);
    }
  }

  private announceNomination(): void {
    this.announce(TerminalNominationComponent, 7000, this.nominatedAudio, undefined, () => this.startBidsTimer());
  }

  private startBidsTimer(): void {
    let placeBidsAudio = new Audio(''); // to remove:
    placeBidsAudio.currentTime = 0;
    let placeBidsPromise = placeBidsAudio.play();

    if (placeBidsPromise !== undefined) {
      placeBidsPromise.then(_ => {
      }).catch(error => {
      });
    }
    this.draftControllerService.startBidsTimer();
  }

  private announceSigningComplete(): void {
    this.announce(TerminalSigningComponent, 6000, this.announceAudio);
  }

  private announceTimeout(): void {
    this.announce(TerminalTimeoutComponent, 5000, /*this.timeoutAudio*/ undefined, { draft: this.draft });
  }

  private announceBids(): void {
    this.announce(TerminalBidsComponent, 6000, /*this.timeoutAudio*/ undefined, { pick: this.currentPick, draft: this.draft });
  }

  private announce(component: any, timeout: number, audioElement: HTMLAudioElement, data: any = undefined, action: () => void = undefined) {
    let dialog = this.dialog.open(component,
      {
        data: data,
        panelClass: ['animate__animated', 'animate__slideInRight']
      });
    setTimeout(() => {
      dialog.close();
      if (action) {
        action();
      }
    }, timeout);

    if (audioElement)
      this.playAudio(audioElement);
  }

  private playAudio(audioElement: HTMLAudioElement) {
    if (audioElement) {
      audioElement.currentTime = 0;
      var playPromise = audioElement.play();

      if (playPromise !== undefined) {
        playPromise.then(_ => {
        }).catch(error => {
        });
      }
    }
  }
}


