using FPLV2Core.Models.FPL;
using FPLV2Core.Services;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Net;

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
    }
}
