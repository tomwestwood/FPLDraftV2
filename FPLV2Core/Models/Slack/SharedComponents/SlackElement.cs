using System;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json;

namespace FPLV2Core.Models.Slack.SharedComponents
{
    public class SlackElement
    {
        [JsonProperty("type")]
        public string type { get; set; }

        [JsonProperty("action_id")]
        public string action_id { get; set; }

        [JsonProperty("text")]
        public Text text { get; set; }

        [JsonProperty("style")]
        public string style { get; set; }

        [JsonProperty("value")]
        public string value { get; set; }
    }
}
