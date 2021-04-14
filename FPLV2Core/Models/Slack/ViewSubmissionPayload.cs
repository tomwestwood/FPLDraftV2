using FPLV2Core.Models.Slack.SharedComponents;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace FPLV2Core.Models.Slack
{
    public class ViewSubmissionPayload
    {

        [JsonProperty("type")]
        public string type { get; set; }

        [JsonProperty("team")]
        public Team team { get; set; }

        [JsonProperty("user")]
        public User user { get; set; }

        [JsonProperty("api_app_id")]
        public string api_app_id { get; set; }

        [JsonProperty("token")]
        public string token { get; set; }

        [JsonProperty("trigger_id")]
        public string trigger_id { get; set; }

        [JsonProperty("view")]
        public View view { get; set; }

        [JsonProperty("response_urls")]
        public IList<object> response_urls { get; set; }

        [JsonProperty("is_enterprise_install")]
        public bool is_enterprise_install { get; set; }

        [JsonProperty("enterprise")]
        public object enterprise { get; set; }
    }
}

