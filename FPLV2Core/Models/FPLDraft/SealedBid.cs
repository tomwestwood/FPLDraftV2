using System;
using System.Collections.Generic;
using FPLV2Core.Models.Fancast;
using FPLV2Core.Models.FPL;

namespace FPLV2Core.Models.FPLDraft
{
    public class SealedBid
    {
        public int draft_manager_id { get; set; }
        public string draft_manager_name { get; set; }
        public string draft_manager_team { get; set; }
        public int player_id { get; set; }
        public int player_name { get; set; }
        public decimal bid_amount { get; set; }
        public bool bid_eligible { get; set; }
    }
}
