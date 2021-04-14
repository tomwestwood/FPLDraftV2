import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
//import { Club, Player, FPLBase } from '../models/fpl';
//import { FplService } from '../services/fpl.service';
//import { DraftService } from '../services/draft.service';
import { Draft, DraftManager, DraftManagerFavourite, DraftManagerPick, SquadTicker, DraftSquad, FancastSquadTicker } from '../../models/draft';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SignalRService } from '../../services/signalR.service';
import { trigger, transition, style, animate, state } from '@angular/animations';
import * as fancast_players_data from '../data/fancast_players.json';
import { FancastPlayer } from '../models/fancast-player';
import { DraftService } from '../../services/draft.service';
import { FancastFunctions } from '../models/fancast_functions';
import { FancastDraftSquad } from '../models/fancast_draft_squad';

@Component({
  selector: 'app-fancast-terminal-component',
  templateUrl: './fancast-terminal.component.html',
  styleUrls: ['./fancast-terminal.component.scss'],
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
export class FancastTerminalComponent implements OnInit {
  fancast_players: FancastPlayer[] = [];
  draftManagers: DraftManager[];
  draft: Draft;
  announcementManager: DraftManager;
  announcementPick: DraftManagerPick;
  announcementSquad: FancastDraftSquad;
  fancastSquadTicker: FancastSquadTicker;
  displaySquadTicker: boolean;
  statusUpdated: boolean;
  managerUpdated: boolean;
  breakingNews: boolean;
  announcingPick: boolean;

  tickerItems: string[];

  constructor(private draftService: DraftService, private signalRService: SignalRService, private _snackBar: MatSnackBar, private _ngZone: NgZone) { }
  ngOnInit() {
    this.displaySquadTicker = true;
    this.statusUpdated = true;
    this.managerUpdated = true;
    this.breakingNews = false;

    this.getFancastPlayers();
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

  getPlayerImage(player: FancastPlayer): string {
    return `https://fplplusstorage.blob.core.windows.net/images/6/${player.name}.jpg`;
  }

  private subscribeToEvents(): void {
    this.signalRService.connectionEstablished.subscribe(() => {
      // show connected or something
    });
    this.signalRService.updateReceived.subscribe((draft: Draft) => {
      this._ngZone.run(() => {
        var updateManager = this.draft.draft_manager.id != draft.draft_manager.id;
        var draftSquad = this.draft.draft_manager.fancast_draft_squad;

        this.draft = draft;

        this.statusUpdated = false;
        setTimeout(() => { this.statusUpdated = true; }, 50)
        if (updateManager) {
          this.draft.draft_manager = this.draftManagers.find(dm => dm.id == this.draft.draft_manager.id);
          this.draft.draft_manager.fancast_draft_squad = FancastFunctions.getDraftSquadForManager(this.draft.draft_manager);
          this.managerUpdated = false;
          setTimeout(() => { this.managerUpdated = true; }, 50)
        } else {
          this.draft.draft_manager.fancast_draft_squad = draftSquad;
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
  private getFancastPlayers(): void {
    this.fancast_players = <FancastPlayer[]>fancast_players_data["default"];
    this.getDraftInfo();
  }

  private getDraftInfo() {
    this.draftService.getDraftById(6)
      .subscribe(draft => {
        this.draft = draft;
        this.draftManagers = draft.draft_managers;
        this.draftAssignPicks();
        this.draft.draft_manager = draft.draft_managers.find(dm => dm.id == this.draft.draft_manager_id);
        this.initialiseSquadTicker();
        if (draft.draft_manager) {
          this.draft.draft_manager.fancast_draft_squad = FancastFunctions.getDraftSquadForManager(this.draft.draft_manager);
        }
      });
  }

  private draftAssignPicks(): void {
    this.draftManagers.forEach(dm => {
      if (this.draft.draft_manager_picks) {
        dm.draft_manager_picks = this.draft.draft_manager_picks.filter(dmp => dmp.draft_manager_id == dm.id);
        //dm.draft_squad = DraftFunctions.getDraftSquadForManager(dm);
        dm.draft_manager_picks.forEach(dmp => {
          this.fancast_players.filter(e => e.id == dmp.player_id).forEach(e => {
            e.draft_manager_id = dm.id;
            e.draft_manager = dm;
            dmp.fancast_player = e;
          });
        });
      }
    });
  }

  private announcePick(pick: DraftManagerPick): void {

    this.breakingNews = true;
    this.announcementManager = this.draft.draft_manager;
    this.announcementSquad = undefined;

    this.draftService.getDraftById(6)
      .subscribe(draft => {
        this.draft = draft;
        this.draftManagers = draft.draft_managers;
        this.draftAssignPicks();
        this.draft.draft_manager = draft.draft_managers.find(dm => dm.id == this.draft.draft_manager_id);
        this.announcementManager.draft_manager_picks = this.draft.draft_manager.draft_manager_picks;

        setTimeout(() => {
          this.breakingNews = false;
          this.announcingPick = true;
          this.announcementPick = pick;
          this.announcementSquad = FancastFunctions.getDraftSquadForManager(this.announcementManager);
          setTimeout(() => {
            this.draft.draft_manager = this.draftManagers.find(dm => dm.id == this.draft.draft_manager.id);
            this.draft.draft_manager.fancast_draft_squad = FancastFunctions.getDraftSquadForManager(this.draft.draft_manager);
            this.announcingPick = false;
          }, 10000);
        }, 2000);
      });
  }

  private initialiseSquadTicker(): void {
    this.fancastSquadTicker = new FancastSquadTicker();
    this.fancastSquadTicker.ticker_index = 1;
    this.fancastSquadTicker.ticker_direction = false;
    this.fancastSquadTicker.ticker_manager = this.draftManagers.find(dm => dm.draft_seed == 1);
    this.fancastSquadTicker.ticker_squad = FancastFunctions.getDraftSquadForManager(this.fancastSquadTicker.ticker_manager);
    this.fancastSquadTickerTimer();
  }
  private fancastSquadTickerTimer(): void {
    this.fancastSquadTicker.ticker_timeout = setInterval(() => {
      this.displaySquadTicker = false;
      setTimeout(() => { this.displaySquadTicker = true; }, 50)
      if ((this.fancastSquadTicker.ticker_index == 1 && this.fancastSquadTicker.ticker_direction)
        || (this.fancastSquadTicker.ticker_index == this.draftManagers.length && !this.fancastSquadTicker.ticker_direction)) {
        this.fancastSquadTicker.ticker_direction = !this.fancastSquadTicker.ticker_direction;
      } else if (this.fancastSquadTicker.ticker_direction) {
        this.fancastSquadTicker.ticker_index--;
        this.fancastSquadTicker.ticker_manager = this.draftManagers.find(dm => dm.draft_seed == this.fancastSquadTicker.ticker_index);
        this.fancastSquadTicker.ticker_squad = FancastFunctions.getDraftSquadForManager(this.fancastSquadTicker.ticker_manager);
      } else if (!this.fancastSquadTicker.ticker_direction) {
        this.fancastSquadTicker.ticker_index++;
        this.fancastSquadTicker.ticker_manager = this.draftManagers.find(dm => dm.draft_seed == this.fancastSquadTicker.ticker_index);
        this.fancastSquadTicker.ticker_squad = FancastFunctions.getDraftSquadForManager(this.fancastSquadTicker.ticker_manager);
      }
      //this.displaySquadTicker = true;
    }, 10000);
  }
}
