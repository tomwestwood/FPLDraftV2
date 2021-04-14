using System;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json;

namespace FPLV2Core.Models.Slack.SharedComponents
{
    public class Block
    {
        [JsonProperty("type")]
        public string type { get; set; }

        [JsonProperty("block_id")]
        public string block_id { get; set; }

        [JsonProperty("text")]
        public Text text { get; set; }

        [JsonProperty("accessory")]
        public Accessory accessory { get; set; }
    }
}
