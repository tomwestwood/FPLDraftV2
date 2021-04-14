using System;
namespace FPLV2Core.Models.FPL
{
    [Serializable]
    public class Club
    {
        public int id { get; set; }
        public int code { get; set; }
        public string name { get; set; }
        public string short_name { get; set; }
        public string badge_url => string.Format($"http://platform-static-files.s3.amazonaws.com/premierleague/badges/t{code}.png");
    }
}
