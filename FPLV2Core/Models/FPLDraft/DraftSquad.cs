using System;
using System.Collections.Generic;
using FPLV2Core.Models.FPL;

namespace FPLV2Core.Models.FPLDraft
{
    public class DraftSquad
    {
        public DraftManagerPick gk_1 { get; set; }
        public DraftManagerPick gk_2 { get; set; }
        public DraftManagerPick def_1 { get; set; }
        public DraftManagerPick def_2 { get; set; }
        public DraftManagerPick def_3 { get; set; }
        public DraftManagerPick def_4 { get; set; }
        public DraftManagerPick def_5 { get; set; }
        public DraftManagerPick mid_1 { get; set; }
        public DraftManagerPick mid_2 { get; set; }
        public DraftManagerPick mid_3 { get; set; }
        public DraftManagerPick mid_4 { get; set; }
        public DraftManagerPick mid_5 { get; set; }
        public DraftManagerPick fw_1 { get; set; }
        public DraftManagerPick fw_2 { get; set; }
        public DraftManagerPick fw_3 { get; set; }

        public int num_of_picks { get; set; }
        public decimal budget_spent { get; set; }
        public decimal budget_remaining { get; set; }
        public decimal budget_per_player { get; set; }
    }
}
