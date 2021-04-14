import { Component, OnInit, Input, Inject } from '@angular/core';
import { FancastPlayer } from '../../models/fancast-player';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
  selector: 'fancast-confirm-player',
  templateUrl: './fancast-confirm-player.component.html',
  styleUrls: ['./fancast-confirm-player.component.scss']
})
export class FancastConfirmPlayerComponent {
  player: FancastPlayer;
  constructor(
    public dialogRef: MatDialogRef<FancastConfirmPlayerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.player = data.player;
  }
  ngOnInit() { }
  onNoClick() {
    this.dialogRef.close(false);
  }
  onYesClick() {
    this.dialogRef.close(true);
  }
  getPlayerImage(): string {
    return `https://fplplusstorage.blob.core.windows.net/images/6/${this.player.name}.jpg`;
  }
  replacePlayerImageNotFound(event, player) {
    event.target.src = `https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${player.club.code}-66.png`;
  }
}
