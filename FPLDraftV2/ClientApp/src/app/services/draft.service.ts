import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DraftManagerFavourite, Draft, DraftManagerPick, DraftFunctions, DraftManager } from '../models/draft';

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
  updateDraft(draft: Draft): Observable<Draft> {
    return this.http.post<Draft>(`${this.draftUrl}/updateDraft`, DraftFunctions.getBasicDraftObject(draft));
  }
  getFavourites(draft_manager_id: number): Observable<DraftManagerFavourite[]> {
    return this.http.get<DraftManagerFavourite[]>(`${this.draftUrl}/favourites/${draft_manager_id}`);
  }
  savePick(pick: DraftManagerPick): Observable<DraftManagerPick> {
    return this.http.post<DraftManagerPick>(`${this.draftUrl}/savePick`, pick);
  }
  updatePick(pick: DraftManagerPick): Observable<DraftManagerPick> {
    return this.http.post<DraftManagerPick>(`${this.draftUrl}/updatePick`, pick);
  }
  favouritePlayer(favourite: DraftManagerFavourite): Observable<any> {
    return this.http.post(`${this.draftUrl}/setFavourite`, favourite)
  }
  unfavouritePlayer(favourite: DraftManagerFavourite): Observable<any> {
    return this.http.post(`${this.draftUrl}/unsetFavourite`, favourite)
  }
}
