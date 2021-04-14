using System;
using System.Collections.Generic;

namespace FPLV2Core.Models.FPLDraft
{
    public class DraftData
    {
        public DraftData()
        {
            picks = 15;
            draft_type = DraftType.Local;
            is_auction = false;
        }

        public int picks { get; set; }
        public DraftType draft_type {get; set;}
        public string pin { get; set; }
        public string logo { get; set; }
        public bool is_auction { get; set; }
    }
}
