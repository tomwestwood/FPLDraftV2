using System;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json;

namespace FPLV2Core.Models.Slack.SharedComponents
{
    public class Accessory
    {
        [JsonProperty("type")]
        public string type { get; set; }

        [JsonProperty("image_url")]
        public string image_url { get; set; }

        [JsonProperty("alt_text")]
        public string alt_text { get; set; }
    }
}
