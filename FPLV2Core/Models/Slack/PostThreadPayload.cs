using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace FPLV2Core.Models.Slack
{
    public class PostThreadPayload : PostPayload
    {
        [JsonProperty("thread_ts")]
        public string thread_ts { get; set; }
    }
}
