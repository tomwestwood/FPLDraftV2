import { Component, Input, OnInit } from '@angular/core';
import { Draft, DraftFunctions, DraftManager, DraftManagerPick, DraftSquad } from '../../../models/draft';
import { DraftControllerService } from '../../../draft/services/draft-controller.service';
@Component({
  selector: 'app-terminal-ticker',
  templateUrl: './terminal-ticker.component.html',
  styleUrls: ['./terminal-ticker.component.scss']
})
export class TerminalTickerComponent implements OnInit {
  @Input() draft: Draft;
  draftSet: boolean = false;
  altTickerItems: AltTickerItem[];
  currentTickerIndex: number = 0;

  constructor(private draftControllerService: DraftControllerService) { }

  ngOnInit() {
    if (this.draft && !this.draftSet) {
      this.draftSet = true;
      this.updateTickerItems();
    }

    this.draftControllerService.draft.subscribe((draft: Draft) => {
      this.draft = draft;
    });
  }

  private updateTickerItems(): void {
    this.altTickerItems = [] = [];
    let randomManager: DraftManager;

    this.currentTickerIndex = this.currentTickerIndex == 0 ?
      this.draft.draft_managers[Math.floor(Math.random() * this.draft.draft_managers.length)].draft_seed :
      this.currentTickerIndex == 12 ? 1 : this.currentTickerIndex + 1;

    randomManager = this.draft.draft_managers.find(dm => dm.draft_seed == this.currentTickerIndex);
    randomManager.draft_squad = DraftFunctions.getDraftSquadForManager(randomManager);

    this.altTickerItems.push({ imgLocation: randomManager.team_image_url, header: 'GKP', picks: randomManager.draft_manager_picks?.filter(dmp => dmp.player.position.id == 1) ?? [] });
    this.altTickerItems.push({ imgLocation: randomManager.team_image_url, header: 'DEF', picks: randomManager.draft_manager_picks?.filter(dmp => dmp.player.position.id == 2) ?? [] });
    this.altTickerItems.push({ imgLocation: randomManager.team_image_url, header: 'MID', picks: randomManager.draft_manager_picks?.filter(dmp => dmp.player.position.id == 3) ?? [] });
    this.altTickerItems.push({ imgLocation: randomManager.team_image_url, header: 'FWD', picks: randomManager.draft_manager_picks?.filter(dmp => dmp.player.position.id == 4) ?? [] });

    setTimeout(() => {
      this.updateTickerItems();
    }, 30000);
  }

  replacePlayerImageNotFound(event, player) {
    event.target.src = `https://www.nufc.co.uk/img/DefaultPlayerProfileImage.png?mode=crop&width=350&height=460&quality=75`;
  }
}

class TickerItem {
  imgLocation: string;
  picks: DraftManagerPick[];
  description: string;
}

class AltTickerItem {
  imgLocation: string;
  header: string;
  picks: DraftManagerPick[];
}
