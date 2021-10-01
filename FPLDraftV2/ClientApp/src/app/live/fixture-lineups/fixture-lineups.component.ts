import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { Club, Player, FPLBase, H2hLeagueMatch, Entry } from '../../models/fpl';
import { FplService } from '../../services/fpl.service';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Draft, DraftManager } from '../../models/draft';
import { DraftService } from '../../services/draft.service';
@Component({
  selector: 'app-fixture-lineups-component',
  templateUrl: './fixture-lineups.component.html',
  styleUrls: ['./fixture-lineups.component.scss'],
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
export class FixtureLineupsComponent implements OnInit {
  fixtureId: number;
  leagueId: number;
  gameweekId: number;
  fplBase: FPLBase;
  match: H2hLeagueMatch;
  private sub: Subscription;

  constructor(private fplService: FplService, private draftService: DraftService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.fplService.getFplBase().subscribe((fplBase: FPLBase) => {
      this.fplBase = fplBase;
      this.sub = this.route.params.subscribe((params) => {
        this.fixtureId = params.id;
        this.leagueId = params.leagueId;
        this.gameweekId = params.gameweekId;
        this.fplService.getFixture(this.leagueId, this.gameweekId, this.fixtureId)
          .subscribe((match: H2hLeagueMatch) => {
            this.match = match;
          });
      });      
    });

    
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  getBackgroundHome(): any {
    return { 'background': `linear-gradient(90deg, ${this.match.teamAManager.team_colour_1} 0%, rgba(0,0,0,1) 100%)` };
  }

  getTextColourHome(): any {
    return { 'color': `${this.match.teamAManager.team_colour_2}` };
  }

  getContainerStyleHome(): any {
    return { 'background-color': `${this.match.teamAManager.team_colour_1}`, 'border': `solid ${this.match.teamAManager.team_colour_2} 4px` };
  }

  getFillColour1Home(): any {
    return { 'background-color': `${this.match.teamAManager.team_colour_1}` };
  }

  getFillColour2Home(): any {
    return { 'background-color': `${this.match.teamAManager.team_colour_2}` };
  }


  getBackgroundAway(): any {
    return { 'background': `linear-gradient(90deg, rgba(0,0,0,1) 0%, ${this.match.teamBManager.team_colour_1} 100%)` };
  }

  getTextColourAway(): any {
    return { 'color': `${this.match.teamBManager.team_colour_2}` };
  }

  getContainerStyleAway(): any {
    return { 'background-color': `${this.match.teamBManager.team_colour_1}`, 'border': `solid ${this.match.teamBManager.team_colour_2} 4px` };
  }

  getFillColour1Away(): any {
    return { 'background-color': `${this.match.teamBManager.team_colour_1}` };
  }

  getFillColour2Away(): any {
    return { 'background-color': `${this.match.teamBManager.team_colour_2}` };
  }

  getHomeCaptain(): Player {
    return this.match.teamAEntry.picks.picks.find(p => p.isCaptain).player;
  }

  getAwayCaptain(): Player {
    return this.match.teamBEntry.picks.picks.find(p => p.isCaptain).player;
  }
}
