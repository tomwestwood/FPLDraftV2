import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { FancastPlayer } from '../models/fancast-player';
@Injectable({ providedIn: 'root' })
export class FancastService {
  private fplBaseUrl = '/api/fpl';
  constructor(private http: HttpClient) { }

  getPlayers(): Observable<FancastPlayer[]> {
    return this.http.get<FancastPlayer[]>(this.fplBaseUrl + '/players');
  }
}
