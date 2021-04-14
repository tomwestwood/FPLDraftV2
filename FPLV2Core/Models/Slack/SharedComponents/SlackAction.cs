using System;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json;

namespace FPLV2Core.Models.Slack.SharedComponents
{
    public class SlackAction
    {
        [JsonProperty("action_id")]
        public string action_id { get; set; }

        [JsonProperty("block_id")]
        public string block_id { get; set; }

        [JsonProperty("text")]
        public Text text { get; set; }

        [JsonProperty("value")]
        public string value { get; set; }

        [JsonProperty("style")]
        public string style { get; set; }

        [JsonProperty("type")]
        public string type { get; set; }

        [JsonProperty("action_ts")]
        public string action_ts { get; set; }
    }
}
