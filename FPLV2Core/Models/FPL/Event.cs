using Newtonsoft.Json;
using System;
namespace FPLV2Core.Models.FPL
{
    [Serializable]
    public class Event
    {
        [JsonProperty("data_checked")]
        public bool DataChecked { get; set; }

        [JsonProperty("deadline_time")]
        public string DeadlineTime { get; set; }

        [JsonProperty("deadline_time_epoch")]
        public long DeadlineTimeEpoch { get; set; }

        [JsonProperty("deadline_time_formatted")]
        public string DeadlineTimeFormatted { get; set; }

        [JsonProperty("deadline_time_game_offset")]
        public int DeadlineTimeGameOffset { get; set; }

        [JsonProperty("finished")]
        public bool Finished { get; set; }

        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("is_current")]
        public bool IsCurrent { get; set; }

        [JsonProperty("is_next")]
        public bool IsNext { get; set; }

        [JsonProperty("is_previous")]
        public bool IsPrevious { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }
    }
}
