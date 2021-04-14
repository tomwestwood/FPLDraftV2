using FPLV2Core.Tools;
using System;

namespace FPLV2Core.Models.Fancast
{
    [Serializable]
    public class FancastPlayer
    {
        public int id { get; set; }
        public string name { get; set; }
        public string position { get; set; }
        public string era { get; set; }
    }
}
