using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;

namespace FPLV2Core.Models.FPL
{
    [Serializable]
    public class FPLBase
    {
        public IEnumerable<Element> elements { get; set; }
        public IEnumerable<Club> clubs { get; set; }
        public IEnumerable<Position> positions { get; set; }
        public IEnumerable<Event> events { get; set; }

        public void LinkElements()
        {
            AssignPositionsToPlayers();
            AssignClubsToPlayers();
        }

        private void AssignPositionsToPlayers()
        {
            elements.ToList().ForEach(element => element.position = positions.FirstOrDefault(position => position.id == element.element_type));
        }

        private void AssignClubsToPlayers()
        {
            elements.ToList().ForEach(element => element.club = clubs.FirstOrDefault(club => club.code == element.team_code));
        }
    }
}
