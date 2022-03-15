using FPLDraftV2.Controllers.FPL;
using FPLV2Core.Models.Slack;
using FPLV2Core.Models.FPL;
using FPLV2Core.Models.FPLDraft;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Net.Http;
using System.IO;
using System.Text.RegularExpressions;
using Humanizer;
using FPLV2Core.Tools;
using Newtonsoft.Json.Linq;
using System.Web;

namespace FPLDraftV2.Controllers.Slack
{
    [Route("api/slack")]
    [ApiController]
    public class SlackController
    {
        private FPLController _fplController;
        private DraftController _draftController;
        private SlackClient _slackClient;
        private SlackClient _loggingSlackClient;
        private const int _league_id = 429551;

        private static readonly HttpClient client = new HttpClient();

        // live:
        //private const string _slackClientConnection = "https://hooks.slack.com/services/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";

        // waiver LIVE
        private const string _slackClientConnection = "https://hooks.slack.com/services/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";

        // krg:
        //private const string _slackClientConnection = "https://hooks.slack.com/services/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";

        // debug:
        private const string _loggingSlackClientConnection = "https://hooks.slack.com/services/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";

        public SlackController()
        {
            _fplController = new FPLController();
            _draftController = new DraftController();
            _slackClient = new SlackClient(_slackClientConnection);
            _loggingSlackClient = new SlackClient(_loggingSlackClientConnection);
        }

        [HttpPost("kenbot")]
        public ActionResult Kenbot([FromForm] SlashCommandRequest payload)
        {
            ActionResult jsonResult = null;

            if (!string.IsNullOrEmpty(payload.Text))
            {
                if (payload.Text.ToLower().StartsWith("nominate "))
                {
                    try
                    {
                        //_slackClient.PostMessage("It gets to point 2");
                        var nominationJson = JsonNominate(payload);
                        if (nominationJson == null)
                        {
                            return new StatusCodeResult(200);
                        }
                        else
                        {
                            return nominationJson;
                        }
                    }
                    catch(Exception ex)
                    {
                        return new JsonResult(ex.ToString());
                    }
                }

                switch (payload.Text.ToLower())
                {
                    case "league":
                        jsonResult = JsonLeagueTableBasic();
                        break;
                    case "fixtures":
                        jsonResult = JsonFixturesBasic(false);
                        break;
                    case "scores":
                        jsonResult = JsonFixturesBasic(true);
                        break;
                    case "waiver":
                        jsonResult = JsonWaiverBasic();
                        break;
                    case "announce":
                        jsonResult = JsonAnnounce();
                        break;
                }
            }

            if (jsonResult == null)
            {
                jsonResult = JsonUnfoundError();
            }

            return jsonResult;
        }

        [HttpPost("submission")]
        public ActionResult Submission([FromForm] string payload)
        {
            try
            {
                string type = (string)JObject.Parse(payload)["type"];

                if (type == "view_submission") // it's a modal submission from the user
                {
                    var convertedPayload = JsonConvert.DeserializeObject<ViewSubmissionPayload>(payload);

                    Regex regex = new Regex(@"player_id (.*?):");
                    var v = regex.Match(payload);
                    var player_id = int.Parse(v.Groups[1].ToString());

                    _slackClient.PostBlockMessage(JsonNominated(convertedPayload, player_id));

                    var nominator = _draftController.GetDraftManagers().Value.First(dm => dm.slack_id == $"<@{convertedPayload.user.id}>");
                    var player = _fplController.Get().Value.elements.First(e => e.id == player_id);

                    CreateNominationEntry(player, nominator, "N/A", 13);
                }
                else if(type == "block_actions") // someone has interacted with a block
                {
                    var convertedPayload = JsonConvert.DeserializeObject<BlockActionsPayload>(payload);
                    var mainAction = convertedPayload.actions.FirstOrDefault();

                    if (mainAction.value == "click_yes" || mainAction.value == "click_no")
                    {
                        //_slackClient.PostMessage(payload);

                        Regex regex = new Regex(@"player_id (.*?):");
                        var v = regex.Match(payload);
                        var player_id = int.Parse(v.Groups[1].ToString());

                        IEnumerable<DraftManager> draft_managers = _draftController.GetDraftManagers().Value;
                        DraftManager draft_manager = null;
                        Nomination nomination = null;

                        try
                        {
                            draft_manager = GetDraftManangerFromSlackUsername(draft_managers, convertedPayload.user.id);
                        }
                        catch(Exception ex)
                        {
                            _loggingSlackClient.PostMessage("Problem getting the draft manager (line 147).");
                        }
                        try
                        {
                            nomination = _draftController.GetActiveNominationByPlayerId(player_id)?.Value;
                        }
                        catch (Exception ex)
                        {
                            _loggingSlackClient.PostMessage("Problem getting the nomination.");
                        }

                        var nominating_manager = draft_managers.FirstOrDefault(dm => dm.id == nomination.nominator_id);

                        if (draft_manager != null && nomination != null && nominating_manager != null)
                        {


                            _loggingSlackClient.PostMessage("Nominating manager seed: " + nominating_manager.waiver_order);
                            _loggingSlackClient.PostMessage("Voting manager seed: " + draft_manager.waiver_order);

                            // already nominated:
                            if (nomination.nomination_activity != null && nomination.nomination_activity.Any(n => n.manager_id == draft_manager.id))
                            {
                                _slackClient.PostThreadMessage($"{draft_manager.slack_id} - you have already said Yes/No to this player...", convertedPayload.message.ts, false);
                                return new StatusCodeResult(200);
                            }

                            // is the nominator:
                            if (draft_manager.id == nomination.nominator_id)
                            {
                                _slackClient.PostThreadMessage($"{draft_manager.slack_id} - you cannot say Yes/No to a player you nominated.", convertedPayload.message.ts, false);
                                return new StatusCodeResult(200);
                            }

                            // eligibility:
                            if (draft_manager.waiver_order >= nominating_manager.waiver_order)
                            {
                                _slackClient.PostThreadMessage($"{draft_manager.slack_id} - you are not eligible to bid on this player (waiver position).", convertedPayload.message.ts, false);
                                return new StatusCodeResult(200);
                            }

                            if (draft_manager.transfers_remaining <= 0)
                            {
                                _slackClient.PostThreadMessage($"{draft_manager.slack_id} - you are not eligible to bid on this player (no transfers remaining).", convertedPayload.message.ts, false);
                                return new StatusCodeResult(200);
                            }


                            if (mainAction.value == "click_yes")
                            {
                                _slackClient.PostThreadMessage($"<@{convertedPayload.user.id}> said *YES*.", convertedPayload.message.ts);
                            }
                            else if (mainAction.value == "click_no")
                            {
                                _slackClient.PostThreadMessage($"<@{convertedPayload.user.id}> said *NO*.", convertedPayload.message.ts);
                            }

                            try
                            {
                                
                                if (nomination != null)
                                {
                                    nomination.nomination_activity.Add(new NominationActivity()
                                    {
                                        manager_id = draft_manager.id,
                                        response = mainAction.value == "click_yes",
                                        response_time = DateTime.Now
                                    });

                                    _loggingSlackClient.PostMessage(JsonConvert.SerializeObject(nomination.nomination_activity));
                                    _draftController.NominatePlayer(nomination);
                                }
                                else
                                {
                                    _loggingSlackClient.PostMessage("Cannot find a nomination for player ID: " + player_id);
                                }
                            }
                            catch(Exception ex)
                            {
                                _loggingSlackClient.PostMessage("There was a problem getting the nomination. It was: " + ex.Message.ToString());
                            }
                        }



                    }
                }
                else
                {
                    _loggingSlackClient.PostMessage(payload);
                }
            }
            catch (Exception ex)
            {
                _slackClient.PostMessage($"there was a problem ---> '{ex.Message.ToString()}'");
            }

            return new StatusCodeResult(200);
        }

        [HttpGet("kenbot_league")]
        public ActionResult KenbotLeague()
        {
            JsonResult jsonResult = JsonLeagueTableBasic();
            return jsonResult;
        }

        [HttpGet("kenbot_fixtures")]
        public ActionResult KenbotFixtures()
        {
            JsonResult jsonResult = JsonFixturesBasic(false);
            return jsonResult;
        }

        [HttpGet("kenbot_scores")]
        public ActionResult KenbotScores()
        {
            JsonResult jsonResult = JsonFixturesBasic(true);
            return jsonResult;
        }

        [HttpGet("kenbot_announce")]
        public ActionResult KenbotAnnounce()
        {
            return JsonAnnounce();
        }

        [HttpGet("kenbot_fixture_show_more/{id}")]
        public ActionResult KenbotFixtureShowMore(int id)
        {
            var json = new
            {
                text = $"get more info for fixture #{id}"
            };

            return new JsonResult(json);
        }

        [HttpGet("kenbot_example_nomination_debug")]
        public ActionResult KenbotExampleNominationDebug()
        {
            var text = "{\u0022Token\u0022:\u00220RHSMDUwLNLfD3rkFVdnvJVQ\u0022,\u0022team_id\u0022:\u0022T018QK04XT4\u0022,\u0022team_domain\u0022:\u0022wv1draftfpl\u0022,\u0022enterprise_id\u0022:null,\u0022enterprise_name\u0022:null,\u0022channel_id\u0022:\u0022D0189SKGABH\u0022,\u0022channel_name\u0022:\u0022directmessage\u0022,\u0022user_id\u0022:null,\u0022user_name\u0022:\u0022scatmanjohn85\u0022,\u0022Command\u0022:\u0022/kenbot\u0022,\u0022Text\u0022:\u0022nominate king\u0022,\u0022response_url\u0022:\u0022https://hooks.slack.com/commands/T018QK04XT4/2325515688151/kdyBx8JrDsfuIfd53vgIwNvX\u0022,\u0022trigger_id\u0022:\u00222346427662484.1296646167922.4e8d1ad1491bd01649d359508cd5500e\u0022}";
            var payload = JsonConvert.DeserializeObject<SlashCommandRequest>(text);
            return JsonNominate(payload);
        }

        [HttpGet("kenbot_nominate_manual")]
        public ActionResult KenbotNominate_Manual()
        {
            // get the user -> can they still nominate?
            var draftManagers = _draftController.GetDraftManagers().Value;
            var nominator = draftManagers.First(dm => dm.name == $"Phil Prescott"); // manager name
            var waiverManagers = draftManagers.Where(dm => dm.waiver_order <= nominator.waiver_order).OrderBy(dm => dm.waiver_order);

            // get the player ->
            var fplBase = _fplController.Get().Value;
            var club = fplBase.clubs.FirstOrDefault(club => club.name.ToLower() == "burnley");
            var position = fplBase.positions.FirstOrDefault(pos => pos.singular_name.ToLower() == "forward");
            var image_url = "https://1vs1-7f65.kxcdn.com/img/players/wout-weghorst_158314_134-ub-800.png";
            var value = 10002;
            var player = new Element() { first_name = "Mr", second_name = "Weghorst", web_name = "Mr Weghorst", club = club, position = position, now_cost = value, code = 126184, id = 258 };


            // if all checks out, create a nomination and inform the user!!!
            CreateNominationEntry(player, nominator, "N/A", 13);
            _slackClient.PostBlockMessage(GetNominatedJson(player, nominator.slack_id, waiverManagers));
            return new JsonResult(GetNominatedJson(player, nominator.slack_id, waiverManagers));
        }

        private JsonResult JsonAnnounce()
        {
            try
            {
                var nomination = _draftController.GetMostRecentActiveNomination()?.Value;
                if (nomination == null)
                    return new JsonResult(new { type = "Text", text = "There is no active nomination to conclude." });

                var nominatedPlayer = _fplController.Get().Value.elements.FirstOrDefault(e => e.id == nomination.player_id);
                var draft_managers = _draftController.Get().Value.draft_managers;
                var confirmingManagerIds = nomination.nomination_activity.Where(n => n.response).Select(n => n.manager_id);
                var successfulManager = confirmingManagerIds.Any()
                    ? draft_managers.Where(dm => confirmingManagerIds.Contains(dm.id)).OrderBy(dm => dm.waiver_order).FirstOrDefault()
                    : draft_managers.FirstOrDefault(dm => dm.id == nomination.nominator_id);


                _slackClient.PostMessage($"{successfulManager.team_name} have successfully completed the signing of {nominatedPlayer.first_name} {nominatedPlayer.web_name}.");

                nomination.completion_date = DateTime.Now;
                nomination.manager_id = successfulManager.id;
                _draftController.NominatePlayer(nomination);

                var draftManagersToChange = draft_managers.Where(dm => dm.waiver_order >= successfulManager.waiver_order);
                draftManagersToChange.ToList().ForEach(dm =>
                {
                    if (dm.id == successfulManager.id)
                    {
                        dm.waiver_order = draft_managers.Count();
                        dm.transfers_remaining--;
                    }
                    else
                    {
                        dm.waiver_order--;
                    }

                    _draftController.UpdateDraftManagerWaiverInfo(dm);
                });

                return JsonWaiverBasic();
            }
            catch (Exception ex)
            {
                var json = new
                {
                    type = "text",
                    text = "Error: " + ex.Message.ToString(),
                    response_type = "in_channel"
                };

                return new JsonResult(json);
            }
        }

        private JsonResult JsonUnfoundError()
        {
            var json = new
            {
                text = ":soccer: problem with Kenbot command \n to use Kenbot you must use the `/Kenbot` command with one of the following options: \n `/Kenbot league`"
            };

            return new JsonResult(json);
        }

        private JsonResult JsonLeagueTableBasic()
        {
            var league = _fplController.GetH2hLeague(_league_id);

            var json = new
            {
                type = "text",
                text = string.Join("\n", league.Standings.Entries.Select(e => $"{GetLeagueStatusIcon(e)} ({e.RankSort}) {ManagerConverter.GetManagerShortName(e.PlayerName)} ---> {e.Total} [{e.PointsFor}]")),
                response_type = "in_channel"
            };

            return new JsonResult(json);
        }

        private string GetLeagueStatusIcon(H2hLeagueEntry e)
        {
            if (e.TableStatus == "+")
                return ":arrow_up:";
            else if (e.TableStatus == "-")
                return ":small_red_triangle_down:";
            else
                return ":black_small_square:";
        }

        private JsonResult JsonFixturesBasic(bool scores = false)
        {
            var gw = scores ? _fplController.GetScoresGameweek() : _fplController.GetFixtureGameweek();
            var fixtures = _fplController.GetH2hFixtures(_league_id, gw.Id);
            string content;

            if (scores)
            {
                content = $"*{(gw.IsCurrent && !gw.Finished ? "LIVE" : "CONFIRMED")} SCORES FOR GAMWEEK {gw.Id}:*\n";
                if (gw.Finished)
                    content += string.Join("\n", fixtures.Matches.Select(f => $"{f.TeamAPlayerName} *{f.TeamAPoints}* - *{f.TeamBPoints}* {f.TeamBPlayerName}"));
                else
                    content += string.Join("\n", fixtures.Matches.Select(f => $"{f.TeamAPlayerName} *{_fplController.GetEntry(f.TeamAId, gw.Id).Points}* - *{_fplController.GetEntry(f.TeamBId, gw.Id).Points}* {f.TeamBPlayerName}{(!gw.Finished ? $" <https://wv1draft.azurewebsites.net/livefixture/{_league_id}/{gw.Id}/{f.Id}|[more info]>" : string.Empty)}"));
            }
            else
            {
                content = $"*FIXTURES FOR GAMWEEK {gw.Id}:*\n";
                content += string.Join("\n", fixtures.Matches.Select(f => $"{f.TeamAPlayerName} v {f.TeamBPlayerName}"));
            }

            var json = new
            {
                type = "text",
                text = content,
                response_type = "in_channel"
            };

            return new JsonResult(json);
        }

        private JsonResult JsonWaiverBasic()
        {
            var waiverManagers = _draftController.GetDraftManagers().Value.OrderBy(dm => dm.transfers_remaining == 0).ThenBy(dm => dm.waiver_order);
            var content = $"*The waiver order is now as follows: * {Environment.NewLine}" +
                $"{string.Join(Environment.NewLine, waiverManagers.Select(dm => getWaiverManagerText(waiverManagers, dm)))}";

            var json = new
            {
                type = "text",
                text = content,
                response_type = "in_channel"
            };

            return new JsonResult(json);
        }

        private ActionResult JsonNominate(SlashCommandRequest payload)
        {
            string content = "";
            Element match = null;

            if (payload.Text.Split(" ").Count() == 1)
            {
                content = "Please specify a player to nominate, e.g. `/kenbot nominate Panesar` or `/kenbot nominate Monty Panesar`";
            }
            else
            {
                var matchOn = payload.Text.Replace("nominate ", "");
                var fplBase = _fplController.Get().Value;

                var matches = fplBase.elements.Where(e => matchOn.ToLower().Contains(e.first_name.ToLower()) && matchOn.ToLower().Contains(e.safe_web_name.ToLower()));
                if(matches.Count() == 0)
                    matches = fplBase.elements.Where(e => e.safe_web_name.ToLower() == matchOn.ToLower());

                if(matches.Count() == 0 )
                {
                    return new JsonResult(new { type = "text", text = "Cannot find a player with that name. Please try again." });
                }

                match = matches.FirstOrDefault();
            }


            //var draft_manager = _draftController.Get().Value.draft_managers.First(dm => dm.slack_id == payload.user_name);
            //if (draft_manager == null)
            //{
            //    content = "Draft manager not found.";
            //}
            //else
            //{
            //    try
            //    {
            //        var current_nomination = _draftController.GetCurrentNomination().Value;
            //        if (current_nomination == null)
            //        {
            //            _draftController.CreateNominationLink();
            //            current_nomination = _draftController.GetCurrentNomination().Value;
            //        }

            //        if (current_nomination.nomination_status == NominationStatus.nominated)
            //            content = "There is already a nomination in progress";
            //        else if (current_nomination.date_active.AddMinutes(draft_manager.waiver_order) < DateTime.Now)
            //            content = $"You cannot nominate until {(current_nomination.date_active.AddMinutes(draft_manager.waiver_order).ToString("dd/MM/yyyy hh:mm:ss"))}";
            //        //else
            //        //content = $"You can now make a nomination <https://azurewebsites.wv1draft.net/nomination/{current_nomination.id}|here>";
            //    }
            //    catch (Exception ex)
            //    {
            //        var json = new
            //        {
            //            type = "text",
            //            text = "SOME KIND OF ERROR OCCURED FAM.",
            //            response_type = "in_channel"
            //        };

            //        return new JsonResult(json);
            //    }
            //}

            if (!string.IsNullOrEmpty(content))
            {
                var json = new
                {
                    type = "text",
                    text = content,
                    response_type = "in_channel"
                };

                return new JsonResult(json);
            }
            else
            {
                //return new JsonResult(payload.trigger_id);
                if (match?.id >= 0)
                {
                    return OpenNominationDialogRequest("https://slack.com/api/views.open", payload.trigger_id, match);
                }
                else
                {
                    var json = new
                    {
                        text = ":soccer: problem with Kenbot command \n to use Kenbot you must use the `/Kenbot` command with one of the following options: \n `/Kenbot league`"
                    };

                    return new JsonResult(json);
                }
            }
        }

        private JsonResult JsonConfirmNomination(SlashCommandRequest payload)
        {
            var draft_managers = _draftController.GetDraftManagers().Value.OrderBy(dm => dm.waiver_order);
            var successful_draft_manager = draft_managers.FirstOrDefault(dm => dm.name.ToLower() == payload.Text.Replace("confirm_nomination ", "").ToLower());
            if (successful_draft_manager != null)
            {

                draft_managers.Where(dm => dm.waiver_order >= successful_draft_manager.waiver_order).ToList().ForEach(dm =>
                {
                    if (dm.waiver_order == successful_draft_manager.waiver_order)
                    {
                        successful_draft_manager.waiver_order = 12;
                        successful_draft_manager.transfers_remaining--;
                    }
                    else
                    {
                        dm.waiver_order--;
                    }
                    _draftController.UpdateDraftManagerWaiverInfo(dm);
                });
            }

            //if (draft_manager == null)
            //{
            //    content = "Draft manager not found.";
            //}
            //else
            //{
            //    try
            //    {
            //        var current_nomination = _draftController.GetCurrentNomination().Value;
            //        if (current_nomination == null)
            //        {
            //            _draftController.CreateNominationLink();
            //            current_nomination = _draftController.GetCurrentNomination().Value;
            //        }

            //        if (current_nomination.nomination_status == NominationStatus.nominated)
            //            content = "There is already a nomination in progress";
            //        else if (current_nomination.date_active.AddMinutes(draft_manager.waiver_order) < DateTime.Now)
            //            content = $"You cannot nominate until {(current_nomination.date_active.AddMinutes(draft_manager.waiver_order).ToString("dd/MM/yyyy hh:mm:ss"))}";
            //        //else
            //        //content = $"You can now make a nomination <https://azurewebsites.wv1draft.net/nomination/{current_nomination.id}|here>";
            //    }
            //    catch (Exception ex)
            //    {
            //        var json = new
            //        {
            //            type = "text",
            //            text = "SOME KIND OF ERROR OCCURED FAM.",
            //            response_type = "in_channel"
            //        };

            //        return new JsonResult(json);
            //    }
            //}

            var json = new
            {
                type = "text",
                text = "",//string.Join(", ", draft_managers.)
                response_type = "in_channel"
            };

            return new JsonResult(json);
        }

        private string JsonNominated(ViewSubmissionPayload payload, int player_id)
        {
            // get the user -> can they still nominate?
            var draftManagers = _draftController.GetDraftManagers().Value;
            var nominator = draftManagers.First(dm => dm.slack_id == $"<@{payload.user.id}>");
            var waiverManagers = draftManagers.Where(dm => dm.waiver_order <= nominator.waiver_order && dm.transfers_remaining > 0).OrderBy(dm => dm.waiver_order);

            // get the player ->
            var player = _fplController.Get().Value.elements.First(e => e.id == player_id);

            // if all checks out, create a nomination and inform the user!!!
            return GetNominatedJson(player, payload.user.id, waiverManagers);
        }

        private JsonResult OpenNominationDialogRequest(string url, string trigger_id, Element match)
        {
            var httpWebRequest = (HttpWebRequest)WebRequest.Create(url);
            httpWebRequest.PreAuthenticate = true;
            httpWebRequest.Headers.Add("Authorization", "Bearer xoxb-1296646167922-1297674912434-kyEo9KbwugN8Rz4VHFnpiQKr");
            httpWebRequest.Accept = "application/json";
            httpWebRequest.ContentType = "application/json; charset=utf-8";
            httpWebRequest.Method = "POST";

            using (var streamWriter = new StreamWriter(httpWebRequest.GetRequestStream()))
            {
                streamWriter.Write(GetNominationDialog(trigger_id, match));
            }

            var httpResponse = (HttpWebResponse)httpWebRequest.GetResponse();
            using (var streamReader = new StreamReader(httpResponse.GetResponseStream()))
            {
                var result = streamReader.ReadToEnd();
                return null;
            }
        }

        private void CreateNominationEntry(Element match, DraftManager nominator, string slack_identifier, int draft_identifier)
        {
            var nomination = new Nomination()
            {
                player_id = match.id,
                nominator_id = nominator.id,
                date_nominated = DateTime.Now,
                deadline_date = DateTime.Now.AddDays(1),
                slack_id = slack_identifier,
                draft_id = draft_identifier
            };

            _draftController.NominatePlayer(nomination);
        }

        private string GetNominationDialog(string trigger_id, Element playerToNominate)
        {
            return JsonConvert.SerializeObject(new
            {
                trigger_id = trigger_id,
                view = new
                {
                    type = "modal",
                    title = new
                    {
                        type = "plain_text",
                        text = "Nominate a player"
                    },
                    submit = new
                    {
                        type = "plain_text",
                        text = "Nominate"
                    },
                    close = new
                    {
                        type = "plain_text",
                        text = "Cancel"
                    },
                    blocks = new object[]
                    {
                        new
                        {
                            type = "section",
                            block_id = "my_block",
                            text = new
                            {
                                type = "mrkdwn",
                                text = $"*Please confirm you want to nominate player_id {playerToNominate.id}:*" +
                                        Environment.NewLine + $"- {playerToNominate.first_name} {playerToNominate.web_name}" +
                                        Environment.NewLine + $"- {playerToNominate.position.singular_name}" +
                                        Environment.NewLine + $"- {playerToNominate.club.name}" +
                                        Environment.NewLine + $"- £{playerToNominate.now_cost / 10}m" +
                                        Environment.NewLine + Environment.NewLine + $"Before confirming your nomination, please ensure {playerToNominate.web_name} is available and you will have the funds/transfers available to buy him."
                            },
                            accessory = new
                            {
                                type = "image",
                                image_url = playerToNominate.photo_url,
                                alt_text = "player image"
                            }
                        }
                    }
                }
            });
        }

        private string GetNominatedJson(Element player, string user_id, IEnumerable<DraftManager> waiverManagers)
        {
            return JsonConvert.SerializeObject(new object[]
                {
                    new
                    {
                        type = "section",
                        text = new
                        {
                            type = "mrkdwn",
                            text = $":rotating_light: *NEW NOMINATION* - <@{user_id}> has nominated {player.first_name} {player.web_name} of {player.club.name} ({player.position.singular_name}) player_id {player.id}:" + Environment.NewLine + Environment.NewLine +
                            $"Waiver order is as follows:" + Environment.NewLine +
                            $"{string.Join(Environment.NewLine, waiverManagers.Select(dm => getNominationManagerText(waiverManagers, dm) ))}"
                        },
                        accessory = new
                        {
                            type = "image",
                            image_url = player.photo_url,
                            alt_text = "slack image"
                        }
                    },
                        new
                        {
                            type ="actions",
                            elements = new []
                            {
                                new
                                {
                                    type = "button",
                                    text = new
                                    {
                                        type = "plain_text",
                                        text = "Yes",
                                        emoji = true
                                    },
                                    value = "click_yes",
                                    style = "primary"
                                },
                                new
                                {
                                    type = "button",
                                    text = new
                                    {
                                        type = "plain_text",
                                        text = "No",
                                        emoji = true
                                    },
                                    value = "click_no",
                                    style = "danger"
                                }
                            }
                        }
            });
        }

        private string getNominationManagerText(IEnumerable<DraftManager> waiverManagers, DraftManager dm)
        {
            return $"• {dm.slack_id}" + (dm.waiver_order == waiverManagers.Max(dm => dm.waiver_order) ? " :arrow_backward: " : string.Empty);
        }

        private string getWaiverManagerText(IEnumerable<DraftManager> waiverManagers, DraftManager dm)
        {
            return $"• {(dm.transfers_remaining == 0 ? "~" : string.Empty)}{dm.slack_id}{(dm.transfers_remaining == 0 ? "~" : string.Empty)} { new StringBuilder().Insert(0, ":arrows_counterclockwise:", dm.transfers_remaining) }";
        }

        private DraftManager GetDraftManangerFromSlackUsername(IEnumerable<DraftManager> draftManagers, string username)
        {
            return draftManagers.FirstOrDefault(dm => dm.slack_id.Contains(username));
        }
    }

    public class SlackClient
    {
        private readonly Uri _uri;
        private readonly Encoding _encoding = new UTF8Encoding();
        private readonly string _user_access_token = "xoxp-1296646167922-1295274384069-2364978637107-6d4d7c95990543603a9f111588358c0a";
        private readonly string _bot_access_token = "xoxb-1296646167922-1297674912434-kyEo9KbwugN8Rz4VHFnpiQKr";

        public SlackClient(string urlWithAccessToken)
        {
            _uri = new Uri(urlWithAccessToken);
        }

        //Post a message using simple strings
        public void PostMessage(string text, string username = null, string channel = null)
        {
            PostPayload payload = new PostPayload()
            {
                Channel = channel,
                Username = username,
                Text = text
            };

            PostMessage(payload);
        }

        public void PostThreadMessage(string text, string thread_id, bool reply_broadcast = false, string username = null, string channel = null)
        {
            PostThreadPayload payload = new PostThreadPayload()
            {
                Channel = channel,
                Username = username,
                Text = text,
                thread_ts = thread_id,
                reply_broadcast = reply_broadcast
            };

            PostMessage(payload);
        }

        public void PostUpdateMessage(string text, string response_url, string username = null, string channel = null)
        {
            PostUpdatePayload payload = new PostUpdatePayload()
            {
                Channel = channel,
                Username = username,
                Text = text,
                replace_original = true
            };

            PostMessage(payload, response_url);
        }

        public void PostUpdateBlocksMessage(string text, string response_url, string username = null, string channel = null)
        {
            PostUpdatePayload payload = new PostUpdatePayload()
            {
                Channel = channel,
                Username = username,
                Blocks = text,
                replace_original = true
            };

            PostMessage(payload, response_url);
        }

        public string PostBlockMessage(string text, string username = null, string channel = null)
        {
            PostPayload payload = new PostPayload()
            {
                Channel = channel,
                Username = username,
                Blocks = text
            };

            return PostMessage(payload);
        }

        //Post a message using a Payload object
        public string PostMessage(PostPayload payload, string response_url = null)
        {
            string payloadJson = JsonConvert.SerializeObject(payload);

            using (WebClient client = new WebClient())
            {
                NameValueCollection data = new NameValueCollection();
                data["payload"] = payloadJson;

                var response = client.UploadValues((!string.IsNullOrEmpty(response_url) ? new Uri(response_url) : _uri), "POST", data);

                //The response text is usually "ok"
                return _encoding.GetString(response);
            }
        }

        public string PostEphermal(string channel, string text, string user, string thread_ts = "")
        {
            var apiUri = "https://slack.com/api/chat.postEphemeral";

            using (var wb = new WebClient())
            {
                NameValueCollection outgoingQueryString = HttpUtility.ParseQueryString(String.Empty);
                outgoingQueryString.Add("token", _user_access_token);
                outgoingQueryString.Add("channel", channel);
                outgoingQueryString.Add("text", text);
                outgoingQueryString.Add("user", user);
                if(thread_ts != string.Empty)
                    outgoingQueryString.Add("thread_ts", thread_ts);

                var response = wb.UploadValues(apiUri, "POST", outgoingQueryString);
                string responseString = Encoding.UTF8.GetString(response);
                var responseHeaders = wb.ResponseHeaders;
                return responseString;
            }
        }
    }
}
