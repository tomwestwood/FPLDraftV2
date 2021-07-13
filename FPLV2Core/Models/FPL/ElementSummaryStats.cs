using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace FPLV2Core.Models.FPL
{
    [Serializable]
    public class ElementSummaryStats
    {
        [JsonProperty("assists")]
        public int Assists { get; set; }
        [JsonProperty("bonus")]
        public int Bonus { get; set; }
        [JsonProperty("bps")]
        public int BPS { get; set; }
        [JsonProperty("clean_sheets")]
        public int CleanSheets { get; set; }
        [JsonProperty("creativity")]
        public decimal Creativity { get; set; }
        [JsonProperty("goals_conceded")]
        public int GoalsConceded { get; set; }
        [JsonProperty("goals_scored")]
        public int GoalsScored { get; set; }
        [JsonProperty("ict_index")]
        public decimal ICTIndex { get; set; }
        [JsonProperty("in_dreamteam")]
        public bool InDreamTeam { get; set; }
        [JsonProperty("influence")]
        public decimal Influence { get; set; }
        [JsonProperty("minutes")]
        public int Minutes { get; set; }
        [JsonProperty("own_goals")]
        public int OwnGoals { get; set; }
        [JsonProperty("penalties_missed")]
        public int PenaltiesMissed { get; set; }
        [JsonProperty("penalties_saved")]
        public int PenaltiesSaved { get; set; }
        [JsonProperty("red_cards")]
        public int RedCards { get; set; }
        [JsonProperty("saves")]
        public int Saves { get; set; }
        [JsonProperty("threat")]
        public decimal Threat { get; set; }
        [JsonProperty("total_points")]
        public int TotalPoints { get; set; }
        [JsonProperty("yellow_cards")]
        public int YellowCards { get; set; }
    }
}
