using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace FPLV2Core.Models.Slack
{
    public class PostUpdatePayload : PostPayload
    {
        [JsonProperty("url")]
        public string url { get; set; }

        [JsonProperty("replace_original")]
        public bool replace_original { get; set; }
    }
}
