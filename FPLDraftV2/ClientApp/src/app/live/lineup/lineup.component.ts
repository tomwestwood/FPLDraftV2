import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { Club, Player, FPLBase, H2hLeagueMatch, Entry } from '../../models/fpl';
import { FplService } from '../../services/fpl.service';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Draft, DraftManager } from '../../models/draft';
import { DraftService } from '../../services/draft.service';
@Component({
  selector: 'app-lineup-component',
  templateUrl: './lineup.component.html',
  styleUrls: ['./lineup.component.scss'],
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
export class LineupComponent implements OnInit {
  entryId: number;
  gameweekId: number;
  entry: Entry;
  entryCaptain: Player;
  fplBase: FPLBase;
  draftManager: DraftManager;
  private sub: Subscription;

  constructor(private fplService: FplService, private draftService: DraftService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.fplService.getFplBase().subscribe((fplBase: FPLBase) => {
      this.fplBase = fplBase;
      this.draftService.getDraft().subscribe((draft: Draft) => {
        this.sub = this.route.params.subscribe((params) => {
          this.entryId = params.entryId;
          this.gameweekId = params.gameweekId;
          this.fplService.getEntry(this.entryId, this.gameweekId)
            .subscribe((entry: Entry) => {
              this.entry = entry;
              this.draftManager = draft.draft_managers.find(dm => dm.team_fpl_id == this.entryId);
              this.entry.picks.picks.forEach(p => p.player = this.fplBase.elements.find(e => e.id == p.playerId));
              this.entryCaptain = this.entry.picks.picks.find(p => p.isCaptain).player;
            });
        });
      });
    });

    
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  getBackground(): any {
    return { 'background': `linear-gradient(90deg, rgba(0,0,0,1) 0%, ${this.draftManager.team_colour_1} 100%)` };
  }

  getTextColour(): any {
    return { 'color': `${this.draftManager.team_colour_2}` };
  }

  getContainerStyle(): any {
    return { 'background-color': `${this.draftManager.team_colour_1}`, 'border': `solid ${this.draftManager.team_colour_2} 4px` };
  }

  getFillColour1(): any {
    return { 'background-color': `${this.draftManager.team_colour_1}` };
  }

  getFillColour2(): any {
    return { 'background-color': `${this.draftManager.team_colour_2}` };
  }
}
