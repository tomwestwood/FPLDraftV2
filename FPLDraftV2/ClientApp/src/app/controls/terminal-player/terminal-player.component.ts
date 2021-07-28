import { Component, OnInit, Input } from '@angular/core';
import { Player } from '../../models/fpl';
@Component({
  selector: 'terminal-player',
  templateUrl: './terminal-player.component.html',
  styleUrls: ['./terminal-player.component.scss']
})
export class TerminalPlayerComponent implements OnInit {
  @Input() player: Player;
  @Input() position: string;
  @Input() cost: number;
  constructor() { }
  ngOnInit() { }
  replacePlayerImageNotFound(event, player) {
    event.target.src = `https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${player.club.code}-66.png`;
  }
}
