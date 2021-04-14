using Newtonsoft.Json;
using System;
namespace FPLV2Core.Models.FPL
{
    [Serializable]
    public class Entry
    {
        public Entry()
        {
            Picks = new EntryPicks();
        }

        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("player_first_name")]
        public string PlayerFirstName { get; set; }

        [JsonProperty("player_last_name")]
        public string PlayerLastName { get; set; }

        [JsonProperty("name")]
        public string TeamName { get; set; }

        [JsonProperty("summary_event_points")]
        public int Points { get; set; }

        public EntryPicks Picks { get; set; }
    }
}
