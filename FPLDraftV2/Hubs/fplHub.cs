using FPLV2Core.Models.FPLDraft;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FPLDraftV2.Hubs
{
    public class fplHub: Hub
    {
        public async Task UpdateDraft(Draft draft)
        {
            await Clients.Others.SendAsync("updateDraft", draft);
        }

        public async Task UpdateDraftStatus(DraftStatus status)
        {
            await Clients.Others.SendAsync("updateDraftStatus", status);
        }

        public async Task UpdateDraftDirection(bool direction)
        {
            await Clients.Others.SendAsync("updateDraftDirection", direction);
        }

        public async Task UpdateDraftRound(int round)
        {
            await Clients.Others.SendAsync("updateDraftRound", round);
        }

        public async Task UpdateDraftManager(DraftManager draftManager)
        {
            await Clients.Others.SendAsync("updateDraftManager", draftManager);
        }

        public async Task UpdatePick(DraftManagerPick pick)
        {
            await Clients.Others.SendAsync("updatePick", pick);
        }
    }
}
