using Newtonsoft.Json;
using System;
namespace FPLV2Core.Models.FPL
{
    [Serializable]
    public class H2hLeagueEntry
    {
        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("entry")]
        public int EntryID { get; set; }

        [JsonProperty("entry_name")]
        public string EntryName { get; set; }

        [JsonProperty("player_name")]
        public string PlayerName { get; set; }

        public string PlayerName_Short => Tools.ManagerConverter.GetManagerShortName(PlayerName);

        [JsonProperty("rank")]
        public int Rank { get; set; }

        [JsonProperty("last_rank")]
        public int LastRank { get; set; }

        [JsonProperty("rank_sort")]
        public string RankSort { get; set; }

        [JsonProperty("points_for")]
        public string PointsFor { get; set; }

        [JsonProperty("total")]
        public string Total { get; set; }

        public string TableStatus => Rank == LastRank ? "" : Rank < LastRank ? "+" : "-"; 

        public Entry EntryObject { get; set; }

        // live fields:
        public string LiveOpponentTeamName { get; set; }
        public string LiveOpponentName { get; set; }
        public int LiveScore { get; set; }
        public int LiveOpponentScore { get; set; }
        public string LiveGameScore => (LiveScore > LiveOpponentScore ? "Winning " : LiveScore < LiveOpponentScore ? "Losing " : "Drawing ") + LiveScore + "-" + LiveOpponentScore;
        public int LivePoints { get; set; }
        public int LiveGoalDifference { get; set; }
        public int LiveRank { get; set; }
    }
}
