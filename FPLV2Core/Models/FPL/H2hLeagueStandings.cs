using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace FPLV2Core.Models.FPL
{
    [Serializable]
    public class H2hLeagueStandings
    {
        [JsonProperty("results")]
        public ICollection<H2hLeagueEntry> Entries { get; set; }
    }
}
