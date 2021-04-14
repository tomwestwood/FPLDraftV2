import { DraftManager } from "../../models/draft";

export class FancastPlayer {
  id: number;
  name: string;
  position: string;
  era: string;

  draft_manager_id: number;
  draft_manager: DraftManager;
}
