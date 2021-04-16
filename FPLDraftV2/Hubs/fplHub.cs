﻿using FPLV2Core.Models.FPLDraft;
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

        public async Task UpdatePick(DraftManagerPick pick)
        {
            await Clients.Others.SendAsync("updatePick", pick);
        }
    }
}