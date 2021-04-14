using FPLV2Core.Tools;
using System;

namespace FPLV2Core.Models.FPL
{
    [Serializable]
    public class Element
    {
        public int id { get; set; }
        public int code { get; set; }
        public string web_name { get; set; }
        public string safe_web_name => StringTools.RemoveUnsafeCharacters(web_name);
        public string first_name { get; set; }
        public string second_name { get; set; }
        public string squad_number { get; set; }
        public decimal now_cost { get; set; }
        public int total_points { get; set; }
        public string photo_url => code == -1 ? $"https://resources.premierleague.com/premierleague/badges/70/t{club?.code}.png" : $"https://resources.premierleague.com/premierleague/photos/players/250x250/p{code}.png";

        // club
        public int team_code { get; set; }
        public Club club { get; set; }
        public string club_name => club?.name ?? string.Empty;

        // position
        public int element_type { get; set; }
        public Position position { get; set; }
        public string position_name_short => position?.singular_name_short ?? string.Empty;
    }
}
