using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace FPLV2Core.Models.FPL
{
    [Serializable]
    public class ElementSummary
    {
        [JsonProperty("id")]
        public int ID { get; set; }

        [JsonProperty("stats")]
        public ElementSummaryStats Stats { get; set; }
    }
}
