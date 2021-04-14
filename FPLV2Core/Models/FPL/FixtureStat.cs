using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace FPLV2Core.Models.FPL
{
    [Serializable]
    public class FixtureStat
    {
        [JsonProperty("identifier")]
        public FixtureStatType Identifier { get; set; }

        [JsonProperty("a")]
        public ICollection<FixtureStatValue> AwayStats { get; set; }

        [JsonProperty("h")]
        public ICollection<FixtureStatValue> HomeStats { get; set; }
    }
}
