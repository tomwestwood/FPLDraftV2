using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace FPLV2Core.Models.FPL
{
    [Serializable]
    public class H2hLeagueMatches
    {
        [JsonProperty("results")]
        public ICollection<H2hLeagueMatch> Matches { get; set; }
    }
}
