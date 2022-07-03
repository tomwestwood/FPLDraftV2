import { EventEmitter, Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@aspnet/signalr';
import { dir } from 'console';
import { Draft, DraftManager, DraftManagerPick, DraftFunctions, DraftStatuses } from '../models/draft';
import { Player, Club } from '../models/fpl';
@Injectable({ providedIn: 'root' })
export class SignalRService {
  updateReceived = new EventEmitter<Draft>();
  statusReceived = new EventEmitter<DraftStatuses>();
  directionReceived = new EventEmitter<boolean>();
  roundReceived = new EventEmitter<number>();
  managerReceived = new EventEmitter<DraftManager>();
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
  updateStatus(draftStatus: DraftStatuses): void {
    this._hubConnection.invoke('updateDraftStatus', draftStatus);
  }
  updateDraftDirection(direction: boolean): void {
    this._hubConnection.invoke('updateDraftDirection', direction);
  }
  updateDraftRound(round: number): void {
    this._hubConnection.invoke('updateDraftRound', round);
  }
  updateDraftManager(manager: DraftManager): void {
    this._hubConnection.invoke('updateDraftManager', manager);
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
    this._hubConnection.on('updateDraftStatus', (data: DraftStatuses) => {
      this.statusReceived.emit(data);
      console.log('Status listener configured');
    });
    this._hubConnection.on('updateDraftDirection', (data: boolean) => {
      this.directionReceived.emit(data);
      console.log('Direction listener configured');
    });
    this._hubConnection.on('updateDraftRound', (data: number) => {
      this.roundReceived.emit(data);
      console.log('Round listener configured');
    });
    this._hubConnection.on('updateDraftManager', (data: DraftManager) => {
      this.managerReceived.emit(data);
      console.log('Manager listener configured');
    });
    this._hubConnection.on('UpdatePick', (data: DraftManagerPick) => {
      this.pickReceived.emit(data);
      console.log('Pick listener configured');
    });
  }
}
