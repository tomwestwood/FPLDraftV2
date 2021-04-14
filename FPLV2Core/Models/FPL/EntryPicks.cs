using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;

namespace FPLV2Core.Models.FPL
{
    [Serializable]
    public class EntryPicks
    {
        public EntryPicks()
        {
            Picks = new List<Pick>();
        }

        [JsonProperty("picks")]
        public ICollection<Pick> Picks { get; set; }

        public int LivePoints()
        {
            var points = Picks.Sum(pick => pick.Points * pick.Multiplier);
            return points;
        }
    }
}
