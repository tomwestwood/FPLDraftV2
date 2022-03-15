using FPLV2Core.Models.FPL;
using FPLV2Core.Services;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Net;
using System.Linq;

namespace FPLDraftV2.Controllers.FPL
{
    [Route("api/fpl")]
    [ApiController]
    public class FPLController
    {
        private FPLService _fplService;

        public FPLController()
        {
            _fplService = new FPLService();
        }

        [HttpGet]
        public ActionResult<FPLBase> Get()
        {
            return _fplService.GetFPLBase();
        }

        [HttpGet("getFixtureGameweek")]
        public Event GetFixtureGameweek()
        {
            return _fplService.GetFixtureGameweek();
        }

        [HttpGet("getScoresGameweek")]
        public Event GetScoresGameweek()
        {
            return _fplService.GetScoresGameweek();
        }

        [HttpGet("getH2hLeague/{league_code}")]
        public H2hLeague GetH2hLeague(int league_code)
        {
            return _fplService.GetH2hLeague(league_code);
        }

        [HttpGet("getH2hFixtures/{league_code}/{gameweek}")]
        public H2hLeagueMatches GetH2hFixtures(int league_code, int gameweek)
        {
            return _fplService.GetH2hFixtures(league_code, gameweek);
        }

        [HttpGet("getFixture/{leagueId}/{gameweekId}/{fixtureId}")]
        public H2hLeagueMatch GetFixture(int leagueId, int gameweekId, int fixtureId)
        {
            return _fplService.GetH2hFixture(leagueId, gameweekId, fixtureId);
        }

        [HttpGet("getEntry/{entryId}/{gameweek}")]
        public Entry GetEntry(int entryId, int gameweek)
        {
            return _fplService.GetEntryFromID(entryId, gameweek);
        }

        [HttpGet("getLiveLeague/{league_code}")]
        public H2hLeague GetLiveLeague(int league_code)
        {
            var current_league = _fplService.GetH2hLeague(league_code);
            var current_gw = GetFixtureGameweek();
            var fixtures = _fplService.GetH2hFixtures(league_code, current_gw.Id);

            if (current_gw.IsCurrent && !current_gw.Finished)
            {
                current_league.Standings.Entries.ToList().ForEach(entry =>
                {
                    var involvedMatch = fixtures.Matches.FirstOrDefault(match => match.TeamAId == entry.EntryID || match.TeamBId == entry.EntryID);
                    var h2hFixture = _fplService.GetH2hFixture(league_code, current_gw.Id, involvedMatch.Id);

                    if (entry.EntryID == involvedMatch.TeamAId)
                    {
                        var oppEntry = current_league.Standings.Entries.FirstOrDefault(opEntry => opEntry.EntryID == involvedMatch.TeamBId);
                        entry.LiveOpponentName = oppEntry.PlayerName_Short;
                        entry.LiveOpponentTeamName = oppEntry.EntryName;
                        entry.LiveOpponentScore = h2hFixture.TeamBLivePoints;

                        if (h2hFixture.TeamALivePoints > h2hFixture.TeamBLivePoints)
                            entry.LivePoints = int.Parse(entry.Total) + 3;
                        else if (h2hFixture.TeamALivePoints == h2hFixture.TeamBLivePoints)
                            entry.LivePoints = int.Parse(entry.Total) + 1;
                        else
                            entry.LivePoints = int.Parse(entry.Total);

                        entry.LiveGoalDifference = int.Parse(entry.PointsFor) + h2hFixture.TeamALivePoints;
                        entry.LiveScore = h2hFixture.TeamALivePoints;
                    }
                    else if(entry.EntryID == involvedMatch.TeamBId)
                    {
                        var oppEntry = current_league.Standings.Entries.FirstOrDefault(opEntry => opEntry.EntryID == involvedMatch.TeamAId);
                        entry.LiveOpponentName = oppEntry.PlayerName_Short;
                        entry.LiveOpponentTeamName = oppEntry.EntryName;
                        entry.LiveOpponentScore = h2hFixture.TeamALivePoints;

                        if (h2hFixture.TeamBLivePoints > h2hFixture.TeamALivePoints)
                            entry.LivePoints = int.Parse(entry.Total) + 3;
                        else if (h2hFixture.TeamBLivePoints == h2hFixture.TeamALivePoints)
                            entry.LivePoints = int.Parse(entry.Total) + 1;
                        else
                            entry.LivePoints = int.Parse(entry.Total);

                        entry.LiveGoalDifference = int.Parse(entry.PointsFor) + h2hFixture.TeamBLivePoints;
                        entry.LiveScore = h2hFixture.TeamBLivePoints;
                    }
                });
            }

            int liveRank = 1;
            current_league.Standings.Entries.OrderByDescending(a => a.LivePoints).ThenByDescending(a => a.LiveGoalDifference).ToList().ForEach(entry =>
            {
                entry.LiveRank = liveRank;
                liveRank++;
            });

            current_league.Standings.Entries = current_league.Standings.Entries.OrderBy(a => a.LiveRank).ToList();
            
            return current_league;
        }

        //// new stuff:
        //[HttpGet("getFixtureGameweek")]
        //public Event GetFixtureGameweek()
        //{
        //    return _fplService.GetFixtureGameweek();
        //}
    }
}
