import { Component, OnInit, Input } from '@angular/core';
import { FancastPlayer } from '../../models/fancast-player';
@Component({
  selector: 'fancast-terminal-player',
  templateUrl: './fancast-terminal-player.component.html',
  styleUrls: ['./fancast-terminal-player.component.scss']
})
export class FancastTerminalPlayerComponent implements OnInit {
  @Input() player: FancastPlayer;
  @Input() position: string;
  constructor() { }
  ngOnInit() { }
  replacePlayerImageNotFound(event, player) {
    event.target.src = `https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${player.club.code}-66.png`;
  }
}
