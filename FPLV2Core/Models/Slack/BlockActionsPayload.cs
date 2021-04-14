using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;
using FPLV2Core.Models.Slack.SharedComponents;

namespace FPLV2Core.Models.Slack
{
    public class BlockActionsPayload
    {

        [JsonProperty("type")]
        public string type { get; set; }

        [JsonProperty("user")]
        public User user { get; set; }

        [JsonProperty("team")]
        public Team team { get; set; }

        [JsonProperty("api_app_id")]
        public string api_app_id { get; set; }

        [JsonProperty("token")]
        public string token { get; set; }

        [JsonProperty("trigger_id")]
        public string trigger_id { get; set; }

        [JsonProperty("is_enterprise_install")]
        public bool is_enterprise_install { get; set; }

        [JsonProperty("enterprise")]
        public object enterprise { get; set; }

        [JsonProperty("response_url")]
        public string response_url { get; set; }

        [JsonProperty("container")]
        public Container container { get; set; }

        [JsonProperty("channel")]
        public Channel channel { get; set; }

        [JsonProperty("message")]
        public Message message { get; set; }

        [JsonProperty("actions")]
        public IList<SlackAction> actions { get; set; }
    }
}

