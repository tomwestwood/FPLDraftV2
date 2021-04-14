using System;
namespace FPLV2Core.Models.FPL
{
    [Serializable]
    public class Position
    {
        public int id { get; set; }
        public string singular_name { get; set; }
        public string singular_name_short { get; set; }
        public string plural_name { get; set; }
    }
}
