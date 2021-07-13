import { trigger, transition, style, animate, state } from '@angular/animations';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { stat } from 'fs';
import { Draft, DraftFunctions, DraftStatuses } from '../../models/draft';
import { DraftControllerService } from '../services/draft-controller.service';
@Component({
  selector: 'draft-header-component',
  templateUrl: './draft-header.component.html',
  styleUrls: ['./draft-header.component.scss'],
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
export class DraftHeaderComponent {
  draft: Draft;
  draftControllerService: DraftControllerService;

  constructor(draftControllerService: DraftControllerService, public dialog: MatDialog) {
    this.draftControllerService = draftControllerService;
    draftControllerService.draft.subscribe((draft: Draft) => {
      this.draft = draft;
    });
  }

  draftNextStatus(): void {
    switch (this.draft.status_id) {
      case 1:
      case 6:
      case 11:
      case 12:
        this.draftControllerService.setDraftStatus(DraftStatuses.Waiting);
        break;
      case 2:
        this.draftControllerService.setDraftStatus(DraftStatuses.Drafting);
      break;    
      default:
        return;
    }
  }

  enableContinueButton(): boolean {
    return this.draft.status_id == 1 || this.draft.status_id == 2;
  }

  convertStatusToString(status: number): string {
    return DraftFunctions.convertStatusToString(status);
  }
  convertStatusToIcon(status: number): string {
    return DraftFunctions.convertStatusToIcon(status);
  }
  private viewSquad(): void {
    //const dialogRef = this.dialog.open(PreviewSquadComponent, {
    //  data: { draftManager: this.draft.draft_manager }
    //});
  }
}
