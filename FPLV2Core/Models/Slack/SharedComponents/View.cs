using System;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json;

namespace FPLV2Core.Models.Slack.SharedComponents
{
    public class View
    {

        [JsonProperty("id")]
        public string id { get; set; }

        [JsonProperty("team_id")]
        public string team_id { get; set; }

        [JsonProperty("type")]
        public string type { get; set; }

        [JsonProperty("blocks")]
        public IList<Block> blocks { get; set; }

        [JsonProperty("private_metadata")]
        public string private_metadata { get; set; }

        [JsonProperty("callback_id")]
        public string callback_id { get; set; }

        [JsonProperty("state")]
        public State state { get; set; }

        [JsonProperty("hash")]
        public string hash { get; set; }

        [JsonProperty("title")]
        public Title title { get; set; }

        [JsonProperty("clear_on_close")]
        public bool clear_on_close { get; set; }

        [JsonProperty("notify_on_close")]
        public bool notify_on_close { get; set; }

        [JsonProperty("close")]
        public Close close { get; set; }

        [JsonProperty("submit")]
        public Submit submit { get; set; }

        [JsonProperty("previous_view_id")]
        public object previous_view_id { get; set; }

        [JsonProperty("root_view_id")]
        public string root_view_id { get; set; }

        [JsonProperty("app_id")]
        public string app_id { get; set; }

        [JsonProperty("external_id")]
        public string external_id { get; set; }

        [JsonProperty("app_installed_team_id")]
        public string app_installed_team_id { get; set; }

        [JsonProperty("bot_id")]
        public string bot_id { get; set; }
    }
}
