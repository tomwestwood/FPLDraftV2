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
import { trigger, transition, style, animate, state } from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-favouritelist-component',
  templateUrl: './favouritelist.component.html',
  styleUrls: ['./favouritelist.component.scss'],
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
export class FavouritelistComponent implements OnInit {
  fplBase: FPLBase;
  draft: Draft;
  draft_manager: DraftManager;
  signInCode: string;
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
  constructor(private fplService: FplService, private draftService: DraftService, private _snackBar: MatSnackBar, private _ngZone: NgZone, public dialog: MatDialog) { }
  ngOnInit() {
    this.searchFilter = new SearchFilter();
    this.getFplBase();
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
        this.draftAssignFavourites();
        this.updateFilter();
      });
  }
  signIn(code: string): void {
    var manager = this.getManagerFromCode();
    if (manager) {
      this.draft_manager = manager;
      this.draftAssignFavourites();
    } else {
      alert(`Incorrect code, no manager found.`);
    }
  }
  draftAssignFavourites(): void {
    this.fplBase.elements.forEach(e => { e.favourited = false; });
    this.draftService.getFavourites(this.draft_manager.id)
      .subscribe((favourites: DraftManagerFavourite[]) => {
        if (favourites) {
          favourites.forEach(f => {
            this.fplBase.elements.find(e => e.id == f.player_id).favourited = true;
          });
        }
      });
  }
  playerSelection(element: Player): void {
    if (element.favourited) {
      this.unfavouritePlayer(element);
      return;
    }
    if (this.fplBase.elements.filter(e => e.favourited).length >= 15) {
      this._snackBar.open(`You already have favourited 15 players. Please remove some to continue.`, 'Dismiss', { duration: 2000 });
      return;
    }
    this.favouritePlayer(element);
  }
  updateFilter(): void {
    let tempFplBase = this.fplBase.elements;
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
  private favouritePlayer(element: Player): void {
    var dmf = new DraftManagerFavourite();
    dmf.draft_manager_id = this.draft_manager.id;
    dmf.player_id = element.id;
    dmf.player = element;
    this.draftService.favouritePlayer(dmf)
      .subscribe(saved => {
        var player = this.fplBase.elements.find(a => a.id == dmf.player_id);
        if (player) {
          player.favourited = true;
        }
        this._snackBar.open(`You favourited ${element.web_name} (${element.club.name}).`, 'Dismiss', { duration: 2000 });
      });
  }
  private unfavouritePlayer(element: Player): void {
    var dmf = new DraftManagerFavourite();
    dmf.draft_manager_id = this.draft_manager.id;
    dmf.player_id = element.id;
    dmf.player = element;
    this.draftService.unfavouritePlayer(dmf)
      .subscribe(saved => {
        var player = this.fplBase.elements.find(a => a.id == dmf.player_id);
        if (player) {
          player.favourited = false;
        }
        this._snackBar.open(`You unfavourited ${element.web_name} (${element.club.name}).`, 'Dismiss', { duration: 2000 });
      });
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
  private getManagerFromCode(): DraftManager {
    var transformedCode: number;
    switch (this.signInCode) {
      case '3812':
        transformedCode = 1;
        break;
      case '2664':
        transformedCode = 3;
        break;
      case '8432':
        transformedCode = 4;
        break;
      case '2836':
        transformedCode = 5;
        break;
      case '9642':
        transformedCode = 6;
        break;
      case '1092':
        transformedCode = 7;
        break;
      case '8273':
        transformedCode = 8;
        break;
      case '3281':
        transformedCode = 9;
        break;
      case '1922':
        transformedCode = 10;
        break;
      case '3919':
        transformedCode = 11;
        break;
      case '9283':
        transformedCode = 12;
        break;
      case '6326':
        transformedCode = 13;
        break;
    }
    return this.draft.draft_managers.find(dm => dm.id == transformedCode);
  }
}
