using System;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json;

namespace FPLV2Core.Models.Slack.SharedComponents
{
    public class State
    {
        [JsonProperty("values")]
        public Values values { get; set; }
    }
}
