import { Component, Input } from '@angular/core';
import { Player } from '../../models/fpl';
import { trigger, transition, style, animate, state } from '@angular/animations';
@Component({
  selector: 'player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
  animations: [
    trigger('flyInOut', [
      state('in', style({ transform: 'translateX(0)' })),
      transition('void => *', [
        style({ transform: 'translateX(-100%)' }),
        animate(100)
      ]),
      transition('* => void', [
        animate(100, style({ transform: 'translateX(100%)' }))
      ])
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate(500, style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate(0, style({ opacity: 0 }))
      ])
    ])
  ]
})
export class PlayerComponent {
  @Input() player: Player;

  replacePlayerImageNotFound(event, player) {
    event.target.src = `https://www.nufc.co.uk/img/DefaultPlayerProfileImage.png?mode=crop&width=350&height=460&quality=75`;
  }
}
