using FPLV2Core.Database.DraftDB;
using FPLV2Core.Models.FPLDraft;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FPLDraftV2.Controllers.FPL
{
    [Route("api/draft")]
    [ApiController]
    public class DraftController
    {
        private readonly int league_id = 13;

        [HttpGet]
        public ActionResult<Draft> Get()
        {
            var draft = DraftDB.GetDraft();
            draft.draft_managers = DraftDB.GetDraftManagers(draft.id);
            draft.draft_manager_picks = DraftDB.GetDraftManagerPicks(draft.id);
            return draft;
        }

        [HttpGet]
        [Route("{draft_id:int}")]
        public ActionResult<Draft> Get(int draft_id)
        {
            var draft = DraftDB.GetDraft(draft_id);
            draft.draft_managers = DraftDB.GetDraftManagers(draft_id);
            draft.draft_manager_picks = DraftDB.GetDraftManagerPicks(draft_id);
            return draft;
        }

        [HttpGet("favourites/{draft_manager_id}")]
        public ActionResult<IEnumerable<DraftManagerFavourite>> GetFavourites(int draft_manager_id)
        {
            return DraftDB.GetDraftManagerFavourites(draft_manager_id);
        }
        [HttpPost("savePick")]
        public DraftManagerPick SavePick(DraftManagerPick pick)
        {
            return DraftDB.SavePick(pick);
        }
        [HttpPost("updatePick")]
        public DraftManagerPick UpdatePick(DraftManagerPick pick)
        {
            return DraftDB.UpdatePick(pick);
        }
        [HttpPost("updateDraft")]
        public Draft UpdateDraft([FromBody] Draft draft)
        {
            return DraftDB.UpdateDraft(draft);
        }
        [HttpPost("setFavourite")]
        public void SetFavourite([FromBody] DraftManagerFavourite favourite)
        {
            DraftDB.SetFavourite(favourite);
        }
        [HttpPost("unsetFavourite")]
        public void UnsetFavourite([FromBody] DraftManagerFavourite favourite)
        {
            DraftDB.UnsetFavourite(favourite);
        }

        [HttpGet("active_nomination")]
        public ActionResult<Nomination> GetMostRecentActiveNomination()
        {
            return DraftDB.GetMostRecentActiveNomination();
        }

        [HttpGet("current_nomination/{nomination_id}")]
        public ActionResult<Nomination> GetActiveNominationByPlayerId(int player_id)
        {
            return DraftDB.GetActiveNominationByPlayerID(player_id);
        }

        [HttpPost("nominatePlayer/{nomination}")]
        public void NominatePlayer(Nomination nomination)
        {
            DraftDB.NominatePlayer(nomination);
        }

        [HttpGet("draft_managers")]
        public ActionResult<IEnumerable<DraftManager>> GetDraftManagers()
        {
            return DraftDB.GetDraftManagers(league_id);
        }

        [HttpPost("updateDraftManagerWaiverInfo")]
        public void UpdateDraftManagerWaiverInfo(DraftManager dm)
        {
            DraftDB.UpdateDraftManagerWaiverInfo(dm);
        }

        [HttpGet("updatePickPlayerInfo")]
        public ActionResult<bool> UpdatePickPlayerInfo()
        {
            var fplPlayers = new FPLController().Get().Value.elements;
            var picks = DraftDB.GetDraftManagerPicks(league_id);
            picks.ForEach(pick =>
            {
                var matchPlayer = fplPlayers.FirstOrDefault(player => player.id == pick.player_id);
                if (matchPlayer != null)
                {
                    pick.player_name = matchPlayer.web_name;
                    pick.current_points = matchPlayer.total_points;
                    DraftDB.UpdatePick(pick);
                }
            });

            return true;
        }
    }
}
