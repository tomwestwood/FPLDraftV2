using System;
using System.Collections.Generic;

namespace FPLV2Core.Models.FPLDraft
{
    public class Draft
    {
        public Draft()
        {
            draft_options = new DraftOptions();
        }

        public int id { get; set; }
        public string draft_name { get; set; }
        public bool direction { get; set; }
        public string passcode { get; set; }

        public DraftStatus status_id { get; set; }

        public int draft_manager_id { get; set; }
        public DraftManager draft_manager { get; set; }
        public int draft_round { get; set; }

        public IEnumerable<DraftManager> draft_managers { get; set; }
        public IEnumerable<DraftManagerPick> draft_manager_picks { get; set; }
        public IEnumerable<DraftManagerFavourite> draft_manager_favourites { get; set; }

        public DraftOptions draft_options { get; set; }
        public DraftData draft_data { get; set; }
    }
}
