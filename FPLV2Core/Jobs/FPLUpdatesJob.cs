using System;
using System.Collections.Generic;
using System.Linq;
using FPLV2Core.Models.FPL;
using FPLV2Core.Alerts.Interfaces;
using FPLV2Core.Services;

namespace FPLV2Core.Jobs
{
    public class FPLUpdatesJob
    {
        private readonly ILogger _logger;
        private readonly IAlert _alerts;

        private readonly FPLService _fplService;

        private ICollection<Element> _players;
        private ICollection<Position> _playerPositions;
        private ICollection<Club> _teams;
        private Event _currentEvent;

        private const int _hard_coded_league_id = 612541;
        private const string var_image_url = "https://pbs.twimg.com/media/EBo9MzKXsAcoO3x.jpg";
        private ICollection<Fixture> _plFixtures;
        private H2hLeagueMatches _draftFixtures;
        private H2hLeague _league;

        private int _gameweekId;

        private ICollection<KeyValuePair<int, string>> _tags = new List<KeyValuePair<int, string>>
        {
            new KeyValuePair<int, string>(2732877,  "<@U019L6Z5T3J>"), // Ant
            new KeyValuePair<int, string>(2711483,  "<@U01908NL084>"), // Ben
            new KeyValuePair<int, string>(2708402,  "<@U018SKYEB18>"), // Chris
            new KeyValuePair<int, string>(2744985,  "<@U018R28C37F>"), // Dan H
            new KeyValuePair<int, string>(2825881,  "<@U019GF3N28G>"), // Lee
            new KeyValuePair<int, string>(2739784,  "<@U019LQZSPMW>"), // LP
            new KeyValuePair<int, string>(2734185,  "<@U018SKMM39Q>"), // Phil
            new KeyValuePair<int, string>(2710848,  "<@U018VKEMHM3>"), // Picken
            new KeyValuePair<int, string>(2730920,  "<@U018P82BA21>"), // Tom
            new KeyValuePair<int, string>(2747488,  "<@U019LQX01S4>"), // Tommo
            new KeyValuePair<int, string>(2741381,  "<@U019365M90C>"), // Tony
            new KeyValuePair<int, string>(2736727,  "<@U018VNAMKTP>")  // Wayne
        };

        public FPLUpdatesJob(ILogger logger, IAlert alerts)
        {
            _logger = logger;
            _alerts = alerts;

            _fplService = new FPLService();
        }

        public void Run()
        {
            SetCoreItems();
            while (1 == 1)
            {
                UpdateGameweek();
                System.Threading.Thread.Sleep(10000);
            }
        }

        private bool hadAlreadyStarted = true;
        private void SetCoreItems()
        {
            var fplBase = _fplService.GetFPLBase();
            _currentEvent = fplBase.events.First(a => !a.Finished);

            if (!_currentEvent.IsCurrent)
                hadAlreadyStarted = false;

            while (!_currentEvent.IsCurrent)
            {
                System.Threading.Thread.Sleep(60000);
                _logger.Log("Waiting for the Gameweek to start.");

                try
                {
                    fplBase = _fplService.GetFPLBase();
                    _currentEvent = fplBase.events.First(a => !a.Finished);
                }
                catch(Exception ex) { _logger.Log("Cannot get the event from the FPL API at the moment."); }
            }

            _players = fplBase.elements.ToList();
            _playerPositions = fplBase.positions.ToList();
            _teams = fplBase.clubs.ToList();

            _gameweekId = _currentEvent.Id;
            _plFixtures = _fplService.GetGameweekFixtures(_gameweekId);
            _plFixtures.ToList().ForEach(fixture =>
            {
                fixture.TeamH = _teams.FirstOrDefault(a => a.id == fixture.TeamHId);
                fixture.TeamA = _teams.FirstOrDefault(a => a.id == fixture.TeamAId);
            });

            _draftFixtures = _fplService.GetH2hFixtures(_hard_coded_league_id, _gameweekId);
            _league = _fplService.GetH2hLeague(_hard_coded_league_id);

            SetEntriesPicks();
            SetH2hFixtureEntries();

            if (!hadAlreadyStarted)
            {
                try
                {
                    var fixtureMessage = $"*Fixtures for this week:*{Environment.NewLine}{string.Join(Environment.NewLine, _draftFixtures.Matches.Select(x => $"({x.TeamAPoints}) {x.TeamAName} v {x.TeamBName} ({x.TeamBPoints})"))}";
                    BroadcastAlertMessage(fixtureMessage);
                }
                catch (Exception ex) { }

                try
                {
                    BroadcastAlertMessage("KENBOT TESTING.");
                    _draftFixtures.Matches.ToList().ForEach(df =>
                    {
                        var teamAName = $"*{df.TeamAEntry.TeamName}*:";
                        var teamAFixtureStartingLineup = string.Join("", df.TeamAEntry.Picks.Picks.Take(11).Select(p => $"{Environment.NewLine}{p.Player.position_name_short}: {p.Player.web_name}{(p.IsCaptain ? " (C)" : p.IsViceCaptain ? " (VC)" : string.Empty)}"));
                        var teamAFixtureSubs = $"{Environment.NewLine}_Subs:_{string.Join("", df.TeamAEntry.Picks.Picks.Reverse().Take(4).Select(p => $"{Environment.NewLine}_{p.Player.position_name_short}: {p.Player.web_name}_"))}";
                        BroadcastAlertImageMessage(teamAName + teamAFixtureStartingLineup + teamAFixtureSubs, df.TeamAEntry.Picks.Picks.First(p => p.IsCaptain).Player.photo_url);

                        var teamBName = $"*{df.TeamBEntry.TeamName}*:";
                        var teamBFixtureStartingLineup = string.Join("", df.TeamBEntry.Picks.Picks.Take(11).Select(p => $"{Environment.NewLine}{p.Player.position_name_short}: {p.Player.web_name}{(p.IsCaptain ? " (C)" : p.IsViceCaptain ? " (VC)" : string.Empty)}"));
                        var teamBFixtureSubs = $"{Environment.NewLine}_Subs:_{string.Join("", df.TeamBEntry.Picks.Picks.Reverse().Take(4).Select(p => $"{Environment.NewLine}_{p.Player.position_name_short}: {p.Player.web_name}_"))}";
                        BroadcastAlertImageMessage(teamBName + teamBFixtureStartingLineup + teamBFixtureSubs, df.TeamBEntry.Picks.Picks.First(p => p.IsCaptain).Player.photo_url);
                    });
                }
                catch (Exception ex) { }
            }
        }

        private void UpdateGameweek()
        {
            _logger.Log("Updating...");
            try
            {
                var updatedGameweek = _fplService.GetGameweekFixtures(_gameweekId);

                foreach (Fixture originalFixture in _plFixtures)
                {
                    var updatedFixture = updatedGameweek.FirstOrDefault(a => a.Code == originalFixture.Code);
                    updatedFixture.TeamH = originalFixture.TeamH;
                    updatedFixture.TeamA = originalFixture.TeamA;

                    if (!updatedFixture.Started)
                        continue;

                    if (!originalFixture.Started && updatedFixture.Started)
                    {
                        BroadcastAlertMessage($"*KICK OFF:* {originalFixture.TeamH.name} v {originalFixture.TeamA.name}");
                        continue;
                    }

                    if (!originalFixture.FinishedProvisional && updatedFixture.FinishedProvisional)
                    {
                        BroadcastAlertMessage($"*FULL TIME:* {originalFixture.TeamH.name} ({originalFixture.TeamHScore}) v ({originalFixture.TeamAScore}) {originalFixture.TeamA.name}");
                        continue;
                    }

                    var goalAlerts = GetDifferences(originalFixture, updatedFixture, FixtureStatType.GoalsScored);
                    var assistAlerts = GetDifferences(originalFixture, updatedFixture, FixtureStatType.Assists);
                    var yellowCards = GetDifferences(originalFixture, updatedFixture, FixtureStatType.YellowCards);
                    var redCards = GetDifferences(originalFixture, updatedFixture, FixtureStatType.RedCards);
                    var ownGoals = GetDifferences(originalFixture, updatedFixture, FixtureStatType.OwnGoals);
                    var penaltiesMissed = GetDifferences(originalFixture, updatedFixture, FixtureStatType.PenaltiesMissed);
                    var penaltiesSaved = GetDifferences(originalFixture, updatedFixture, FixtureStatType.PenaltiesSaved);
                    var bonusPoints = GetDifferences(originalFixture, updatedFixture, FixtureStatType.Bonus);

                    if (goalAlerts.Count() > 0)
                    {
                        goalAlerts.ToList().ForEach(goal =>
                        {
                            LogKenbotEvent(FixtureStatType.GoalsScored, goal);
                        });
                    }

                    if (assistAlerts.Count() > 0)
                    {
                        assistAlerts.ToList().ForEach(assist =>
                        {
                            LogKenbotEvent(FixtureStatType.Assists, assist);
                        });
                    }

                    if (yellowCards.Count() > 0)
                    {
                        yellowCards.ToList().ForEach(yellowCard =>
                        {
                            LogKenbotEvent(FixtureStatType.YellowCards, yellowCard);
                        });
                    }

                    if (redCards.Count() > 0)
                    {
                        redCards.ToList().ForEach(redCard =>
                        {
                            LogKenbotEvent(FixtureStatType.RedCards, redCard);
                        });
                    }

                    if (ownGoals.Count() > 0)
                    {
                        ownGoals.ToList().ForEach(ownGoal =>
                        {
                            LogKenbotEvent(FixtureStatType.OwnGoals, ownGoal);
                        });
                    }

                    if (penaltiesMissed.Count() > 0)
                    {
                        penaltiesMissed.ToList().ForEach(penaltyMissed =>
                        {
                            LogKenbotEvent(FixtureStatType.PenaltiesMissed, penaltyMissed);
                        });
                    }

                    if (penaltiesSaved.Count() > 0)
                    {
                        penaltiesSaved.ToList().ForEach(penaltySaved =>
                        {
                            LogKenbotEvent(FixtureStatType.PenaltiesSaved, penaltySaved);
                        });
                    }

                    if (bonusPoints.Count() > 0)
                    {
                        BroadcastAlertMessage(GetBonusInfo(updatedFixture));
                    }
                }

                _plFixtures = updatedGameweek;
            }
            catch(Exception ex)
            {
                _logger.Log("Problem getting gameweek... " + ex.Message.ToString());
            }
        }

        public IEnumerable<FixtureStatValue> GetDifferences(Fixture fixture1, Fixture fixture2, FixtureStatType type)
        {
            var obj1Stats = fixture1.Stats.FirstOrDefault(a => a.Identifier == type);
            var obj2Stats = fixture2.Stats.FirstOrDefault(a => a.Identifier == type);

            var homeAlerts = obj2Stats.HomeStats.Except(obj1Stats.HomeStats, new FixtureStatValueComparer());
            var awayAlerts = obj2Stats.AwayStats.Except(obj1Stats.AwayStats, new FixtureStatValueComparer());
            var homeRemoved = obj1Stats.HomeStats.Where(or => obj2Stats.HomeStats.Count(rr => rr.Element == or.Element) == 0);
            var awayRemoved = obj1Stats.AwayStats.Where(or => obj2Stats.AwayStats.Count(rr => rr.Element == or.Element) == 0);

            homeAlerts.ToList().ForEach(ha =>
            {
                var originalValue = obj1Stats.HomeStats.Where(a => a.Element == ha.Element).FirstOrDefault()?.Value ?? 0;
                var revisedValue = obj2Stats.HomeStats.Where(a => a.Element == ha.Element).FirstOrDefault()?.Value ?? 0;
                ha.ValueVariation = revisedValue - originalValue;
            });
            awayAlerts.ToList().ForEach(aa =>
            {
                var originalValue = obj1Stats.AwayStats.Where(a => a.Element == aa.Element).FirstOrDefault()?.Value ?? 0;
                var revisedValue = obj1Stats.AwayStats.Where(a => a.Element == aa.Element).FirstOrDefault()?.Value ?? 0;
                aa.ValueVariation = revisedValue - originalValue;
            });
            homeRemoved.ToList().ForEach(hr => hr.ValueVariation = -1);
            awayRemoved.ToList().ForEach(ar => ar.ValueVariation = -1);

            return homeAlerts
                .Union(awayAlerts)
                .Union(homeRemoved)
                .Union(awayRemoved);
        }

        private void LogKenbotEvent(FixtureStatType alertType, FixtureStatValue statValue)
        {
            var player = _players.FirstOrDefault(a => a.id == statValue.Element);
            var team = _teams.FirstOrDefault(b => b.code == player.team_code);
            var fplTeams = _league.Standings.Entries.Where(a => a.EntryObject.Picks.Picks.Where(b => b.PlayerId == player.id).Count() > 0);
            var isVar = statValue.ValueVariation < 0;

            if (!fplTeams.Any())
                return;

            UpdatePickPoints();

            H2hLeagueMatch fplFixture = null;
            fplFixture = _draftFixtures.Matches.FirstOrDefault(c => c.TeamAId == fplTeams.FirstOrDefault().EntryID || c.TeamBId == fplTeams.FirstOrDefault().EntryID);
            var botMessage = $"{GetTextFromStatType(alertType, isVar)} {player.web_name} ({team.short_name})";
            botMessage += $" of {string.Join(", ", fplTeams.Select(a => a.EntryName))} \n• SCORE: {GetAdditionalH2hInfo(fplFixture)}";
            BroadcastAlertImageMessage(botMessage, isVar ? var_image_url : player.photo_url);
        }

        private void SetEntriesPicks()
        {
            _league.Standings.Entries.ToList().ForEach(entry =>
            {
                entry.EntryObject = GetEntryFromID(entry.EntryID);
                entry.EntryObject.Picks = _fplService.GetEntryPicks(entry.EntryID, _gameweekId);
            });
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

        private void SetH2hFixtureEntries()
        {
            _draftFixtures.Matches.ToList().ForEach(fixture =>
            {
                var h2hFixture = _fplService.GetH2hFixture(_hard_coded_league_id, _gameweekId, fixture.Id);
                fixture.TeamAEntry = h2hFixture.TeamAEntry;
                fixture.TeamBEntry = h2hFixture.TeamBEntry;
            });
        }

        private string GetTextFromStatType(FixtureStatType type, bool isVar = false)
        {
            var returnText = "Unknown action by";

            if (!isVar)
            {
                switch (type)
                {
                    case FixtureStatType.GoalsScored:
                        returnText = ":soccer: *GOAL!* :soccer: \n• Scored by";
                        break;
                    case FixtureStatType.Assists:
                        returnText = ":a: *Assist* :a: by";
                        break;
                    case FixtureStatType.YellowCards:
                        returnText = ":warning: *Yellow card* :warning: for";
                        break;
                    case FixtureStatType.RedCards:
                        returnText = ":no_entry: *Red card* :no_entry: for";
                        break;
                    case FixtureStatType.OwnGoals:
                        returnText = ":man_facepalming: *Own goal* :man_facepalming: by";
                        break;
                    case FixtureStatType.PenaltiesMissed:
                        returnText = ":man_facepalming: *Penalty missed* :man_facepalming: by";
                        break;
                    case FixtureStatType.PenaltiesSaved:
                        returnText = ":open_hands: *Penalty saved* :open_hands: by";
                        break;
                }
            }
            else
            {
                switch (type)
                {
                    case FixtureStatType.GoalsScored:
                        returnText = "*REVIEW* - Goal removed for";
                        break;
                    case FixtureStatType.Assists:
                        returnText = "*REVIEW* - Assist removed for";
                        break;
                    case FixtureStatType.YellowCards:
                        returnText = "*REVIEW* - Assist removed for";
                        break;
                    case FixtureStatType.RedCards:
                        returnText = "*REVIEW* - Red card removed for";
                        break;
                    case FixtureStatType.OwnGoals:
                        returnText = "*REVIEW* - Own goal removed for";
                        break;
                    case FixtureStatType.PenaltiesMissed:
                        returnText = "*REVIEW* - Penalty miss removed for";
                        break;
                    case FixtureStatType.PenaltiesSaved:
                        returnText = "*REVIEW* - Penalty save removed for";
                        break;
                }
            }

            return returnText;
        }

        private string GetAdditionalH2hInfo(H2hLeagueMatch fplFixture)
        {
            var h = GetEntryFromID(fplFixture.TeamAId);
            var a = GetEntryFromID(fplFixture.TeamBId);

            if (fplFixture != null)
            {
                return $"{_tags.Where(tag => tag.Key == fplFixture.TeamAId).FirstOrDefault().Value} {h.Picks.LivePoints()}-{a.Picks.LivePoints()} { _tags.Where(tag => tag.Key == fplFixture.TeamBId).FirstOrDefault().Value}";
            }
            else
                return string.Empty;
        }

        private Entry GetEntryFromID(int entryID)
        {
            var entry = _fplService.GetEntryFromID(entryID, _gameweekId);
            entry.Picks = _league.Standings.Entries.FirstOrDefault(a => a.EntryID == entry.Id)?.EntryObject?.Picks ?? null;
            return entry;
        }

        private string GetBonusInfo(Fixture fixture)
        {
            var bonusStats = fixture.Stats.FirstOrDefault(a => a.Identifier == FixtureStatType.Bonus);
            var bonusInfo = bonusStats.HomeStats.Union(bonusStats.AwayStats).OrderByDescending(a => a.Value);
            if (!bonusInfo.Any())
                return string.Empty;

            string strBonus = $"(PROVISIONAL) BONUS POINTS: --->";
            foreach (FixtureStatValue bonus in bonusInfo)
            {
                strBonus += $"{Environment.NewLine}{_players.FirstOrDefault(b => b.id == bonus.Element).web_name}: {bonus.Value}";
            }

            return strBonus;
        }

        // alerts stuff:
        private void BroadcastAlertMessage(string message)
        {
            _alerts.MessageAlert(message, _logger);
        }

        private void BroadcastAlertImageMessage(string message, string image)
        {
            _alerts.ImageMessageAlert(message, image, _logger);
        }
    }
}
