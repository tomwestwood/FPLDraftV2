import { Component, Inject, OnInit } from '@angular/core';
import { FPLBase } from '../../../models/fpl';
import { Draft } from '../../../models/draft';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { DraftControllerService } from '../../../draft/services/draft-controller.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
  selector: 'app-terminal-timeout-component',
  templateUrl: './terminal-timeout.component.html',
  styleUrls: ['./terminal-timeout.component.scss']
})
export class TerminalTimeoutComponent {
  draft: Draft;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.draft = data.draft;
  }
}
