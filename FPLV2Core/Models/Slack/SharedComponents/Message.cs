using System;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json;

namespace FPLV2Core.Models.Slack.SharedComponents
{
    public class Message
    {
        [JsonProperty("type")]
        public string type { get; set; }

        [JsonProperty("subtype")]
        public string subtype { get; set; }

        [JsonProperty("text")]
        public string text { get; set; }

        [JsonProperty("ts")]
        public string ts { get; set; }

        [JsonProperty("bot_id")]
        public string bot_id { get; set; }

        [JsonProperty("blocks")]
        public IList<Block> blocks { get; set; }
    }
}
