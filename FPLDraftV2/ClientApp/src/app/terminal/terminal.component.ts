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

  tickerItems: string[];

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

      //this.initialiseSquadTicker();
      //this.updateTickerItems();

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
          let nominationAndBidsDialog = this.dialog.open(TerminalNominationComponent, {
            panelClass: ['animate__animated', 'animate__slideInRight']
          });
          this.nominatedAudio.currentTime = 0;
          let nominatePromise = this.nominatedAudio.play();

          if (nominatePromise !== undefined) {
            nominatePromise.then(_ => {
            }).catch(error => {
            });
          }

          setTimeout(() => {
            let placeBidsAudio = new Audio(''); // to remove:
            placeBidsAudio.currentTime = 0;
            let placeBidsPromise = placeBidsAudio.play();

            if (placeBidsPromise !== undefined) {
              placeBidsPromise.then(_ => {
              }).catch(error => {
              });
            }

            nominationAndBidsDialog.close();
            this.draftControllerService.startBidsTimer();
          }, 7000);
          break;

        case DraftStatuses.BidsReceived:          
          // to remove?:
          this.playAudio(new Audio(''));
          break;

        case DraftStatuses.SigningComplete:
          if (this.signingManager) {
            this.signingManager.draft_manager_picks = this.draft.draft_manager_picks.filter(dmp => dmp.draft_manager_id == this.signingManager.id);
            this.draft.draft_manager.draft_squad = DraftFunctions.getDraftSquadForManager(this.draft.draft_manager);
            this.signingManager.draft_squad = DraftFunctions.getDraftSquadForManager(this.signingManager);
          }
          break;
      }

      this.statusUpdated = false;
      setTimeout(() => { this.statusUpdated = true; }, 50);
    }
  }

  private announcePick(pick: DraftManagerPick): void {
    if (pick) {
      this.announceAudio.currentTime = 0;
      var playPromise = this.announceAudio.play();

      if (playPromise !== undefined) {
        playPromise.then(_ => {
        }).catch(error => {
        });
      }

      this.breakingNews = true;
      setTimeout(() => {
        this.breakingNews = false;
        this.announcingPick = true;
        this.announcementPick = pick;
        setTimeout(() => {
          this.announcingPick = false;
        }, 5000);
      }, 8000);
    }
  }

  private announceSigningComplete(): void {
    this.announce(TerminalSigningComponent, 6000, this.announceAudio, undefined);
  }

  private announceTimeout(): void {
    this.announce(TerminalTimeoutComponent, 8000, this.timeoutAudio, undefined);
  }

  private announce(component: any, timeout: number, audioElement: HTMLAudioElement, data: any): void {
    let dialog = this.dialog.open(component,
      {
        data: data,
        panelClass: ['animate__animated', 'animate__slideInRight']
      });
    setTimeout(() => {
      dialog.close();
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


  // squad ticker stuff:
  private initialiseSquadTicker(): void {
    this.squadTicker = new SquadTicker();
    this.squadTicker.ticker_index = 1;
    this.squadTicker.ticker_direction = false;
    this.squadTicker.ticker_manager = this.draft.draft_managers.find(dm => dm.draft_seed == 1);
    this.squadTicker.ticker_squad = DraftFunctions.getDraftSquadForManager(this.squadTicker.ticker_manager);
    this.squadTickerTimer();
  }

  private squadTickerTimer(): void {
    this.squadTicker.ticker_timeout = setInterval(() => {
      this.displaySquadTicker = false;
      setTimeout(() => { this.displaySquadTicker = true; }, 50)
      if ((this.squadTicker.ticker_index == 1 && this.squadTicker.ticker_direction)
        || (this.squadTicker.ticker_index == this.draft.draft_managers.length && !this.squadTicker.ticker_direction)) {
        this.squadTicker.ticker_direction = !this.squadTicker.ticker_direction;
      } else if (this.squadTicker.ticker_direction) {
        this.squadTicker.ticker_index--;
        this.squadTicker.ticker_manager = this.draft.draft_managers.find(dm => dm.draft_seed == this.squadTicker.ticker_index);
        this.squadTicker.ticker_squad = DraftFunctions.getDraftSquadForManager(this.squadTicker.ticker_manager);
      } else if (!this.squadTicker.ticker_direction) {
        this.squadTicker.ticker_index++;
        this.squadTicker.ticker_manager = this.draft.draft_managers.find(dm => dm.draft_seed == this.squadTicker.ticker_index);
        this.squadTicker.ticker_squad = DraftFunctions.getDraftSquadForManager(this.squadTicker.ticker_manager);
      }
      //this.displaySquadTicker = true;
    }, 10000);
  }

  private updateTickerItems(): void {
    this.tickerItems = [] = [];
    this.tickerItems.push(this.generateRandomTickerItem());
    this.tickerItems.push(this.generateRandomTickerItem());
    this.tickerItems.push(this.generateRandomTickerItem());
    this.tickerItems.push(this.generateRandomTickerItem());
    this.tickerItems.push(this.generateRandomTickerItem());

    this.squadTicker.ticker_timeout = setInterval(() => {
      this.tickerItems = [] = [];
      this.tickerItems.push(this.generateRandomTickerItem());
      this.tickerItems.push(this.generateRandomTickerItem());
      this.tickerItems.push(this.generateRandomTickerItem());
      this.tickerItems.push(this.generateRandomTickerItem());
    }, 30000);
  }

  private generateRandomTickerItem(): string {
    var manager = this.draft.draft_managers[Math.floor(Math.random() * this.draft.draft_managers.length)];
    var manager2 = this.draft.draft_managers[Math.floor(Math.random() * this.draft.draft_managers.length)];
    var player = this.fplBase.elements.filter(e => e.draft_manager_id == undefined)[Math.floor(Math.random() * this.fplBase.elements.filter(e => e.draft_manager_id == undefined).length)];
    if (player == undefined)
      player = this.fplBase.elements.filter(e => e.draft_manager_id == undefined)[Math.floor(Math.random() * this.fplBase.elements.filter(e => e.draft_manager_id == undefined).length)];

    return this.getRandomTickerItem(manager, manager2, player);
  }

  private getRandomTickerItem(manager: DraftManager, manager2: DraftManager, player: Player): string {
    var randomStatements: string[] = [];

    randomStatements.push(`${manager.name} linked with audacious bid for ${player.first_name} ${player.web_name}`);
    randomStatements.push(`${player.club.name} ${player.position.singular_name} ${player.first_name} ${player.web_name} open to move to ${manager.team_name}`);
    randomStatements.push(`${player.first_name} ${player.web_name} spotted at ${manager.team_name} training facility`);
    randomStatements.push(`${player.first_name} ${player.web_name} not interested in move to ${manager.team_name}. Could never see himself working with ${manager.name}`);
    randomStatements.push(`${manager.name} urges ${manager.team_name} board to move for ${player.first_name} ${player.web_name}`);
    randomStatements.push(`${manager.name} hopes to keep ${player.first_name} ${player.web_name} transfer under the radar`);
    randomStatements.push(`Draft TV sources understand ${player.first_name} ${player.web_name} could move to ${manager.team_name} in next 24 hours`);
    randomStatements.push(`${manager.name} hopes to beat ${manager2.name} to ${player.first_name} ${player.web_name} signature`);
    randomStatements.push(`${manager.name} doubts the club can afford ${player.first_name} ${player.web_name}`);
    randomStatements.push(`${manager.team_name} and ${manager2.team_name} to battle it out for ${player.first_name} ${player.web_name} signing`);
    randomStatements.push(`${manager.name} spotted partying in Cannock nightclub with ${player.first_name} ${player.web_name}`);
    randomStatements.push(`${player.first_name} ${player.web_name} agent boasts of interest from ${manager.team_name} and ${manager2.team_name}`);
    randomStatements.push(`${manager.name} linked with audacious bid for ${player.first_name} ${player.web_name}`);
    randomStatements.push(`${player.club.name} ${player.position.singular_name} ${player.first_name} ${player.web_name} open to move to ${manager.team_name}`);
    randomStatements.push(`${player.first_name} ${player.web_name} spotted at ${manager.team_name} training facility`);
    randomStatements.push(`${player.first_name} ${player.web_name} not interested in move to ${manager.team_name}. Could never see himself working with ${manager.name}`);
    randomStatements.push(`${manager.name} urges ${manager.team_name} board to move for ${player.first_name} ${player.web_name}`);
    randomStatements.push(`${manager.name} hopes to keep ${player.first_name} ${player.web_name} transfer under the radar`);
    randomStatements.push(`Draft TV sources understand ${player.first_name} ${player.web_name} could move to ${manager.team_name} in next 24 hours`);
    randomStatements.push(`${manager.name} hopes to beat ${manager2.name} to ${player.first_name} ${player.web_name} signature`);
    randomStatements.push(`${manager.name} doubts the club can afford ${player.first_name} ${player.web_name}`);
    randomStatements.push(`${manager.team_name} and ${manager2.team_name} to battle it out for ${player.first_name} ${player.web_name} signing`);
    randomStatements.push(`${manager.name} spotted partying in Cannock nightclub with ${player.first_name} ${player.web_name}`);
    randomStatements.push(`${player.first_name} ${player.web_name} agent boasts of interest from ${manager.team_name} and ${manager2.team_name}`);
    randomStatements.push(`${manager.name} linked with audacious bid for ${player.first_name} ${player.web_name}`);
    randomStatements.push(`${player.club.name} ${player.position.singular_name} ${player.first_name} ${player.web_name} open to move to ${manager.team_name}`);
    randomStatements.push(`${player.first_name} ${player.web_name} spotted at ${manager.team_name} training facility`);
    randomStatements.push(`${player.first_name} ${player.web_name} not interested in move to ${manager.team_name}. Could never see himself working with ${manager.name}`);
    randomStatements.push(`${manager.name} urges ${manager.team_name} board to move for ${player.first_name} ${player.web_name}`);
    randomStatements.push(`${manager.name} hopes to keep ${player.first_name} ${player.web_name} transfer under the radar`);
    randomStatements.push(`Draft TV sources understand ${player.first_name} ${player.web_name} could move to ${manager.team_name} in next 24 hours`);
    randomStatements.push(`${manager.name} hopes to beat ${manager2.name} to ${player.first_name} ${player.web_name} signature`);
    randomStatements.push(`${manager.name} doubts the club can afford ${player.first_name} ${player.web_name}`);
    randomStatements.push(`${manager.team_name} and ${manager2.team_name} to battle it out for ${player.first_name} ${player.web_name} signing`);
    randomStatements.push(`${manager.name} spotted partying in Cannock nightclub with ${player.first_name} ${player.web_name}`);
    randomStatements.push(`${player.first_name} ${player.web_name} agent boasts of interest from ${manager.team_name} and ${manager2.team_name}`);
    randomStatements.push(`${manager.name} linked with audacious bid for ${player.first_name} ${player.web_name}`);
    randomStatements.push(`${player.club.name} ${player.position.singular_name} ${player.first_name} ${player.web_name} open to move to ${manager.team_name}`);
    randomStatements.push(`${player.first_name} ${player.web_name} spotted at ${manager.team_name} training facility`);
    randomStatements.push(`${player.first_name} ${player.web_name} not interested in move to ${manager.team_name}. Could never see himself working with ${manager.name}`);
    randomStatements.push(`${manager.name} urges ${manager.team_name} board to move for ${player.first_name} ${player.web_name}`);
    randomStatements.push(`${manager.name} hopes to keep ${player.first_name} ${player.web_name} transfer under the radar`);
    randomStatements.push(`Draft TV sources understand ${player.first_name} ${player.web_name} could move to ${manager.team_name} in next 24 hours`);
    randomStatements.push(`${manager.name} hopes to beat ${manager2.name} to ${player.first_name} ${player.web_name} signature`);
    randomStatements.push(`${manager.name} doubts the club can afford ${player.first_name} ${player.web_name}`);
    randomStatements.push(`${manager.team_name} and ${manager2.team_name} to battle it out for ${player.first_name} ${player.web_name} signing`);
    randomStatements.push(`${manager.name} spotted partying in Cannock nightclub with ${player.first_name} ${player.web_name}`);
    randomStatements.push(`${player.first_name} ${player.web_name} agent boasts of interest from ${manager.team_name} and ${manager2.team_name}`);
    randomStatements.push(`${manager.name} linked with audacious bid for ${player.first_name} ${player.web_name}`);
    randomStatements.push(`${player.club.name} ${player.position.singular_name} ${player.first_name} ${player.web_name} open to move to ${manager.team_name}`);
    randomStatements.push(`${player.first_name} ${player.web_name} spotted at ${manager.team_name} training facility`);
    randomStatements.push(`${player.first_name} ${player.web_name} not interested in move to ${manager.team_name}. Could never see himself working with ${manager.name}`);
    randomStatements.push(`${manager.name} urges ${manager.team_name} board to move for ${player.first_name} ${player.web_name}`);
    randomStatements.push(`${manager.name} hopes to keep ${player.first_name} ${player.web_name} transfer under the radar`);
    randomStatements.push(`Draft TV sources understand ${player.first_name} ${player.web_name} could move to ${manager.team_name} in next 24 hours`);
    randomStatements.push(`${manager.name} hopes to beat ${manager2.name} to ${player.first_name} ${player.web_name} signature`);
    randomStatements.push(`${manager.name} doubts the club can afford ${player.first_name} ${player.web_name}`);
    randomStatements.push(`${manager.team_name} and ${manager2.team_name} to battle it out for ${player.first_name} ${player.web_name} signing`);
    randomStatements.push(`${manager.name} spotted partying in Cannock nightclub with ${player.first_name} ${player.web_name}`);
    randomStatements.push(`${player.first_name} ${player.web_name} agent boasts of interest from ${manager.team_name} and ${manager2.team_name}`);

    randomStatements.push(`${manager.team_name} and ${manager2.team_name} working on secret trade deals`);
    randomStatements.push(`${manager.team_name} and ${manager2.team_name} working on secret trade deals `);

    // gossip:
    randomStatements.push(`Safe-sex advocates Sydenham Snakes sign sponsorship deal with condom giant Durex.`);
    randomStatements.push(`HMRC probe club accounts of Tonbridge Tigers and Birmingham Bufallos in tax fiddling scandal`);
    randomStatements.push(`Secret source claims to have 'proof' of draw-fixing from Woodall brothers in 2019/20 season`);
    randomStatements.push(`Daniel Picken FURIOUS as Lunt Leopards board enforce smoking ban at stadium`);
    randomStatements.push(`Albion Street Animals coach Tony Nicklin adamant pre-season DOES matter`);
    randomStatements.push(`Thompson goes on CRAZY signing spree amidst Vhiskey bender. Due to meet board this evening.`);
    randomStatements.push(`Chris Eddowes ruffles feathers as he trials meat and booze restrictions at the Panthers stadium`);
    randomStatements.push(`P. Nicklin of Featherstone Fire refuses to comment on lack of custard pants`);
    randomStatements.push(`Prestwich Power boss Tom Westwood denies new baby will affect his performance this season`);
    randomStatements.push(`Wayne Nicklin said to be working on loophole to allow signing of Baggies players`);
    randomStatements.push(`Lee Woodall looking to secure first proper draft title this season`);

    return randomStatements[Math.floor(Math.random() * randomStatements.length)];
  }
}
