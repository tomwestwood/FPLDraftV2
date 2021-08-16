using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace FPLV2Core.Models.Slack
{
    public class SlashCommandRequest
    {
        public string Token { get; set; }

        [JsonProperty("team_id")]
        public string team_id { get; set; }

        [JsonProperty("team_domain")]
        public string team_domain { get; set; }

        [JsonProperty("enterprise_id")]
        public string enterprise_id { get; set; }

        [JsonProperty("enterprise_name")]
        public string enterprise_name { get; set; }

        [JsonProperty("channel_id")]
        public string channel_id { get; set; }

        [JsonProperty("channel_name")]
        public string channel_name { get; set; }

        [JsonProperty("user_id")]
        public string user_id { get; set; }

        [JsonProperty("user_name")]
        public string user_name { get; set; }

        public string Command { get; set; }

        public string Text { get; set; }

        [JsonProperty("response_url")]
        public string response_url { get; set; }

        [JsonProperty("trigger_id")]
        public string trigger_id { get; set; }
    }
}

