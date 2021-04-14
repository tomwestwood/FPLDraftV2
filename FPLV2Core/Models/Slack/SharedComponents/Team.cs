using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace FPLV2Core.Models.Slack.SharedComponents
{
    public class Team
    {

        [JsonProperty("id")]
        public string id { get; set; }

        [JsonProperty("domain")]
        public string domain { get; set; }
    }
}
