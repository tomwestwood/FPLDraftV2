using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace FPLV2Core.Models.FPL
{
    [Serializable]
    public class GameweekLive
    {
        [JsonProperty("elements")]
        public ICollection<ElementSummary> ElementSummaries { get; set; }
    }
}
