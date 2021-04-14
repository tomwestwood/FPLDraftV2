import { EventEmitter, Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@aspnet/signalr';
import { Draft, DraftManager, DraftManagerPick, DraftFunctions } from '../models/draft';
import { Player, Club } from '../models/fpl';
@Injectable({ providedIn: 'root' })
export class SignalRService {
  updateReceived = new EventEmitter<Draft>();
  pickReceived = new EventEmitter<DraftManagerPick>();
  connectionEstablished = new EventEmitter<boolean>();
  private _hubConnection: HubConnection;
  constructor() {
    this.createConnection();
    this.registerOnServerEvents();
    this.startConnection();
  }
  updateDraft(draft: Draft): void {
    this._hubConnection.invoke('updateDraft', DraftFunctions.getBasicDraftObject(draft));
  }
  updatePick(pick: DraftManagerPick): void {
    this._hubConnection.invoke('updatePick', pick);
  }
  private createConnection(): void {
    this._hubConnection = new HubConnectionBuilder()
      .withUrl(window.location.origin + '/fplHub')
      .build();
  }
  private startConnection(): void {
    this._hubConnection
      .start()
      .then(() => {
        //this.connectionEstablished = true;
        console.log('Hub connection started');
        this.connectionEstablished.emit(true);
      })
      .catch(err => {
        console.log('Error while establishing connection, retrying...');
      })
  }
  private registerOnServerEvents(): void {
    this._hubConnection.on('UpdateDraft', (data: Draft) => {
      this.updateReceived.emit(data);
      console.log('Draft listener configured');
    });
    this._hubConnection.on('UpdatePick', (data: DraftManagerPick) => {
      this.pickReceived.emit(data);
      console.log('Pick listener configured');
    });
  }
}
