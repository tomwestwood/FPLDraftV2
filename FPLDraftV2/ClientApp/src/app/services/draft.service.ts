import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Player, Club, FPLBase } from '../models/fpl';
import { DraftManagerFavourite, Draft, DraftManager, DraftManagerPick, DraftFunctions } from '../models/draft';
@Injectable({ providedIn: 'root' })
export class DraftService {
  private draftUrl = '/api/draft';
  constructor(private http: HttpClient) { }
  getDraft(): Observable<Draft> {
    return this.http.get<Draft>(this.draftUrl);
  }
  getDraftById(draft_id: number): Observable<Draft> {
    return this.http.get<Draft>(`${this.draftUrl}/${draft_id}`);
  }
  updateDraft(draft: Draft): Observable<any> {
    return this.http.post(`${this.draftUrl}/updateDraft`, DraftFunctions.getBasicDraftObject(draft));
  }
  getFavourites(draft_manager_id: number): Observable<DraftManagerFavourite[]> {
    return this.http.get<DraftManagerFavourite[]>(`${this.draftUrl}/favourites/${draft_manager_id}`);
  }
  savePick(pick: DraftManagerPick): Observable<any> {
    return this.http.post(`${this.draftUrl}/savePick`, pick);
  }
  favouritePlayer(favourite: DraftManagerFavourite): Observable<any> {
    return this.http.post(`${this.draftUrl}/setFavourite`, favourite)
  }
  unfavouritePlayer(favourite: DraftManagerFavourite): Observable<any> {
    return this.http.post(`${this.draftUrl}/unsetFavourite`, favourite)
  }
}
