import { trigger, transition, style, animate, state } from '@angular/animations';
import { Component, Input } from '@angular/core';
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
  @Input() draft: Draft;

  constructor(private draftControllerService: DraftControllerService, public dialog: MatDialog) { }

  draftNextStatus(): void {
    switch (this.draft.status_id) {
      case DraftStatuses.NotStarted:
      case DraftStatuses.Timeout:
      case DraftStatuses.SigningComplete:
      case DraftStatuses.SigningFailed:
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
    return this.draft.status_id == DraftStatuses.NotStarted
      || this.draft.status_id == DraftStatuses.Waiting
      || this.draft.status_id == DraftStatuses.Timeout
      || this.draft.status_id == DraftStatuses.SigningComplete;
  }

  convertStatusToString(status: number): string {
    return DraftFunctions.convertStatusToString(status);
  }
  convertStatusToIcon(status: number): string {
    return DraftFunctions.convertStatusToIcon(status);
  }
}
