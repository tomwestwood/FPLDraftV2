import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { Club, Player, FPLBase } from '../models/fpl';
import { FplService } from '../services/fpl.service';
import { DraftService } from '../services/draft.service';
import { Draft, DraftManager, DraftManagerFavourite, DraftManagerPick, DraftFunctions, SquadTicker, DraftSquad, RoundPicks, DraftStatuses, SealedBid } from '../models/draft';
import { SearchFilter } from '../models/searchFilter';
import { MatTableDataSource } from '@angular/material/table';
import { TemplateParser } from '@angular/compiler';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SignalRService } from '../services/signalR.service';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { DraftControllerService } from '../draft/services/draft-controller.service';
import { MatDialog } from '@angular/material/dialog';
import { TerminalWaitingComponent } from './terminal-waiting/terminal-waiting.component';
import { ComponentType } from '@angular/cdk/portal';
import { TerminalNominationComponent } from './terminal-nomination/terminal-nomination.component';
import { TerminalSigningComponent } from './terminal-signing/terminal-signing.component';
import { TerminalTimeoutComponent } from './terminal-timeout/terminal-timeout.component';
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
export class TerminalComponent implements OnInit {
  draftId: number = 13;
  isDraftAuction: boolean = true;

  fplBase: FPLBase;
  draft: Draft;
  timer: number = 30;
  timeout: NodeJS.Timeout;
  currentPick: DraftManagerPick;
  announcementPick: DraftManagerPick;
  squadTicker: SquadTicker;
  picksTicker: DraftManager[];
  displaySquadTicker: boolean;
  statusUpdated: boolean;
  managerUpdated: boolean;
  breakingNews: boolean;
  announcingPick: boolean;

  signingManager: DraftManager;

  tickerItems: string[];

  newManagerAudio = new Audio('../../assets/mustang.mp3');
  draftingAudio = new Audio('../../assets/kp_lang_music.wav');
  nominatedAudio = new Audio('../../assets/player_nominated.wav');
  placeBidsAudio = new Audio('../../assets/place_bids.wav');
  bidsReceivedAudio = new Audio('../../assets/bloodyhell.mp3');
  timeoutAudio = new Audio('../../assets/Sad-trombone.mp3');
  announceAudio = new Audio('../../assets/player_signed.wav');



  constructor(private draftControllerService: DraftControllerService, public dialog: MatDialog, private _ngZone: NgZone) {
    draftControllerService.getDraft(this.draftId);
  }

  ngOnInit() {
    this.displaySquadTicker = true;
    this.statusUpdated = true;
    this.managerUpdated = true;
    this.breakingNews = false;

    this.draftControllerService.fplBase.subscribe((fplBase: FPLBase) => {
      this.fplBase = fplBase;
    });

    this.draftControllerService.draft.subscribe((draft: Draft) => {
      if (draft) {
        let draft_unset = !this.draft;
        var updateManager = this.draft?.draft_manager.id != draft.draft_manager.id;
        this.draft = draft;

        if (draft_unset) {
          this.initialiseSquadTicker();
          this.updateTickerItems();
        }

        if (this.draft.status_id >= DraftStatuses.SealedBids) {
          this.currentPick = this.draftControllerService.getCurrentPick();
        }

        this.stopTimer();

        // actions:
        switch (this.draft.status_id) {

          case DraftStatuses.Waiting:
            let waitingDialog = this.dialog.open(TerminalWaitingComponent);

            this.newManagerAudio.currentTime = 0;
            let newManagerPromise = this.newManagerAudio.play();

            if (newManagerPromise !== undefined) {
              newManagerPromise.then(_ => {
              }).catch(error => {
              });
            }

            setTimeout(() => {
              waitingDialog.close();
            }, 4000);
            break;

          case DraftStatuses.Drafting:
            this.startDraftingTimer();
            break;

          case DraftStatuses.Timeout:
            this.announceTimeout();
            break;

          case DraftStatuses.SealedBids:
            let nominationAndBidsDialog = this.dialog.open(TerminalNominationComponent);
            this.nominatedAudio.currentTime = 0;
            let nominatePromise = this.nominatedAudio.play();

            if (nominatePromise !== undefined) {
              nominatePromise.then(_ => {
              }).catch(error => {
              });
            }

            setTimeout(() => {
              this.placeBidsAudio.currentTime = 0;
              let placeBidsPromise = this.placeBidsAudio.play();

              if (placeBidsPromise !== undefined) {
                placeBidsPromise.then(_ => {
                }).catch(error => {
                });
              }

              nominationAndBidsDialog.close();
              this.startSealedBidsTimer();
            }, 5000);
            break;

          case DraftStatuses.BidsReceived:
            this.bidsReceivedAudio.currentTime = 0;
            let bidsReceivedPromise = this.bidsReceivedAudio.play();

            if (bidsReceivedPromise !== undefined) {
              bidsReceivedPromise.then(_ => {
              }).catch(error => {
              });
            }
            break;

          case DraftStatuses.SigningComplete:
            this.signingManager = this.draftControllerService.getManagerById(this.currentPick.draft_manager_id);
            this.signingManager.draft_squad = DraftFunctions.getDraftSquadForManager(this.signingManager);
            let newSigningDialog = this.dialog.open(TerminalSigningComponent);
            this.announceAudio.currentTime = 0;
            let announcePromise = this.announceAudio.play();

            if (announcePromise !== undefined) {
              announcePromise.then(_ => {
              }).catch(error => {
              });
            }

            setTimeout(() => {
              newSigningDialog.close();
            }, 6000);            
            break;

        }

        this.statusUpdated = false;
        setTimeout(() => { this.statusUpdated = true; }, 50);

        if (updateManager) {
          this.updateTickerItems();
          this.managerUpdated = false;
          setTimeout(() => { this.managerUpdated = true; }, 50)
        }

        this.picksTicker = this.draftControllerService.getRoundPickStatus();        
      }
    });

    this.draftControllerService.pick.subscribe((pick: DraftManagerPick) => {
      this.announcementPick = pick;
      //this.announcePick(pick); // todo: this is probably where we can flip a nomination and a signing:
    });
  }

  private subscribeToEvents(): void {

    this.draftControllerService.draft.subscribe((draft: Draft) => {
      this._ngZone.run(() => {
        // keeping in so I can see if we need _ngZone.run(())...
      });
    });
    this.draftControllerService.pick.subscribe((pick: DraftManagerPick) => {
      this._ngZone.run(() => {
        // keeping in so I can see if we need _ngZone.run(())...
      });
    });
  }

  private stopTimer(): void {
    this.draftingAudio.pause();
    this.draftingAudio.currentTime = 0;
    clearInterval(this.timeout);
  }

  private startDraftingTimer(): void {
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
          this.draftingTimeElapsed();
        }
      }, 1000);
    }, 3000);
  }
  private draftingTimeElapsed(): void {
    this.stopTimer();
  }

  private startSealedBidsTimer(): void {
    this.stopTimer();
    this.timer = 10;

    this.timeout = setInterval(() => {
      if (this.timer > 0) {
        this.timer--;
      } else {
        this.sealedBidsTimerElapsed();
      }
    }, 1000);
  }

  private sealedBidsTimerElapsed(): void {
    this.draftControllerService.setDraftStatus(DraftStatuses.CheckingBids);
    this.stopTimer();
  }

  getMaxBid(dmp: DraftManagerPick): SealedBid {
    return this.draftControllerService.getMaxBid(dmp);
  }

  getMaxBidAmount(dmp: DraftManagerPick): number {
    return this.draftControllerService.getMaxBidAmount(dmp);
  }

  // announce nomination:
  // announce bids
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

  private announceTimeout(): void {
    let timeoutDialog = this.dialog.open(TerminalTimeoutComponent);
    setTimeout(() => {
      timeoutDialog.close();
    }, 8000);

    this.timeoutAudio.currentTime = 0;
    var playPromise = this.timeoutAudio.play();

    if (playPromise !== undefined) {
      playPromise.then(_ => {
      }).catch(error => {
      });
    }
  }
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

  // ticker stuff:
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

  convertStatusToString(status: number): string {
    return DraftFunctions.convertStatusToString(status);
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

  replacePlayerImageNotFound(event, player) {
    event.target.src = `https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${player.club.code}-66.png`;
  }
}
