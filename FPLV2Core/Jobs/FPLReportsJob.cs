using System;
using System.Collections.Generic;
using System.Linq;
using FPLV2Core.Models.FPL;
using FPLV2Core.Alerts.Interfaces;
using FPLV2Core.Services;
using FPLV2Core.Models.FPL.Reporting;
using System.Collections.ObjectModel;
using System.IO;
using Newtonsoft.Json;

namespace FPLV2Core.Jobs
{
    public class FPLReportsJob
    {
        private readonly ILogger _logger;
        private readonly IAlert _alerts;

        private readonly FPLService _fplService;

        private ICollection<Element> _players;
        private ICollection<Position> _playerPositions;
        private ICollection<Club> _teams;
        private Event _currentEvent;

        private const int _hard_coded_league_id = 429551;
        private const string var_image_url = "https://pbs.twimg.com/media/EBo9MzKXsAcoO3x.jpg";
        private ICollection<Fixture> _plFixtures;
        private H2hLeagueMatches _draftFixtures;
        private H2hLeague _league;

        private int _gameweekId;

        public FPLReportsJob()
        {
            _fplService = new FPLService();
        }

        public void Run()
        {
            SetCoreItems();
        }

        private void SetCoreItems()
        {
            var reportRecords = new ObservableCollection<ReportEntryPlayerGameweek>();

            var fplBase = _fplService.GetFPLBase();
            _players = fplBase.elements.ToList();
            _playerPositions = fplBase.positions.ToList();
            _teams = fplBase.clubs.ToList();

            // for each gameweek:
            fplBase.events.OrderBy(fplEvent => fplEvent.Id).ToList().ForEach(fplEvent => 
            {
                //var premierLeagueFixtures = _fplService.GetGameweekFixtures(fplEvent.Id);
                var draftFixtures = _fplService.GetH2hFixtures(_hard_coded_league_id, fplEvent.Id);
                var gameweekLive = _fplService.GetGameweekLive(fplEvent.Id);
                //var draftLeague = _fplService.GetH2hLeague(_hard_coded_league_id);

                // then for each draft fixture:
                draftFixtures.Matches.ToList().ForEach(draftFixture => 
                {
                    draftFixture.TeamAEntry = GetEntryFromID(draftFixture.TeamAId, fplEvent.Id);
                    draftFixture.TeamBEntry = GetEntryFromID(draftFixture.TeamBId, fplEvent.Id);

                    draftFixture.TeamAEntry.Picks.Picks.ToList().ForEach(pick =>
                    {
                        var livePlayerInfo = gameweekLive.ElementSummaries.FirstOrDefault(p => p.ID == pick.PlayerId);
                        reportRecords.Add(new ReportEntryPlayerGameweek()
                        {
                            h2h_game_id = draftFixture.Id,
                            gameweek = fplEvent.Id,
                            player_id = pick.PlayerId,
                            player_name = pick.Player.web_name,
                            player_club = pick.Player.club_name,
                            player_position = pick.Player.position_name_short,
                            player_pick_number = pick.TeamPosition,
                            player_is_captain = pick.IsCaptain,
                            player_is_vice_captain = pick.IsViceCaptain,
                            player_multiplier = pick.Multiplier,

                            player_stats_assists = livePlayerInfo.Stats.Assists,
                            player_stats_bonus = livePlayerInfo.Stats.Bonus,
                            player_stats_bps = livePlayerInfo.Stats.BPS,
                            player_stats_clean_sheets = livePlayerInfo.Stats.CleanSheets,
                            player_stats_creativity = livePlayerInfo.Stats.Creativity,
                            player_stats_goals_conceded = livePlayerInfo.Stats.GoalsConceded,
                            player_stats_goals_scored = livePlayerInfo.Stats.GoalsScored,
                            player_stats_ict_index = livePlayerInfo.Stats.ICTIndex,
                            player_stats_influence = livePlayerInfo.Stats.Influence,
                            player_stats_in_dreamteam = livePlayerInfo.Stats.InDreamTeam,
                            player_stats_minutes = livePlayerInfo.Stats.Minutes,
                            player_stats_own_goals = livePlayerInfo.Stats.OwnGoals,
                            player_stats_penalties_missed = livePlayerInfo.Stats.PenaltiesMissed,
                            player_stats_penalties_saved = livePlayerInfo.Stats.PenaltiesSaved,
                            player_stats_red_cards = livePlayerInfo.Stats.RedCards,
                            player_stats_saves = livePlayerInfo.Stats.Saves,
                            player_stats_threat = livePlayerInfo.Stats.Threat,
                            player_stats_total_points = livePlayerInfo.Stats.TotalPoints,
                            player_stats_yellow_cards = livePlayerInfo.Stats.YellowCards,
                            
                            owner_entry_id = draftFixture.TeamAEntry.Id,
                            owner_manager = draftFixture.TeamAEntry.PlayerFirstName + " " + draftFixture.TeamAEntry.PlayerLastName,
                            owner_team = draftFixture.TeamAEntry.TeamName,
                            owner_win = draftFixture.TeamAWin,
                            owner_draw = draftFixture.TeamADraw,
                            owner_loss = draftFixture.TeamALoss,
                            owner_league_points = draftFixture.TeamATotal,
                            owner_score = draftFixture.TeamAPoints,

                            opposition_entry_id = draftFixture.TeamBEntry.Id,
                            opposition_manager = draftFixture.TeamBEntry.PlayerFirstName + " " + draftFixture.TeamAEntry.PlayerLastName,
                            opposition_team = draftFixture.TeamBEntry.TeamName,
                            opposition_win = draftFixture.TeamBWin,
                            opposition_draw = draftFixture.TeamBDraw,
                            opposition_loss = draftFixture.TeamBLoss,
                            opposition_league_points = draftFixture.TeamBTotal,
                            opposition_score = draftFixture.TeamBPoints
                        }); ;
                    });

                    draftFixture.TeamBEntry.Picks.Picks.ToList().ForEach(pick =>
                    {
                        var livePlayerInfo = gameweekLive.ElementSummaries.FirstOrDefault(p => p.ID == pick.PlayerId);
                        reportRecords.Add(new ReportEntryPlayerGameweek()
                        {
                            h2h_game_id = draftFixture.Id,
                            gameweek = fplEvent.Id,
                            player_id = pick.PlayerId,
                            player_name = pick.Player.web_name,
                            player_club = pick.Player.club_name,
                            player_position = pick.Player.position_name_short,
                            player_pick_number = pick.TeamPosition,
                            player_is_captain = pick.IsCaptain,
                            player_is_vice_captain = pick.IsViceCaptain,
                            player_multiplier = pick.Multiplier,

                            player_stats_assists = livePlayerInfo.Stats.Assists,
                            player_stats_bonus = livePlayerInfo.Stats.Bonus,
                            player_stats_bps = livePlayerInfo.Stats.BPS,
                            player_stats_clean_sheets = livePlayerInfo.Stats.CleanSheets,
                            player_stats_creativity = livePlayerInfo.Stats.Creativity,
                            player_stats_goals_conceded = livePlayerInfo.Stats.GoalsConceded,
                            player_stats_goals_scored = livePlayerInfo.Stats.GoalsScored,
                            player_stats_ict_index = livePlayerInfo.Stats.ICTIndex,
                            player_stats_influence = livePlayerInfo.Stats.Influence,
                            player_stats_in_dreamteam = livePlayerInfo.Stats.InDreamTeam,
                            player_stats_minutes = livePlayerInfo.Stats.Minutes,
                            player_stats_own_goals = livePlayerInfo.Stats.OwnGoals,
                            player_stats_penalties_missed = livePlayerInfo.Stats.PenaltiesMissed,
                            player_stats_penalties_saved = livePlayerInfo.Stats.PenaltiesSaved,
                            player_stats_red_cards = livePlayerInfo.Stats.RedCards,
                            player_stats_saves = livePlayerInfo.Stats.Saves,
                            player_stats_threat = livePlayerInfo.Stats.Threat,
                            player_stats_total_points = livePlayerInfo.Stats.TotalPoints,
                            player_stats_yellow_cards = livePlayerInfo.Stats.YellowCards,

                            owner_entry_id = draftFixture.TeamBEntry.Id,
                            owner_manager = draftFixture.TeamBEntry.PlayerFirstName + " " + draftFixture.TeamBEntry.PlayerLastName,
                            owner_team = draftFixture.TeamBEntry.TeamName,
                            owner_win = draftFixture.TeamBWin,
                            owner_draw = draftFixture.TeamBDraw,
                            owner_loss = draftFixture.TeamBLoss,
                            owner_league_points = draftFixture.TeamBTotal,
                            owner_score = draftFixture.TeamBPoints,

                            opposition_entry_id = draftFixture.TeamAEntry.Id,
                            opposition_manager = draftFixture.TeamAEntry.PlayerFirstName + " " + draftFixture.TeamAEntry.PlayerLastName,
                            opposition_team = draftFixture.TeamAEntry.TeamName,
                            opposition_win = draftFixture.TeamAWin,
                            opposition_draw = draftFixture.TeamADraw,
                            opposition_loss = draftFixture.TeamALoss,
                            opposition_league_points = draftFixture.TeamATotal,
                            opposition_score = draftFixture.TeamAPoints
                        }); ;
                    });
                });
            });

            File.WriteAllText(@"C:\Users\tom.westwood\Desktop\DraftFPL\BigReport.json", JsonConvert.SerializeObject(reportRecords));
        }

        private void UpdatePickPoints()
        {
            var gwLive = _fplService.GetGameweekLive(_gameweekId);
            _league.Standings.Entries.ToList().ForEach(entry =>
            {
                entry.EntryObject.Picks.Picks.ToList().ForEach(pick =>
                {
                    pick.Points = gwLive.ElementSummaries.FirstOrDefault(el => el.ID == pick.PlayerId).Stats.TotalPoints;
                });
            });
        }

        private Entry GetEntryFromID(int entryID, int gameweekId)
        {
            var entry = _fplService.GetEntryFromID(entryID, gameweekId);
            assignPlayerInfo(entry);
            return entry;
        }

        private void assignPlayerInfo(Entry entry)
        {
            entry.Picks.Picks.ToList().ForEach(pick =>
            {
                pick.Player = _players.FirstOrDefault(player => player.id == pick.PlayerId);
            });
        }
    }
}
