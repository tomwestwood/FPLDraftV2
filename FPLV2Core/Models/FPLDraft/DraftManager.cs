using System;
using System.Collections.Generic;
using FPLV2Core.Models.FPL;

namespace FPLV2Core.Models.FPLDraft
{
    public class DraftManager
    {
        public int id { get; set; }
        public int draft_id { get; set; }
        public string name { get; set; }
        public string team_name { get; set; }
        public int draft_seed { get; set; }
        public string team_nickname { get; set; }
        public string team_image_url { get; set; }
        public string manager_image_url { get; set; }
        public string team_colour_1 { get; set; }
        public string team_colour_2 { get; set; }
        public int team_fpl_id { get; set; }
        public int waiver_order { get; set; }
        public int transfers_remaining { get; set; }
        public string slack_id { get; set; }

        public DraftManagerMoreInfo more_info { get; set; }

        public IEnumerable<DraftManagerPick> draft_manager_picks { get; set; }
        public IEnumerable<DraftManagerFavourite> draft_manager_favourites { get; set; }
        public DraftSquad draft_squad { get; set; }
    }

    public class DraftManagerMoreInfo
    {
        public string intro_audio { get; set; }
        public string main_audio { get; set; }
        public string announce_audio { get; set; }
    }
}
