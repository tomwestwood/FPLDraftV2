using System;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json;

namespace FPLV2Core.Models.Slack.SharedComponents
{
    public class Submit
    {
        [JsonProperty("type")]
        public string type { get; set; }

        [JsonProperty("text")]
        public string text { get; set; }

        [JsonProperty("emoji")]
        public bool emoji { get; set; }
    }
}
