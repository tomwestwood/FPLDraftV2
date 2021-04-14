using Newtonsoft.Json;
using System;
namespace FPLV2Core.Models.FPL
{
    [Serializable]
    public class H2hLeague
    {
        [JsonProperty("standings")]
        public H2hLeagueStandings Standings { get; set; }

        [JsonProperty("matches_this")]
        public H2hLeagueMatches Current { get; set; }
    }
}
