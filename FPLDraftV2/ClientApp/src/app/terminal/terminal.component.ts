import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { Club, Player, FPLBase } from '../models/fpl';
import { FplService } from '../services/fpl.service';
import { DraftService } from '../services/draft.service';
import { Draft, DraftManager, DraftManagerFavourite, DraftManagerPick, DraftFunctions, SquadTicker, DraftSquad } from '../models/draft';
import { SearchFilter } from '../models/searchFilter';
import { MatTableDataSource } from '@angular/material/table';
import { TemplateParser } from '@angular/compiler';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SignalRService } from '../services/signalR.service';
import { trigger, transition, style, animate, state } from '@angular/animations';
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
  fplBase: FPLBase;
  draftManagers: DraftManager[];
  draft: Draft;
  timer: number = 30;
  timeout: NodeJS.Timeout;
  announcementPick: DraftManagerPick;
  squadTicker: SquadTicker;
  displaySquadTicker: boolean;
  statusUpdated: boolean;
  managerUpdated: boolean;
  breakingNews: boolean;
  announcingPick: boolean;

  tickerItems: string[];

  draftingAudio = new Audio('../../assets/Countdown Music.wav');
  announceAudio = new Audio('../../assets/Player Reveal_1.wav');
  timeoutAudio = new Audio('../../assets/Sad-trombone.mp3');

  constructor(private fplService: FplService, private draftService: DraftService, private signalRService: SignalRService, private _snackBar: MatSnackBar, private _ngZone: NgZone) { }
  ngOnInit() {
    this.displaySquadTicker = true;
    this.statusUpdated = true;
    this.managerUpdated = true;
    this.breakingNews = false;

    this.getFplBase();
    this.subscribeToEvents();
  }
  convertStatusToString(status: number): string {
    switch (status) {
      case 1: return 'Not started';
      case 2: return 'Waiting';
      case 3: return 'Pre-draft';
      case 4: return 'Drafting';
      case 5: return 'Drafting complete';
      case 6: return 'TIMEOUT';
      default: return 'Unknown';
    }
  }
  private subscribeToEvents(): void {
    this.signalRService.connectionEstablished.subscribe(() => {
      // show connected or something
    });
    this.signalRService.updateReceived.subscribe((draft: Draft) => {
      this._ngZone.run(() => {
        var updateManager = this.draft.draft_manager.id != draft.draft_manager.id;
        var draftSquad = this.draft.draft_manager.draft_squad;

        this.draft = draft;
        this.stopTimer();
        if (this.draft.status_id == 4) {
          this.startTimer();
        } else if (this.draft.status_id == 6) {
          this.announceTimeout();
        }

        this.statusUpdated = false;
        setTimeout(() => { this.statusUpdated = true; }, 50)
        if (updateManager) {
          this.draft.draft_manager = this.draftManagers.find(dm => dm.id == this.draft.draft_manager.id);
          this.draft.draft_manager = this.draftManagers.find(dm => dm.id == this.draft.draft_manager.id);
          this.draft.draft_manager.draft_squad = DraftFunctions.getDraftSquadForManager(this.draft.draft_manager);
          this.managerUpdated = false;
          setTimeout(() => { this.managerUpdated = true; }, 50)
        } else {
          this.draft.draft_manager.draft_squad = draftSquad;
        }
      });
    });
    this.signalRService.pickReceived.subscribe((pick: DraftManagerPick) => {
      this._ngZone.run(() => {
        this.draftManagers.find(dm => dm.id == this.draft.draft_manager_id).draft_manager_picks.push(pick);
        this.draftAssignPicks();
        this.announcePick(pick);
      });
    });
  }
  private getFplBase(): void {
    this.fplService.getFplBase()
      .subscribe((data: FPLBase) => {
        this.fplBase = data;
        this.getDraftInfo();
      });
  }

  private getDraftInfo() {
    this.draftService.getDraft()
      .subscribe(draft => {
        this.draft = draft;
        this.draftManagers = draft.draft_managers;
        this.draftAssignPicks();
        this.draft.draft_manager = draft.draft_managers.find(dm => dm.id == this.draft.draft_manager_id);
        this.initialiseSquadTicker();
        this.updateTickerItems();
        if (draft.status_id == 4) {
          this.startTimer();
        }
      });
  }

  private draftAssignPicks(): void {
    this.draftManagers.forEach(dm => {
      if (this.draft.draft_manager_picks) {
        dm.draft_manager_picks = this.draft.draft_manager_picks.filter(dmp => dmp.draft_manager_id == dm.id);
        //dm.draft_squad = DraftFunctions.getDraftSquadForManager(dm);
        dm.draft_manager_picks.forEach(dmp => {
          this.fplBase.elements.filter(e => e.id == dmp.player_id).forEach(e => {
            e.draft_manager_id = dm.id;
            e.draft_manager = dm;
            dmp.player = e;
          });
        });
      }
    });
  }
  private stopTimer(): void {
    this.draftingAudio.pause();
    this.draftingAudio.currentTime = 0;
    clearInterval(this.timeout);
  }

  private startTimer(): void {
    this.stopTimer();
    this.timer = 30;
    this.draftingAudio.currentTime = 0;
    var playPromise = this.draftingAudio.play();

    if (playPromise !== undefined) {
      playPromise.then(_ => {
      }).catch(error => {
      });
    }

    this.timeout = setInterval(() => {
      if (this.timer > 0) {
        this.timer--;
      } else {
        this.timeElapsed();
      }
    }, 1000);
  }
  private timeElapsed(): void {
    this.stopTimer();
  }

  private announcePick(pick: DraftManagerPick): void {
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
        this.draft.draft_manager = this.draftManagers.find(dm => dm.id == this.draft.draft_manager.id);
        this.draft.draft_manager.draft_squad = DraftFunctions.getDraftSquadForManager(this.draft.draft_manager);
        this.announcingPick = false;
      }, 5000);
    }, 8000);
  }

  private announceTimeout(): void {
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
    this.squadTicker.ticker_manager = this.draftManagers.find(dm => dm.draft_seed == 1);
    this.squadTicker.ticker_squad = DraftFunctions.getDraftSquadForManager(this.squadTicker.ticker_manager);
    this.squadTickerTimer();
  }
  private squadTickerTimer(): void {
    this.squadTicker.ticker_timeout = setInterval(() => {
      this.displaySquadTicker = false;
      setTimeout(() => { this.displaySquadTicker = true; }, 50)
      if ((this.squadTicker.ticker_index == 1 && this.squadTicker.ticker_direction)
        || (this.squadTicker.ticker_index == this.draftManagers.length && !this.squadTicker.ticker_direction)) {
        this.squadTicker.ticker_direction = !this.squadTicker.ticker_direction;
      } else if (this.squadTicker.ticker_direction) {
        this.squadTicker.ticker_index--;
        this.squadTicker.ticker_manager = this.draftManagers.find(dm => dm.draft_seed == this.squadTicker.ticker_index);
        this.squadTicker.ticker_squad = DraftFunctions.getDraftSquadForManager(this.squadTicker.ticker_manager);
      } else if (!this.squadTicker.ticker_direction) {
        this.squadTicker.ticker_index++;
        this.squadTicker.ticker_manager = this.draftManagers.find(dm => dm.draft_seed == this.squadTicker.ticker_index);
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
    var manager = this.draftManagers[Math.floor(Math.random() * this.draftManagers.length)];
    var manager2 = this.draftManagers[Math.floor(Math.random() * this.draftManagers.length)];
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
    randomStatements.push(`Safe-sex advocates Stourbridge steelers sign sponsorship deal with condom giant Durex.`);
    randomStatements.push(`HMRC probe club accounts of Tonbridge Tourists and FC Numbercrunchen in tax fiddling scandal`);
    randomStatements.push(`Secret source claims to have 'proof' of draw-fixing from Woodall brothers in 2019/20 season`);
    randomStatements.push(`Daniel Picken FURIOUS as Spuddersfield board enforce smoking ban at stadium`);
    randomStatements.push(`Soccer Boys coach Tony Nicklin adamant pre-season DOES matter`);
    randomStatements.push(`Thompson goes on CRAZY signing spree amidst Vhiskey bender. Due to meet board this evening.`);
    randomStatements.push(`Chris Eddowes ruffles feathers as he trials meat and booze restrictions at the Philth stadium`);
    randomStatements.push(`P. Nicklin of Woke Warriors refuses to comment on lack of custard pants`);
    randomStatements.push(`Northern Bandits boss Tom Westwood denies new baby will affect his performance this season`);
    randomStatements.push(`Wayne Nicklin said to be working on loophole to allow 4th Baggies player`);
    randomStatements.push(`Lee Woodall looking to secure first proper draft title this season`);

    return randomStatements[Math.floor(Math.random() * randomStatements.length)];
  }
}
