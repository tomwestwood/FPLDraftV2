using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace FPLV2Core.Models.FPL
{
    [Serializable]
    public class Fixture
    {
        [JsonProperty("id")]
        public int ID { get; set; }

        [JsonProperty("code")]
        public string Code { get; set; }

        [JsonProperty("team_h")]
        public int TeamHId { get; set; }

        public Club TeamH { get; set; }

        [JsonProperty("team_h_score")]
        public string TeamHScore { get; set; }

        [JsonProperty("team_a")]
        public int TeamAId { get; set; }

        public Club TeamA { get; set; }

        [JsonProperty("team_a_score")]
        public string TeamAScore { get; set; }

        [JsonProperty("started")]
        public bool Started { get; set; }

        [JsonProperty("finished")]
        public bool Finished { get; set; }

        [JsonProperty("finished_provisional")]
        public bool FinishedProvisional { get; set; }

        [JsonProperty("stats")]
        public ICollection<FixtureStat> Stats { get; set; }
    }
}
