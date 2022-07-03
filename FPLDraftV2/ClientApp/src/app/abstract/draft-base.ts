import { Directive, OnInit } from "@angular/core";
import { DraftControllerService } from "../draft/services/draft-controller.service";
import { Draft, DraftFunctions, DraftManager, DraftManagerPick, DraftStatuses } from "../models/draft";
import { FPLBase } from "../models/fpl";

@Directive()
export abstract class DraftBaseComponent {
  draftId: number = 15;
  isDraftAuction: boolean = true;
  fplBase: FPLBase;
  draft: Draft;

  protected constructor(public draftControllerService: DraftControllerService) {
    draftControllerService.getDraft(this.draftId);

    this.draftControllerService.fplBase.subscribe((fplBase: FPLBase) => {
      this.fplBase = fplBase;
    });

    this.draftControllerService.draft.subscribe((draft: Draft) => {
      this.setDraft(draft);
    });
  }

  abstract setDraft(draft: Draft): void; 

  public get currentPick(): DraftManagerPick {
    if (this.draft?.status_id >= DraftStatuses.DraftingComplete)
      return this.draftControllerService.getCurrentPick();

    return undefined;
  }

  public get signingManager(): DraftManager {
    if (this.draft?.status_id >= DraftStatuses.SigningComplete && this.currentPick && this.currentPick.draft_manager_id > 0)
      return this.draftControllerService.getManagerById(this.currentPick.draft_manager_id);

    return undefined;
  }

  public convertStatusToString(status: number): string {
    return DraftFunctions.convertStatusToString(status);
  }

  getDraftDirectionDescription(): string {
    return this.draft.direction ? 'going back up' : 'going down';
  }

  public replacePlayerImageNotFound(event, player) {
    event.target.src = `https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${player.club.code}-66.png`;
  }  
}
