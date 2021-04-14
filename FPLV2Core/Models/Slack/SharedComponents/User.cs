using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace FPLV2Core.Models.Slack.SharedComponents
{
    public class User
    {
        [JsonProperty("id")]
        public string id { get; set; }

        [JsonProperty("username")]
        public string username { get; set; }

        [JsonProperty("name")]
        public string name { get; set; }

        [JsonProperty("team_id")]
        public string team_id { get; set; }
    }
}
