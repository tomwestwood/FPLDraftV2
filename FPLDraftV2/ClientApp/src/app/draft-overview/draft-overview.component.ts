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
  selector: 'app-draft-overview-component',
  templateUrl: './draft-overview.component.html',
  styleUrls: ['./draft-overview.component.scss'],
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
export class DraftOverviewComponent {
  draft: Draft;

  constructor(private draftService: DraftService) {
    this.getDraftInfo();
  }

  getDraftInfo(): void {
    this.draftService.getDraft()
      .subscribe((data: Draft) => {
        this.draft = data;
      });
  }
}
