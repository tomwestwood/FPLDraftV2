using System;
namespace FPLV2Core.Models.FPL.Reporting
{
    [Serializable]
    public class ReportEntryPlayerGameweek
    {
        public int h2h_game_id { get; set; }

        public int gameweek { get; set; }

        public int player_id { get; set; }
        public string player_name { get; set; }
        public string player_club { get; set; }
        public string player_position { get; set; }

        public int player_pick_number { get; set; }
        public bool player_is_captain { get; set; }
        public bool player_is_vice_captain { get; set; }
        public int player_multiplier { get; set; }
        //public int player_fixture_id { get; set; }
        //public string player_opponent_club { get; set; }

        public int player_stats_assists { get; set; }
        public int player_stats_bonus { get; set; }
        public int player_stats_bps { get; set; }
        public int player_stats_clean_sheets { get; set; }
        public decimal player_stats_creativity { get; set; }
        public int player_stats_goals_scored { get; set; }
        public int player_stats_goals_conceded { get; set; }
        public decimal player_stats_ict_index { get; set; }
        public bool player_stats_in_dreamteam { get; set; }
        public decimal player_stats_influence { get; set; }
        public int player_stats_minutes { get; set; }
        public int player_stats_own_goals { get; set; }
        public int player_stats_penalties_missed { get; set; }
        public int player_stats_penalties_saved { get; set; }
        public int player_stats_red_cards { get; set; }
        public int player_stats_saves { get; set; }
        public decimal player_stats_threat { get; set; }
        public int player_stats_total_points { get; set; }
        public int player_stats_yellow_cards { get; set; }

        public int owner_entry_id { get; set; }
        public string owner_team { get; set; }
        public string owner_manager { get; set; } 
        public int owner_score { get; set; }
        public int owner_win { get; set; }
        public int owner_draw { get; set; }
        public int owner_loss { get; set; }
        public int owner_league_points { get; set; }

        public int opposition_entry_id { get; set; }
        public string opposition_team { get; set; }
        public string opposition_manager { get; set; }
        public int opposition_score { get; set; }
        public int opposition_win { get; set; }
        public int opposition_draw { get; set; }
        public int opposition_loss { get; set; }
        public int opposition_league_points { get; set; }
    }
}
