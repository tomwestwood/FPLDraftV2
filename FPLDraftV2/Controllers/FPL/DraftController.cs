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
        public bool SavePick(DraftManagerPick pick)
        {
            DraftDB.SavePick(pick);
            return true;
        }
        [HttpPost("updateDraft")]
        public void UpdateDraft([FromBody] Draft draft)
        {
            DraftDB.UpdateDraft(draft);
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

        [HttpGet("current_nomination")]
        public ActionResult<Nomination> GetCurrentNomination()
        {
            return DraftDB.GetCurrentNomination();
        }
        [HttpPost("createNominationLink")]
        public void CreateNominationLink()
        {
            DraftDB.CreateNominationLink();
        }
        [HttpPost("nominatePlayer/{nomination_id}/{draft_manager_id}/{player_id}")]
        public void NominatePlayer(int nomination_id, int draft_manager_id, int player_id)
        {
            var draft_manager = DraftDB.GetDraftManagers(3).First(dm => dm.id == draft_manager_id);
            DraftDB.NominatePlayer(nomination_id, draft_manager, player_id);
        }
        //[HttpPost("yesToNomination/{nomination_id}/{draft_manager_id}")]
        //public void NominatePlayer(int nomination_id, int draft_manager_id)
        //{
        //    var draft_manager = DraftDB.GetDraftManagers(3).First(dm => dm.id == draft_manager_id);
        //    DraftDB.NominatePlayer(nomination_id, draft_manager, player_id);
        //}

        [HttpGet("draft_managers")]
        public ActionResult<IEnumerable<DraftManager>> GetDraftManagers()
        {
            return DraftDB.GetDraftManagers(3);
        }

        [HttpPost("updateDraftManagerWaiverInfo")]
        public void UpdateDraftManager_WaiverInfo([FromBody] DraftManager dm)
        {
            //DraftDB.(dm);
        }

        [HttpGet("updatePickPlayerInfo")]
        public ActionResult<bool> UpdatePickPlayerInfo()
        {
            var fplPlayers = new FPLController().Get().Value.elements;
            var picks = DraftDB.GetDraftManagerPicks(3); // our league
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
