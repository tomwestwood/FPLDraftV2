using System;
using System.Collections.ObjectModel;
using FPLV2Core.Models.FPL;

namespace FPLV2Core.Models.FPLDraft
{
    public class Nomination
    {
        public int id { get; set; }
        public int player_id { get; set; }
        public int nominator_id { get; set; }
        public DateTime? date_nominated { get; set; }
        public string slack_id { get; set; }
        public int draft_id { get; set; }

        public int manager_id { get; set; }
        public DateTime? deadline_date { get; set; }
        public DateTime? completion_date { get; set; }

        public ObservableCollection<NominationActivity> nomination_activity { get; set; }

        public Element player { get; set; }
        public DraftManager nominator { get; set; }
        public DraftManager manager { get; set; }

        public NominationStatus nomination_status =>    completion_date.HasValue ? NominationStatus.complete :
                                                        (deadline_date.HasValue && deadline_date.Value < DateTime.Now) ? NominationStatus.complete :
                                                        date_nominated.HasValue ? NominationStatus.nominated :
                                                        NominationStatus.open;
    }

    public enum NominationStatus
    {
        open = 0,
        nominated = 1,
        complete = 2
    }

    public class NominationActivity
    {
        public int manager_id { get; set; }
        public bool response { get; set; }
        public DateTime response_time { get; set; }
    }
}
