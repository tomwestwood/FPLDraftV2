import { Component, Inject, OnInit } from '@angular/core';
import { FPLBase } from '../../../models/fpl';
import { Draft, DraftFunctions, DraftManager } from '../../../models/draft';
import { DraftControllerService } from '../../../draft/services/draft-controller.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
  selector: 'app-terminal-waiting-component',
  templateUrl: './terminal-waiting.component.html',
  styleUrls: ['./terminal-waiting.component.scss']
})
export class TerminalWaitingComponent implements OnInit {
  draft: Draft;
  squadManager: DraftManager;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.draft = data.draft;
    this.squadManager = data.squadManager;
    this.updateManagerSquad();
  }

  ngOnInit() {
    this.updateManagerSquad();
  }

  private updateManagerSquad(): void {
    if (this.draft && this.squadManager) {
      this.squadManager.draft_squad = DraftFunctions.getDraftSquadForManager(this.squadManager);
    }
  }
}
