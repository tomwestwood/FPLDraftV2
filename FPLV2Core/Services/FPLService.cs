using FPLV2Core.Database.DraftDB;
using FPLV2Core.Models.FPL;
using FPLV2Core.Models.FPLDraft;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web;

namespace FPLV2Core.Services
{
    public class FPLService
    {
        #region HARD-CODED VARIABLES

        private string _cookie = "_fbp=fb.1.1620212698910.1939863606; __gads=ID=3c5b614444a3f333:T=1620212691:S=ALNI_MYv5zk1V9O1OqoxvK8Dvx9DWodARw; _ga=GA1.3.734109848.1620212699; _ga_NREXP8D25C=GS1.1.1628591702.7.1.1628591715.0; _ga=GA1.2.734109848.1620212699; _gid=GA1.2.773403680.1628799767; pl_profile='eyJzIjogIld6SXNNVGd6TnpBeE1UVmQ6MW1FYlYzOnpkM0dvRGNITWFrQ3lnV1ZJY1U2UGlkUUM2SDZaWDhRZVY5dXRoU2tfaTgiLCAidSI6IHsiaWQiOiAxODM3MDExNSwgImZuIjogIlRvbSIsICJsbiI6ICJXZXN0d29vZCIsICJmYyI6IDM5fX0='; csrftoken=2iwoPdUQHTceTQvVV8Kb7fPO8xc4fXOlbUb6ojMjCMKhvxB1yzDpKSSquJmUlt5B; sessionid=.eJxVzMsKwjAQheF3yVrKTNLJJO7cCxaK65DmQsRSirGr4rvb7HR5-Dj_Lpzf3sVtNb3cI4qzQKMYEEmcfmny4ZmW5uuc17lr0g3X-2F1HG-XY_4fiq-l1chLAE-RIgNLhJ6A5JSINRupLbC2NmoCVBylMqyysYop5N4CBhCfL6fFML8:1mEbV3:k6xAL5JsT9kQLYQpo09cOd7yeIFoMo9kdoxgZafzHns";
        const string _fplUsername = "westwood.tom@googlemail.com";
        const string _fplPassword = "smithy123";

        #endregion
        private HttpClient _httpClient;

        #region URLS

        private string bootstrap_url = "https://fantasy.premierleague.com/api/bootstrap-static/";
        private string h2h_league_url_base => $"http://fantasy.premierleague.com/api/leagues-h2h";
        private string entry_url = "https://fantasy.premierleague.com/api/entry";
        private string fixtures_url => $"https://fantasy.premierleague.com/api/fixtures";
        private string gameweek_fixtures_url_base => $"https://fantasy.premierleague.com/api/leagues-h2h-matches/league";
        private string gameweek_live_url => $"https://fantasy.premierleague.com/api/event";

        private const string var_image_url = "https://pbs.twimg.com/media/EBo9MzKXsAcoO3x.jpg";
        private const string player_image_missing_url = "https://c0.thejournal.ie/media/2015/11/ali-dia-senegalese-player-had-a-month-contract-at-southampto-310x415.jpg";

        #endregion

        public FPLService()
        {
            var newCookie = GetCookie(); // will be _cookie = GetCookie();            
            _httpClient = new HttpClient();
            _httpClient.DefaultRequestHeaders.Add("Cookie", _cookie);

            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
        }

        public Event GetFixtureGameweek()
        {
            var fplBase = GetFPLBase();
            return fplBase.events.FirstOrDefault(e => e.IsCurrent && !e.Finished) ?? fplBase.events.FirstOrDefault(e => e.IsNext);
        }

        public Event GetScoresGameweek()
        {
            var fplBase = GetFPLBase();
            return fplBase.events.FirstOrDefault(e => e.IsCurrent);
        }

        public H2hLeagueMatches GetH2hFixtures(int league_code, int gameweek)
        {
            var gwLeagueJsonString = _httpClient.GetStringAsync($"{gameweek_fixtures_url_base}/{league_code}/?event={gameweek}");
            var matches = JsonConvert.DeserializeObject<H2hLeagueMatches>(gwLeagueJsonString.Result);
            return matches;
        }

        public H2hLeagueMatch GetH2hFixture(int league_code, int gameweek, int fixtureId)
        {
            var match = GetH2hFixtures(league_code, gameweek).Matches.FirstOrDefault(match => match.Id == fixtureId);
            var draftManagers = new List<DraftManager>(); 
            try
            {
                draftManagers = DraftDB.GetDraftManagers(13);
            } catch (Exception ex) {  }
            var baseFpl = GetFPLBase();

            // there's the match - get the entries:
            match.TeamAEntry = GetEntryFromID(match.TeamAId, gameweek);
            match.TeamBEntry = GetEntryFromID(match.TeamBId, gameweek);
            match.TeamALivePoints = match.TeamAEntry.Picks.LivePoints();
            match.TeamBLivePoints = match.TeamBEntry.Picks.LivePoints();

            // assign the draft manager info:
            try
            {
                match.TeamAManager = draftManagers.FirstOrDefault(dm => dm.team_fpl_id == match.TeamAId);
                match.TeamBManager = draftManagers.FirstOrDefault(dm => dm.team_fpl_id == match.TeamBId);

            }
            catch (Exception ex) { }

            var fixtures = GetGameweekFixtures(gameweek);

            var live = GetGameweekLive(gameweek);

            match.TeamAEntry.Picks = GetEntryPicks(match.TeamAEntry.Id, gameweek);
            match.TeamAEntry.Picks.Picks.ToList().ForEach(e => e.Player = baseFpl.elements.FirstOrDefault(el => el.id == e.PlayerId));
            match.TeamAEntry.Picks.Picks.ToList().ForEach(e => {
                var pickFixture = fixtures.FirstOrDefault(f => f.TeamHId == e.Player.club.id || f.TeamAId == e.Player.club.id);
                if (pickFixture != null)
                {
                    e.CurrentGameHasStarted = pickFixture.Started;
                    e.CurrentGameHasFinished = pickFixture.FinishedProvisional;
                    e.MinutesPlayed = live.ElementSummaries.First(es => es.ID == e.Player.id).Stats.Minutes;
                }
                else
                {
                    e.CurrentGameHasStarted = false;
                    e.CurrentGameHasFinished = false;
                    e.MinutesPlayed = 0;
                }
            });

            match.TeamBEntry.Picks = GetEntryPicks(match.TeamBEntry.Id, gameweek);
            match.TeamBEntry.Picks.Picks.ToList().ForEach(e => e.Player = baseFpl.elements.FirstOrDefault(el => el.id == e.PlayerId));
            match.TeamBEntry.Picks.Picks.ToList().ForEach(e => {
                var pickFixture = fixtures.FirstOrDefault(f => f.TeamHId == e.Player.club.id || f.TeamAId == e.Player.club.id);
                if (pickFixture != null)
                {
                    e.CurrentGameHasStarted = pickFixture.Started;
                    e.CurrentGameHasFinished = pickFixture.FinishedProvisional;
                    e.MinutesPlayed = live.ElementSummaries.First(es => es.ID == e.Player.id).Stats.Minutes;
                }
                else
                {
                    e.CurrentGameHasStarted = false;
                    e.CurrentGameHasFinished = false;
                    e.MinutesPlayed = 0;
                }
            });

            return match;
        }

        public H2hLeague GetH2hLeague(int league_code)
        {
            var leagueJson = _httpClient.GetStringAsync($"{h2h_league_url_base}/{league_code}/standings/");
            return JsonConvert.DeserializeObject<H2hLeague>(leagueJson.Result);
        }

        public Entry GetEntryFromID(int entryID, int gameweek)
        {
            var entryJson = _httpClient.GetStringAsync($"{entry_url}/{entryID}/");
            var entry = JsonConvert.DeserializeObject<Entry>(entryJson.Result);
            entry.Picks = GetEntryPicks(entry.Id, gameweek);
            entry.Points = entry.Picks.LivePoints();
            
            return entry;
        }

        public EntryPicks GetEntryPicks(int entryID, int gameweek)
        {
            var entryPicksJson = _httpClient.GetStringAsync($"{entry_url}/{entryID}/event/{gameweek}/picks/");
            var entryPicks = JsonConvert.DeserializeObject<EntryPicks>(entryPicksJson.Result);
            var gwLive = GetGameweekLive(gameweek);
            entryPicks.Picks.ToList().ForEach(pick =>
            {
                pick.Points = gwLive.ElementSummaries.FirstOrDefault(el => el.ID == pick.PlayerId).Stats.TotalPoints;
            });

            return entryPicks;
        }

        public GameweekLive GetGameweekLive(int gameweek)
        {
            var liveJson = _httpClient.GetStringAsync($"{gameweek_live_url}/{gameweek}/live/");
            return JsonConvert.DeserializeObject<GameweekLive>(liveJson.Result);
        }

        public ICollection<Fixture> GetGameweekFixtures(int gameweek)
        {
            var gwJsonString = _httpClient.GetStringAsync($"{fixtures_url}/?event={gameweek}");
            return JsonConvert.DeserializeObject<ICollection<Fixture>>(gwJsonString.Result);
        }

        public FPLBase GetFPLBase()
        {
            var request = new WebClient().DownloadString(bootstrap_url);
            var parsed = JObject.Parse(request);
            var fplBase = new FPLBase()
            {
                elements = JsonConvert.DeserializeObject<List<Element>>(parsed.SelectToken("elements").ToString()),
                clubs = JsonConvert.DeserializeObject<List<Club>>(parsed.SelectToken("teams").ToString()),
                positions = JsonConvert.DeserializeObject<List<Position>>(parsed.SelectToken("element_types").ToString()),
                events = JsonConvert.DeserializeObject<List<Event>>(parsed.SelectToken("events").ToString()),

            };
            fplBase.LinkElements();
            return fplBase;
        }

        private string GetCookie()
        {
            var login_url = "https://users.premierleague.com/accounts/login/";

            using (var wb = new WebClient())
            {
                NameValueCollection outgoingQueryString = HttpUtility.ParseQueryString(String.Empty);
                outgoingQueryString.Add("login", _fplUsername);
                outgoingQueryString.Add("password", _fplPassword);
                outgoingQueryString.Add("app", "plfpl-web");
                outgoingQueryString.Add("redirect-uri", "https://fantasy.premierleague.com/");

                var response = wb.UploadValues(login_url, "POST", outgoingQueryString);
                string responseString = Encoding.UTF8.GetString(response);

                var responseHeaders = wb.ResponseHeaders;
            }

            return string.Empty;
        }
    }
}
