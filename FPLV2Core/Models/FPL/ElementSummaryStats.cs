using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace FPLV2Core.Models.FPL
{
    [Serializable]
    public class ElementSummaryStats
    {
        [JsonProperty("minutes")]
        public int Minutes { get; set; }
        [JsonProperty("total_points")]
        public int TotalPoints { get; set; }
    }
}
