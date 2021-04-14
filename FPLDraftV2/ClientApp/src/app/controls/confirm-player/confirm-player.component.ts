import { Component, OnInit, Input, Inject } from '@angular/core';
import { Player } from '../../models/fpl';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
  selector: 'confirm-player',
  templateUrl: './confirm-player.component.html',
  styleUrls: ['./confirm-player.component.scss']
})
export class ConfirmPlayerComponent {
  player: Player;
  constructor(
    public dialogRef: MatDialogRef<ConfirmPlayerComponent>,
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
  replacePlayerImageNotFound(event, player) {
    event.target.src = `https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${player.club.code}-66.png`;
  }
}
