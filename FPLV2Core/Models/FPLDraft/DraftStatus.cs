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
        Timeout = 6,
        SealedBids = 7,
        CheckingBids = 8,
        BidsReceived = 9,
        FinalChance = 10,
        SigningComplete = 11,
        SigningFailed = 12
    }
}
