using System;
using FPLV2Core.Models.Fancast;
using FPLV2Core.Models.FPL;

namespace FPLV2Core.Models.FPLDraft
{
    public class DraftManagerPick
    {
        public int id { get; set; }
        public int draft_manager_id { get; set; }
        public int player_id { get; set; }
        public int pick_order { get; set; }

        public string player_name { get; set; }
        public int current_points { get; set; }

        public Element player { get; set; }

        public FancastPlayer fancast_player { get; set; }
    }
}
