import { trigger, transition, style, animate, state } from '@angular/animations';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { stat } from 'fs';
import { ConfirmPlayerComponent } from '../../controls/confirm-player/confirm-player.component';
import { Draft, DraftFunctions, DraftManagerPick, DraftStatuses } from '../../models/draft';
import { FPLBase, Player } from '../../models/fpl';
import { DraftControllerService } from '../services/draft-controller.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SearchFilter } from '../../models/searchFilter';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'draft-selecting-component',
  templateUrl: './draft-selecting.component.html',
  styleUrls: ['./draft-selecting.component.scss'],
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
export class DraftSelectingComponent implements OnInit {
  @Input() draft: Draft;
  @Input() fplBase: FPLBase;
  draftStatuses: DraftStatuses;
  showDraftSelecting: boolean = false;
  draftCountdown: number = 3;

  playerDataSource: MatTableDataSource<Player>;
  displayedColumns: string[] = ['web_name', 'position', 'club', 'now_cost', 'draftOptions'];
  searchFilter: SearchFilter;

  timer: number = 30;
  timeout: NodeJS.Timeout;

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

  constructor(private draftControllerService: DraftControllerService, public dialog: MatDialog, private _snackBar: MatSnackBar) {
    draftControllerService.fplBase.subscribe((fplBase: FPLBase) => {
      if (this.fplBase) {
        this.updateFilter();
      }
    });
  }

  ngOnInit(): void {
    if (this.fplBase) {
      this.updateFilter();
    }

    this.searchFilter = new SearchFilter();
    this.showDraftSelecting = false;
    this.draftCountdown = 3;
    this.timeout = setInterval(() => {
      if (this.draftCountdown > 0) {
        this.draftCountdown--;
      }
    }, 1000);

    setTimeout(() => {
      this.showDraftSelecting = true;
      this.startTimer();
    }, 3000);
  }

  selectPlayer(element: Player): void {
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
    } else if ((this.draft.draft_manager.draft_manager_picks.reduce(function (a, b) { return a + (b.signed_price) }, 0) + (element.now_cost / 10)) > 100) {
      this._snackBar.open(`Your team value would exceed ??100.0m. Please select a cheaper option.`, 'Dismiss', { duration: 2000 });
      return;
    }
    this.confirmPickDialog(element);
  }

  updateFilter(): void {
    let tempFplBase = this.fplBase.elements.filter(a => !this.draft.draft_manager_picks.some(dmp => dmp.player_id == a.id));
    if (this.searchFilter?.position_id > 0)
      tempFplBase = tempFplBase.filter(a => a.position.id == this.searchFilter.position_id);
    if (this.searchFilter?.club_id > 0)
      tempFplBase = tempFplBase.filter(a => a.club.id == this.searchFilter.club_id);
    if (this.searchFilter?.showFavourites) {
      tempFplBase = tempFplBase.filter(a => a.favourited);
    }

    this.playerDataSource = new MatTableDataSource(tempFplBase);
    this.playerDataSource.filter = '';
    if (this.searchFilter?.player_name)
      this.playerDataSource.filter = this.searchFilter.player_name.trim().toLocaleLowerCase();
    this.setDataSourceAttributes();
  }

  private confirmPickDialog(element: Player): void {
    const dialogRef = this.dialog.open(ConfirmPlayerComponent, {
      data: { player: element }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._snackBar.open('You picked: ' + element.web_name, 'Dismiss', { duration: 2000 });
        this.confirmPlayerSelection(element);
      }
    });
  }

  private confirmPlayerSelection(player: Player) {
    let isDraftAuction = this.draftControllerService.draftIsAuction();
    var dmp = new DraftManagerPick();
    dmp.nominator_id = this.draft.draft_manager_id;
    dmp.player_id = player.id;
    dmp.player = player;
    dmp.draft_id = this.draft.id;
    dmp.value_price = player.now_cost / 10;
    dmp.pick_order = this.draft.draft_round;

    let dmsLeftInRound = this.draftControllerService.getRemainingDraftManagersInRound(this.draft.draft_managers, this.draft.draft_round, this.draft.draft_manager.draft_seed, this.draft.direction).filter(dm => dm.id != this.draft.draft_manager.id);

    if (!isDraftAuction || dmsLeftInRound.length == 0) {
      dmp.signed_price = player.now_cost / 10;
      dmp.draft_manager_id = this.draft.draft_manager_id;
    }

    this.stopTimer();

    this.draftControllerService.savePick(dmp).subscribe((savedDmp: DraftManagerPick) => {
      var basicPick = DraftFunctions.getBasicDraftManagerPickObject(savedDmp);
      this.draftControllerService.updatePickNotification(basicPick);

      if (!isDraftAuction || dmsLeftInRound.length == 0) {
        var player = this.fplBase.elements.find(a => a.id == savedDmp.player_id);
        if (player) {
          player.draft_manager = this.draft.draft_manager;
          player.draft_manager_id = this.draft.draft_manager_id;
          this.draft.draft_manager.draft_manager_picks.push(savedDmp);
        }
      }

      this.draft.draft_manager_picks.push(savedDmp);
      this.draft.draft_manager.draft_squad = DraftFunctions.getDraftSquadForManager(this.draft.draft_manager);
      this.draftControllerService.draft.next(this.draft);

      if (!isDraftAuction || dmsLeftInRound.length == 0) {
        this.draftControllerService.setDraftStatus(DraftStatuses.SigningComplete);
      } else {
        this.draftControllerService.setDraftStatus(DraftStatuses.SealedBids);
      }

      this.draftControllerService.saveDraft(this.draft).subscribe((draft: Draft) => {
        this.draftControllerService.draft.next(this.draft);
      });
    });
  }

  private startTimer(): void {
    this.stopTimer();
    this.timer = 30;

    this.timeout = setInterval(() => {
      if (this.timer > 0) {
        this.timer--;
      } else {
        this.timeElapsed();
      }
    }, 1000);
  }

  private stopTimer(): void {
    clearInterval(this.timeout);
  }

  private timeElapsed(): void {
    this.stopTimer();
    this.draftControllerService.setDraftStatus(DraftStatuses.Timeout);
  }

  private setDataSourceAttributes() {
    this.playerDataSource.paginator = this.paginator;
    if (this.playerDataSource.paginator) {
      this.playerDataSource.paginator.pageSize = this.draft.draft_manager_id == 27 ? 50 : 10;
    }
    this.playerDataSource.sort = this.sort;
  }
}
