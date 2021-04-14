import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { Club, Player, FPLBase, H2hLeagueMatch } from '../../models/fpl';
import { FplService } from '../../services/fpl.service';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-livefixture-component',
  templateUrl: './livefixture.component.html',
  styleUrls: ['./livefixture.component.scss'],
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
export class LiveFixtureComponent implements OnInit {
  fixtureId: number;
  leagueId: number;
  gameweekId: number;
  fplBase: FPLBase;
  match: H2hLeagueMatch;
  private sub: Subscription;

  constructor(private fplService: FplService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.getFplBase();

    this.sub = this.route.params.subscribe((params) => {
      this.fixtureId = params.id;
      this.leagueId = params.leagueId;
      this.gameweekId = params.gameweekId;
      this.fplService.getFixture(this.leagueId, this.gameweekId, this.fixtureId)
        .subscribe((match: H2hLeagueMatch) => {
          this.match = match;
        });
      // load the teams
      // load the points
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  private getFplBase(): void {
    this.fplService.getFplBase()
      .subscribe((data: FPLBase) => {
        this.fplBase = data;
      });
  }
}
