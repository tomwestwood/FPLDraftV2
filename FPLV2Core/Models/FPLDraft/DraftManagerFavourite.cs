using System;
using FPLV2Core.Models.FPL;

namespace FPLV2Core.Models.FPLDraft
{
    public class DraftManagerFavourite
    {
        public int id { get; set; }
        public int draft_manager_id { get; set; }
        public int player_id { get; set; }
    }
}
