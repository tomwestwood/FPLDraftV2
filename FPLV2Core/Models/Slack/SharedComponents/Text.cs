using System;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json;

namespace FPLV2Core.Models.Slack.SharedComponents
{
    public class Text
    {
        [JsonProperty("type")]
        public string type { get; set; }

        [JsonProperty("text")]
        public string text { get; set; }

        [JsonProperty("verbatim")]
        public bool verbatim { get; set; }
    }
}
