using System;
namespace FPLV2Core.Models.FPLDraft
{
    public enum DraftStatus: int
    {
        NotStarted = 1,
        Waiting = 2,
        PreDraft = 3,
        Drafting = 4,
        DraftingComplete = 5,
        TIMEOUT = 6
    }
}
