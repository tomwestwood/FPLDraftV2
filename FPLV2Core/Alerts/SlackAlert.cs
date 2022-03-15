using FPLV2Core.Alerts.Interfaces;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Net;
using System.Text;

namespace FPLV2Core.Alerts
{
    public class SlackAlert : IAlert
    {
        public SlackClient _slackClient;

        private const string _slackWebhookBase = "https://hooks.slack.com/services/T018QK04XT4/B01UK6E178S/";

        // debug:
        //private const string _slackClientConnection = "IIwG0K4dbK8Mf45UDenr6AWo";
        // live:
        private const string _slackClientConnection = "1WYfXPBp6JdtixZZ1cvH60BR";


        public SlackAlert()
        {
            _slackClient = new SlackClient($"{_slackWebhookBase}{_slackClientConnection}");
        }

        public void MessageAlert(string content, ILogger logger)
        {
            _slackClient.PostMessage(content);
            logger.Log(content);
        }

        public void ImageMessageAlert(string content, string imageUrl, ILogger logger)
        {
            var json = new[]
            {
                new
                {
                    type = "section",
                    text = new
                    {
                        type = "mrkdwn",
                        text = content
                    },
                    accessory = new
                    {
                        type = "image",
                        image_url = imageUrl,
                        alt_text = "slack image"
                    }
                }
            };

            _slackClient.PostBlockMessage(JsonConvert.SerializeObject(json));

            logger.Log(content);
        }

        public void ImageAlert(string imageUrl, ILogger logger)
        {
            var json = new[]
            {
                new
                {
                    type = "section",
                    attachments = new []
                    {
                        new { imageUrl = "C://ss//5334385.png" }
                    }
                }
            };

            _slackClient.PostImage(JsonConvert.SerializeObject(json));

            //logger.Log(content);
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
            Payload payload = new Payload()
            {
                Channel = channel,
                Username = username,
                Text = text
            };

            PostMessage(payload);
        }

        public void PostBlockMessage(string text, string username = null, string channel = null)
        {
            Payload payload = new Payload()
            {
                Channel = channel,
                Username = username,
                Blocks = text
            };

            PostMessage(payload);
        }

        //Post a message using a Payload object
        public void PostMessage(Payload payload)
        {
            string payloadJson = JsonConvert.SerializeObject(payload);

            using (WebClient client = new WebClient())
            {
                NameValueCollection data = new NameValueCollection();
                data["payload"] = payloadJson;

                var response = client.UploadValues(_uri, "POST", data);

                //The response text is usually "ok"
                string responseText = _encoding.GetString(response);
            }
        }

        public void PostImage(string imgUrl, string username = null, string channel = null)
        {
            Payload payload = new Payload()
            {
                Channel = channel,
                Username = username,
                Attachment = new SlackAttachment()
                {
                    Fallback = "cannot be found...",
                    Text = "Fixture...",
                    Image_Url = "https://wv1draft.azurewebsites.net/livefixturelineups/429551/11/5334347"
                }
            };
        }
    }

    public class Payload
    {
        [JsonProperty("channel")]
        public string Channel { get; set; }

        [JsonProperty("username")]
        public string Username { get; set; }

        [JsonProperty("text")]
        public string Text { get; set; }

        [JsonProperty("blocks")]
        public string Blocks { get; set; }

        [JsonProperty("attachment")]
        public SlackAttachment Attachment { get; set; }
    }

    public class SlackAttachment
    {
        [JsonProperty("fallback")]
        public string Fallback { get; set; }
        [JsonProperty("text")]
        public string Text { get; set; }
        [JsonProperty("image_url")]
        public string Image_Url { get; set; }
    }

    public class SlackCommandRequest
    {
        public string Token { get; set; }

        [JsonProperty("team_id")]
        public string TeamId { get; set; }

        [JsonProperty("team_domain")]
        public string TeamDomain { get; set; }

        [JsonProperty("enterprise_id")]
        public string EnterpriseId { get; set; }

        [JsonProperty("enterprise_name")]
        public string EnterpriseName { get; set; }

        [JsonProperty("channel_id")]
        public string ChannelId { get; set; }

        [JsonProperty("channel_name")]
        public string channel_name { get; set; }

        [JsonProperty("user_id")]
        public string UserId { get; set; }

        [JsonProperty("user_name")]
        public string user_name { get; set; }

        public string Command { get; set; }

        public string Text { get; set; }

        [JsonProperty("response_url")]
        public string ResponseUrl { get; set; }

        [JsonProperty("trigger_id")]
        public string TriggerId { get; set; }
    }
}
