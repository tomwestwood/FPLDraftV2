import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { Club, Player, FPLBase } from '../models/fpl';
import { FplService } from '../services/fpl.service';
import { DraftService } from '../services/draft.service';
import { Draft, DraftManager, DraftManagerFavourite, DraftManagerPick, DraftFunctions } from '../models/draft';
import { SearchFilter } from '../models/searchFilter';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SignalRService } from '../services/signalR.service';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmPlayerComponent } from '../controls/confirm-player/confirm-player.component';
import { PreviewSquadComponent } from '../controls/preview-squad/preview-squad.component';
@Component({
  selector: 'app-draft-component',
  templateUrl: './draft.component.html',
  styleUrls: ['./draft.component.scss'],
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
export class DraftComponent implements OnInit {
  fplBase: FPLBase;
  draft: Draft;
  timer: number = 30;
  timeout: NodeJS.Timeout;
  playerDataSource: MatTableDataSource<Player>;
  displayedColumns: string[] = ['web_name', 'position', 'club', 'now_cost', 'draftOptions'];
  searchFilter: SearchFilter;
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
  constructor(private fplService: FplService, private draftService: DraftService, private signalRService: SignalRService, private _snackBar: MatSnackBar, private _ngZone: NgZone, public dialog: MatDialog) { }
  ngOnInit() {
    this.searchFilter = new SearchFilter();
    this.getFplBase();
    this.subscribeToEvents();
  }
  getFplBase(): void {
    this.fplService.getFplBase()
      .subscribe((data: FPLBase) => {
        this.fplBase = data;
        this.getDraftInfo();
        this.updateFilter();
      });
  }
  getDraftInfo(): void {
    this.draftService.getDraft()
      .subscribe((data: Draft) => {
        this.draft = data;
        this.draft.draft_manager = this.draft.draft_managers.find(dm => dm.id == this.draft.draft_manager_id)
        this.draftAssignPicks();
        this.draft.draft_manager.draft_squad = DraftFunctions.getDraftSquadForManager(this.draft.draft_manager);
        this.draftAssignFavourites();
        this.updateFilter();
      });
  }
  draftAssignPicks(): void {
    this.draft.draft_managers.forEach(dm => {
      if (this.draft.draft_manager_picks) {
        dm.draft_manager_picks = this.draft.draft_manager_picks.filter(dmp => dmp.draft_manager_id == dm.id);
        dm.draft_manager_picks.forEach(dmp => {
          this.fplBase.elements.filter(e => e.id == dmp.player_id).forEach(e => {
            e.draft_manager_id = dm.id;
            e.draft_manager = dm;
            dmp.player = e;
          });
        });
        this.draft.draft_manager.draft_squad = DraftFunctions.getDraftSquadForManager(this.draft.draft_manager);
      }
    });
  }
  draftAssignFavourites(): void {
    this.fplBase.elements.forEach(e => { e.favourited = false; });
    this.draftService.getFavourites(this.draft.draft_manager_id)
      .subscribe((favourites: DraftManagerFavourite[]) => {
        if (favourites) {
          favourites.forEach(f => {
            this.fplBase.elements.find(e => e.id == f.player_id).favourited = true;
          });
        }
      });
  }
  subscribeToEvents(): void {
    this.signalRService.connectionEstablished.subscribe(() => {
      this._snackBar.open(`Connection established.`, 'Dismiss', { duration: 2000 });
    });
  }
  playerSelection(element: Player): void {
    if (this.draft.draft_manager.draft_manager_picks.filter(dmp => dmp.player.club.code == element.club.code).length >= 3) {
      this._snackBar.open(`You already have 3 players from ${element.club.name}. Please select another player.`, 'Dismiss', { duration: 2000 });
      return;
    }
    if (element.position.id == 1 && this.draft.draft_manager.draft_manager_picks.filter(dmp => dmp.player.position.id == 1).length >= 2) {
      this._snackBar.open(`You have already selected 2 goalkeepers. Please select a player from another position.`, 'Dismiss', { duration: 2000 });
      return;
    } else if (element.position.id == 2 && this.draft.draft_manager.draft_manager_picks.filter(dmp => dmp.player.position.id == 2).length >= 5) {
      this._snackBar.open(`You have already selected 5 defenders. Please select a player from another position.`, 'Dismiss', { duration: 2000 });
      return;
    } else if (element.position.id == 3 && this.draft.draft_manager.draft_manager_picks.filter(dmp => dmp.player.position.id == 3).length >= 5) {
      this._snackBar.open(`You have already selected 5 midfielders. Please select a player from another position.`, 'Dismiss', { duration: 2000 });
      return;
    } else if (element.position.id == 4 && this.draft.draft_manager.draft_manager_picks.filter(dmp => dmp.player.position.id == 4).length >= 3) {
      this._snackBar.open(`You have already selected 3 forwards. Please select a player from another position.`, 'Dismiss', { duration: 2000 });
      return;
    } else if ((this.draft.draft_manager.draft_manager_picks.reduce(function (a, b) { return a + (b.player.now_cost / 10) }, 0) + (element.now_cost / 10)) > 100) {
      this._snackBar.open(`Your team value exceeds 100.0m. Please select a cheaper option.`, 'Dismiss', { duration: 2000 });
      return;
    }
    this.confirmPickDialog(element);
  }
  private confirmPickDialog(element: Player): void {
    const dialogRef = this.dialog.open(ConfirmPlayerComponent, {
      data: { player: element }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.confirmPick(element);
      }
    });
  }
  private confirmPick(element: Player): void {
    var dmp = new DraftManagerPick();
    dmp.draft_manager_id = this.draft.draft_manager_id;
    dmp.player_id = element.id;
    dmp.player = element;
    dmp.pick_order = this.draft.draft_manager.draft_manager_picks.length + 1;
    this.stopDraftTimer();
    this.draftService.savePick(dmp)
      .subscribe(saved => {
        var basicPick = DraftFunctions.getBasicDraftManagerPickObject(dmp);
        this.signalRService.updatePick(basicPick);
        var player = this.fplBase.elements.find(a => a.id == dmp.player_id);
        if (player) {
          player.draft_manager = this.draft.draft_manager;
          player.draft_manager_id = this.draft.draft_manager_id;
        }
        this._snackBar.open(`${this.draft.draft_manager.team_name} signed ${element.web_name} (${element.club.name}).`, 'Dismiss', { duration: 2000 });
        this.draft.draft_manager.draft_manager_picks.push(dmp);
        this.draft.draft_manager_picks.push(dmp);
        this.draft.draft_manager.draft_squad = DraftFunctions.getDraftSquadForManager(this.draft.draft_manager);
        // this.loadUserTeam()...
        this.draftNextStatus();
        this.stopDraftTimer();
      });
  }

  private viewSquad(): void {
    const dialogRef = this.dialog.open(PreviewSquadComponent, {
      data: { draftManager: this.draft.draft_manager }
    });
  }

  updateFilter(): void {
    let tempFplBase = this.fplBase.elements.filter(a => a.draft_manager == undefined);
    if (this.searchFilter.position_id > 0)
      tempFplBase = tempFplBase.filter(a => a.position.id == this.searchFilter.position_id);
    if (this.searchFilter.club_id > 0)
      tempFplBase = tempFplBase.filter(a => a.club.id == this.searchFilter.club_id);
    if (this.searchFilter.showFavourites) {
      tempFplBase = tempFplBase.filter(a => a.favourited);
    }

    this.playerDataSource = new MatTableDataSource(tempFplBase);
    this.playerDataSource.filter = '';
    if (this.searchFilter.player_name)
      this.playerDataSource.filter = this.searchFilter.player_name.trim().toLocaleLowerCase();
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
      if (this.draft.status_id == 4) {
        this.startDraftTimer();
      } else if (this.draft.status_id == 5) {
        this.stopDraftTimer();
      }
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
  getRemainingBudget(manager: DraftManager): number {
    if (manager.draft_manager_picks.length > 0) {
      return 100 - (manager.draft_manager_picks.reduce(function (a, b) { return a + (b.player.now_cost / 10) }, 0));
    } else {
      return 100.0;
    }
  }
  getPickNumber(manager: DraftManager): number {
    if (manager.draft_manager_picks.length > 0) {
      return manager.draft_manager_picks.length + 1;
    } else {
      return 15;
    }
  }
  private updateDraftInfo(): void {
    this.draftService.updateDraft(this.draft)
      .subscribe(d => {
        this.signalRService.updateDraft(this.draft);
      });
  }
  private startDraftTimer(): void {
    this.stopDraftTimer();
    this.timer = 30;
    this.timeout = setInterval(() => {
      if (this.timer > 0) {
        this.timer--;
        if (this.timer == 10) {
          this._snackBar.open('10 seconds remaining', 'Dismiss', { duration: 2000 });
        }
      } else {
        this.timeElapsed();
      }
    }, 1000);
  }
  private timeElapsed(): void {
    this.stopDraftTimer();
    this.draft.status_id = 6; //TIMEOUT
    this.updateDraftInfo();
  }
  private stopDraftTimer(): void {
    clearInterval(this.timeout);
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
    if (numOfPicks < 15) {
      this.draft.status_id = 2;
    } else {
      this.setNextUser();
    }
    this.draftAssignPicks();
    this.draftAssignFavourites();
    this.updateFilter();
  }
  private setDataSourceAttributes() {
    this.playerDataSource.paginator = this.paginator;
    this.playerDataSource.sort = this.sort;
  }
  private clearFilters(): void {
    this.searchFilter.club_id = 0;
    this.searchFilter.position_id = 0;
    this.searchFilter.player_name = '';
    this.searchFilter.showFavourites = false;
    this.updateFilter();
  }
}
