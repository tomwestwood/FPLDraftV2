using System;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json;

namespace FPLV2Core.Models.Slack.SharedComponents
{
    public class Container
    {
        [JsonProperty("type")]
        public string type { get; set; }

        [JsonProperty("message_ts")]
        public string message_ts { get; set; }

        [JsonProperty("channel_id")]
        public string channel_id { get; set; }

        [JsonProperty("is_ephemeral")]
        public bool is_ephemeral { get; set; }
    }
}
