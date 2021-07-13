import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Player, Position, Club, FPLBase, H2hLeagueMatch, H2hLeagueEntry, H2hLeague } from '../models/fpl';
@Injectable({ providedIn: 'root' })
export class FplService {
  private fplBaseUrl = '/api/fpl';
  constructor(private http: HttpClient) { }
  getFplBase(): Observable<FPLBase> {
    return this.http.get<FPLBase>(this.fplBaseUrl);
  }
  getPlayers(): Observable<Player[]> {
    return this.http.get<Player[]>(this.fplBaseUrl + '/players');
  }
  getClubs(): Observable<Club[]> {
    return this.http.get<Club[]>(this.fplBaseUrl + '/clubs');
  }
  getPositions(): Observable<Position[]> {
    return this.http.get<Position[]>(this.fplBaseUrl + '/positions');
  }

  getFixture(leagueId: number, gameweekId: number, fixtureId: number): Observable<H2hLeagueMatch> {
    return this.http.get<H2hLeagueMatch>(this.fplBaseUrl + `/getFixture/${leagueId}/${gameweekId}/${fixtureId}`);
  }

  getLiveLeague(leagueId: number): Observable<H2hLeague> {
    return this.http.get<H2hLeague>(this.fplBaseUrl + `/getLiveLeague/${leagueId}`);
  }
}
