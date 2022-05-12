import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { Club, Player, FPLBase, H2hLeagueMatch, H2hLeague } from '../../models/fpl';
import { FplService } from '../../services/fpl.service';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-league-table-component',
  templateUrl: './league-table.component.html',
  styleUrls: ['./league-table.component.scss']
})
export class LeagueTableComponent implements OnInit {
  fixtureId: number;
  leagueId: number;
  gameweekId: number;
  fplBase: FPLBase;
  league: H2hLeague;
  private sub: Subscription;


  displayedColumns: string[] = ['liveRank', 'entryName', 'livePoints', 'liveGoalDifference'];

  constructor(private fplService: FplService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.getFplBase();

    this.sub = this.route.params.subscribe((params) => {
      this.fixtureId = params.id;
      this.leagueId = params.leagueId;
      this.gameweekId = params.gameweekId;
      this.fplService.getLiveLeague(this.leagueId)
        .subscribe((league: H2hLeague) => {
          this.league = league;
        });
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
