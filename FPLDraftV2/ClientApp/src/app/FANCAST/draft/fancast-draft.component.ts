import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { DraftService } from '../../services/draft.service';
import { Draft, DraftManager, DraftManagerPick, DraftFunctions } from '../../models/draft';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SignalRService } from '../../services/signalR.service';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
//import { ConfirmPlayerComponent } from '../controls/confirm-player/confirm-player.component';
//import { PreviewSquadComponent } from '../controls/preview-squad/preview-squad.component';
import { FancastPlayer } from '../models/fancast-player';
import { FancastSearchFilter } from '../models/fancast-search-filter';
import * as fancast_players_data from '../data/fancast_players.json';
import { HttpClient } from '@angular/common/http';
import { FancastConfirmPlayerComponent } from '../controls/confirm-player/fancast-confirm-player.component';
import { FancastPreviewSquadComponent } from '../controls/preview-squad/fancast-preview-squad.component';
import { FancastFunctions } from '../models/fancast_functions';

@Component({
  selector: 'fancast-draft-component',
  templateUrl: './fancast-draft.component.html',
  styleUrls: ['./fancast-draft.component.scss'],
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
export class FancastDraftComponent implements OnInit {
  draft_id: number = 6;
  draft: Draft;
  signed_in_manager: DraftManager;
  fancast_players: FancastPlayer[] = [];
  playerDataSource: MatTableDataSource<FancastPlayer>;
  displayedColumns: string[] = ['name', 'position', 'era', 'draftOptions'];
  searchFilter: FancastSearchFilter;
  private paginator: MatPaginator;
  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  private sort: MatSort;
  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
  }
  constructor(private draftService: DraftService, private signalRService: SignalRService, private _snackBar: MatSnackBar, private _ngZone: NgZone, public dialog: MatDialog, public http: HttpClient) { }
  ngOnInit() {
    this.searchFilter = new FancastSearchFilter();
    this.searchFilter.era = '';
    this.searchFilter.player_name = '';
    this.searchFilter.position = '';

    this.fancast_players = <FancastPlayer[]>fancast_players_data["default"];
    this.getDraftInfo();
    this.subscribeToEvents();
  }
  getDraftInfo(): void {
    this.draftService.getDraftById(this.draft_id)
      .subscribe((data: Draft) => {
        this.draft = data;
        this.draft.draft_manager = this.draft.draft_managers.find(dm => dm.id == this.draft.draft_manager_id);
        this.draftAssignPicks();
        //this.draft.draft_manager.draft_squad = DraftFunctions.getDraftSquadForManager(this.draft.draft_manager);
        this.updateFilter();
      });
  }
  draftAssignPicks(): void {
    this.draft.draft_managers.forEach(dm => {
      if (this.draft.draft_manager_picks) {
        dm.draft_manager_picks = this.draft.draft_manager_picks.filter(dmp => dmp.draft_manager_id == dm.id);
        dm.draft_manager_picks.forEach(dmp => {
          this.fancast_players.filter(fcp => fcp.id == dmp.player_id).forEach(fcp => {
            fcp.draft_manager_id = dm.id;
            fcp.draft_manager = dm;
            dmp.fancast_player = fcp;
          });
        });
        this.draft.draft_manager.fancast_draft_squad = FancastFunctions.getDraftSquadForManager(this.draft.draft_manager);
        if (this.signed_in_manager)
          this.signed_in_manager.fancast_draft_squad = FancastFunctions.getDraftSquadForManager(this.signed_in_manager);
      }
    });
  }
  subscribeToEvents(): void {
    this.signalRService.connectionEstablished.subscribe(() => {
      this._snackBar.open(`Connection established.`, 'Dismiss', { duration: 2000 });
    });

    this.signalRService.updateReceived.subscribe((draft: Draft) => {
      this._ngZone.run(() => {
        this.getDraftInfo();
      });
    });
    this.signalRService.pickReceived.subscribe((pick: DraftManagerPick) => {
      this._ngZone.run(() => {
        var dm = this.draft.draft_managers.find(dm => dm.id == this.draft.draft_manager_id);
        var player = this.fancast_players.find(p => p.id == pick.player_id);
        //dm.draft_manager_picks.push(pick);
        //this.draftAssignPicks();
        //this.announcePick(pick);
        this._snackBar.open(`${dm.name} has signed ${player.name} (${player.era}).`, 'Dismiss', { duration: 2000 });
      });
    });
  }
  playerSelection(element: FancastPlayer): void {
    if (this.draft.draft_manager.draft_manager_picks.filter(dmp => dmp.fancast_player.position == "GK").length >= 1 && element.position == "GK") {
      this._snackBar.open(`You have already selected a goalkeeper. Please select a different position.`, 'Dismiss', { duration: 2000 });
      return;
    }

    if (this.draft.draft_manager.draft_manager_picks.filter(dmp => dmp.fancast_player.era == element.era).length >= 6) {
      this._snackBar.open(`You have already selected 6 players from the ${element.era} era. Please select a different player.`, 'Dismiss', { duration: 2000 });
      return;
    }

    this.confirmPickDialog(element);
  }
  private confirmPickDialog(element: FancastPlayer): void {
    const dialogRef = this.dialog.open(FancastConfirmPlayerComponent, {
      data: { player: element }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.confirmPick(element);
      }
    });
  }
  private confirmPick(element: FancastPlayer): void {
    var dmp = new DraftManagerPick();
    dmp.draft_manager_id = this.draft.draft_manager_id;
    dmp.player_id = element.id;
    dmp.fancast_player = element;
    dmp.player_name = element.name;
    dmp.pick_order = this.draft.draft_manager.draft_manager_picks.length + 1;
    this.draftService.savePick(dmp)
      .subscribe(saved => {
        var basicPick = FancastFunctions.getBasicDraftManagerPickObject(dmp);
        this.signalRService.updatePick(basicPick);
        var player = this.fancast_players.find(a => a.id == dmp.player_id);
        if (player) {
          player.draft_manager = this.draft.draft_manager;
          player.draft_manager_id = this.draft.draft_manager_id;
        }
        this._snackBar.open(`${this.draft.draft_manager.team_name} signed ${element.name} (${element.era}).`, 'Dismiss', { duration: 2000 });
        this.draft.draft_manager.draft_manager_picks.push(dmp);
        this.draft.draft_manager_picks.push(dmp);
        this.draft.draft_manager.fancast_draft_squad = FancastFunctions.getDraftSquadForManager(this.draft.draft_manager);
        if (this.signed_in_manager) {
          this.signed_in_manager.draft_manager_picks.push(dmp);
          this.signed_in_manager.fancast_draft_squad = FancastFunctions.getDraftSquadForManager(this.signed_in_manager);
        }
        // this.loadUserTeam()...
        this.draftNextStatus();
        setTimeout(() => {
          this.getDraftInfo();
        }, 150);
      });
  }

  private viewSquad(): void {
    if (this.signed_in_manager) {
      const dialogRef = this.dialog.open(FancastPreviewSquadComponent, {
        data: { draftManager: this.draft.draft_managers.find(dm => dm.id == this.signed_in_manager.id) }
      });
    }
  }

  updateFilter(): void {
    let fancastPlayers = this.fancast_players;

    if (this.searchFilter.position.length > 0)
      fancastPlayers = fancastPlayers.filter(a => a.position == this.searchFilter.position);
    if (this.searchFilter.era.length > 0)
      fancastPlayers = fancastPlayers.filter(a => a.era == this.searchFilter.era);
    if (this.searchFilter.player_name)
      fancastPlayers = fancastPlayers.filter(a => a.name.toLocaleLowerCase().includes(this.searchFilter.player_name.toLocaleLowerCase()));

    this.playerDataSource = new MatTableDataSource(fancastPlayers);
    this.setDataSourceAttributes();
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
  convertStatusToIcon(status: number): string {
    switch (status) {
      case 1: return 'play_circle_outline';
      case 2: return 'access_time';
      case 3: return 'hourglass_top';
      case 5: return 'check';
      case 6: return 'block';
      default: return 'Unknown';
    }
  }
  draftNextStatus(): void {
    if (this.draft.status_id < 5) {
      this.draft.status_id++;
    }
    else {
      this.draft.status_id = 1;
      this.setNextUser();
    }
    this.updateDraftInfo();
  }
  draftBackStatus(): void {
    if (this.draft.status_id > 1) {
      this.draft.status_id--;
    }
    this.updateDraftInfo();
  }
  getPickNumber(manager: DraftManager): number {
    if (manager.draft_manager_picks.length > 0) {
      return manager.draft_manager_picks.length + 1;
    } else {
      return 11;
    }
  }

  signInAs(manager: DraftManager) {
    this.signed_in_manager = manager;
    this.getDraftInfo();
  }

  private updateDraftInfo(): void {
    this.draftService.updateDraft(this.draft)
      .subscribe(d => {
        this.signalRService.updateDraft(this.draft);
      });
  }
  private setNextUser(): void {
    var currentSeed = this.draft.draft_manager.draft_seed;
    var nextSeed = currentSeed;
    var draftDirection = this.draft.direction;
    if ((currentSeed == 1 && draftDirection) || (currentSeed == this.draft.draft_managers.length && !draftDirection)) {
      this.draft.direction = !draftDirection;
    } else {
      nextSeed = draftDirection ? currentSeed - 1 : currentSeed + 1;
    }
    this.updateDraftManager(nextSeed);
    this.clearFilters();
  }
  private updateDraftManager(seed: number): void {
    this.draft.draft_manager = this.draft.draft_managers.find(dm => dm.draft_seed == seed);
    this.draft.draft_manager_id = this.draft.draft_manager.id;
    var numOfPicks = this.draft.draft_manager.draft_manager_picks.length;
    if (numOfPicks < 11) {
      this.draft.status_id = 2;
    } else {
      if (this.draft.draft_managers.find(dm => dm.draft_manager_picks.length < 11)) {
        this.setNextUser();
      } else {
        this.draft.status_id = 5;
      }
    }
    this.draftAssignPicks();
    this.updateFilter();
  }
  private setDataSourceAttributes() {
    if (this.paginator && this.playerDataSource) {
      this.playerDataSource.paginator = this.paginator;
      this.playerDataSource.sort = this.sort;
    }
  }
  private clearFilters(): void {
    this.searchFilter.player_name = '';
    this.searchFilter.position = '';
    this.searchFilter.era = '';
    this.updateFilter();
  }
}
