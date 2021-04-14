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

namespace FPLDraftV2.Controllers.Slack
{
    [Route("api/slack")]
    [ApiController]
    public class SlackController
    {
        private FPLController _fplController;
        private DraftController _draftController;
        private SlackClient _slackClient;

        private static readonly HttpClient client = new HttpClient();

        // live:
        //private const string _slackClientConnection = "https://hooks.slack.com/services/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";

        // waiver LIVE
        private const string _slackClientConnection = "https://hooks.slack.com/services/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";

        // krg:
        //private const string _slackClientConnection = "https://hooks.slack.com/services/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";

        // debug:
        //private const string _slackClientConnection = "https://hooks.slack.com/services/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";

        public SlackController()
        {
            _fplController = new FPLController();
            _draftController = new DraftController();
            _slackClient = new SlackClient(_slackClientConnection);
        }

        [HttpPost("kenbot")]
        public ActionResult Kenbot([FromForm] SlashCommandRequest payload)
        {
            JsonResult jsonResult = null;

            if (!string.IsNullOrEmpty(payload.Text))
            {
                if (payload.Text.ToLower().StartsWith("nominate "))
                {
                    var nominationJson = JsonNominate(payload);
                    return new StatusCodeResult(200);
                }
                //else if(payload.Text.ToLower().StartsWith("confirm_nomination "))
                //{
                //    var nominationJson = JsonNominate(payload);
                //    return new StatusCodeResult(200);
                //}

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
                        jsonResult = JsonWaiverBasic(true);
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
                }
                else if(type == "block_actions") // someone has interacted with a block
                {
                    var convertedPayload = JsonConvert.DeserializeObject<BlockActionsPayload>(payload);
                    var mainAction = convertedPayload.actions.FirstOrDefault();

                    if(mainAction.value == "click_yes")
                    {
                        //convertedPayload.message.blocks.FirstOrDefault().text.text = convertedPayload.message.blocks.FirstOrDefault().text.text.Replace("@Tom Westwood", "~@Tom Westwood~");
                        //_slackClient.PostUpdateBlocksMessage(JsonConvert.SerializeObject(convertedPayload.message.blocks), convertedPayload.response_url);
                        _slackClient.PostThreadMessage($"<@{convertedPayload.user.id}> said *YES*.", convertedPayload.message.ts);
                    }
                    else if(mainAction.value == "click_no")
                    {
                        _slackClient.PostThreadMessage($"<@{convertedPayload.user.id}> said *NO*.", convertedPayload.message.ts);
                    }
                }
                else
                {
                    _slackClient.PostMessage(payload);
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

        [HttpGet("kenbot_fixture_show_more/{id}")]
        public ActionResult KenbotFixtureShowMore(int id)
        {
            var json = new
            {
                text = $"get more info for fixture #{id}"
            };

            return new JsonResult(json);
        }

        [HttpGet("kenbot_nominate_manual")]
        public ActionResult KenbotNominate_Manual()
        {
            // get the user -> can they still nominate?
            var draftManagers = _draftController.GetDraftManagers().Value;
            var nominator = draftManagers.First(dm => dm.name == $"Chris Thompson"); // manager name
            var waiverManagers = draftManagers.Where(dm => dm.waiver_order <= nominator.waiver_order).OrderBy(dm => dm.waiver_order);

            // get the player ->
            var fplBase = _fplController.Get().Value;
            var club = fplBase.clubs.FirstOrDefault(club => club.name.ToLower() == "liverpool");
            var position = fplBase.positions.FirstOrDefault(pos => pos.singular_name.ToLower() == "defender");
            var image_url = "https://cdn.realsociedad.eus/Uploads/jugadores/12.png";
            var value = 0;
            var player = new Element() { first_name = "Ben", second_name = "Davies", web_name = "Ben Davies", club = club, position = position, now_cost = value, code = -1 };


            // if all checks out, create a nomination and inform the user!!!
            _slackClient.PostBlockMessage(GetNominatedJson(player, nominator.slack_id, waiverManagers));
            return new JsonResult(GetNominatedJson(player, nominator.slack_id, waiverManagers));
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
            var league = _fplController.GetH2hLeague(612541);

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
            var fixtures = _fplController.GetH2hFixtures(612541, gw.Id);
            string content;

            if (scores)
            {
                content = $"*{(gw.IsCurrent && !gw.Finished ? "LIVE" : "CONFIRMED")} SCORES FOR GAMWEEK {gw.Id}:*\n";
                if (gw.Finished)
                    content += string.Join("\n", fixtures.Matches.Select(f => $"{f.TeamAPlayerName} *{f.TeamAPoints}* - *{f.TeamBPoints}* {f.TeamBPlayerName}"));
                else
                    content += string.Join("\n", fixtures.Matches.Select(f => $"{f.TeamAPlayerName} *{_fplController.GetEntry(f.TeamAId, gw.Id).Points}* - *{_fplController.GetEntry(f.TeamBId, gw.Id).Points}* {f.TeamBPlayerName}{(!gw.Finished ? $" <https://wv1draft.azurewebsites.net/livefixture/612541/{gw.Id}/{f.Id}|[more info]>" : string.Empty)}"));
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

        private JsonResult JsonWaiverBasic(bool scores = false)
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

        private JsonResult JsonNominate(SlashCommandRequest payload)
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
                match = fplBase.elements.First(e => e.safe_web_name.ToLower() == matchOn.ToLower());

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
                if (match != null)
                {
                    return OpenNominationDialogRequest("https://slack.com/api/views.open", payload.trigger_id, match);
                }
                else
                {
                    return new JsonResult(new { type = "text", text = "cannot find a player with that name", response_type = "in_channel" });
                }
                //return new JsonResult("");
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
                    _draftController.UpdateDraftManager_WaiverInfo(dm);
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
            var waiverManagers = draftManagers.Where(dm => dm.waiver_order <= nominator.waiver_order).OrderBy(dm => dm.waiver_order);

            // get the player ->
            var player = _fplController.Get().Value.elements.First(e => e.id == player_id);


            // if all checks out, create a nomination and inform the user!!!

            return GetNominatedJson(player, payload.user.id, waiverManagers);
        }

        private JsonResult OpenNominationDialogRequest(string url, string trigger_id, Element match)
        {
            var httpWebRequest = (HttpWebRequest)WebRequest.Create(url);
            httpWebRequest.PreAuthenticate = true;
            httpWebRequest.Headers.Add("Authorization", "Bearer xoxb-1296646167922-1297674912434-FkWYjTCnrQve43xwAgwAoqnA");
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
                return new JsonResult(new { type = "text", text = "You opened up a nomination window :eyes:", response_type = "in_channel" });
            }
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
                            text = $":rotating_light: *NEW NOMINATION* - <@{user_id}> has nominated {player.first_name} {player.web_name} of {player.club.name} ({player.position.singular_name}):" + Environment.NewLine + Environment.NewLine +
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
    }

    public class SlackClient
    {
        private readonly Uri _uri;
        private readonly Encoding _encoding = new UTF8Encoding();

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

        public void PostThreadMessage(string text, string thread_id, string username = null, string channel = null)
        {
            PostThreadPayload payload = new PostThreadPayload()
            {
                Channel = channel,
                Username = username,
                Text = text,
                thread_ts = thread_id
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

        public void PostBlockMessage(string text, string username = null, string channel = null)
        {
            PostPayload payload = new PostPayload()
            {
                Channel = channel,
                Username = username,
                Blocks = text
            };

            PostMessage(payload);
        }

        //Post a message using a Payload object
        public void PostMessage(PostPayload payload, string response_url = null)
        {
            string payloadJson = JsonConvert.SerializeObject(payload);

            using (WebClient client = new WebClient())
            {
                NameValueCollection data = new NameValueCollection();
                data["payload"] = payloadJson;

                var response = client.UploadValues((!string.IsNullOrEmpty(response_url) ? new Uri(response_url) : _uri), "POST", data);

                //The response text is usually "ok"
                string responseText = _encoding.GetString(response);
            }
        }
    }
}
