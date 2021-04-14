"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FancastFunctions = void 0;
var draft_1 = require("../../models/draft");
var fancast_player_1 = require("./fancast-player");
var fancast_draft_squad_1 = require("./fancast_draft_squad");
var FancastFunctions = /** @class */ (function () {
    function FancastFunctions() {
    }
    FancastFunctions.getDraftSquadForManager = function (manager) {
        var squad = new fancast_draft_squad_1.FancastDraftSquad();
        if (manager.draft_manager_picks) {
            var ordered_picks = [];
            manager.draft_manager_picks.filter(function (dmp) { return dmp.fancast_player.position == "GK"; }).forEach(function (dmp) { return ordered_picks.push(dmp); });
            manager.draft_manager_picks.filter(function (dmp) { return dmp.fancast_player.position == "DF"; }).forEach(function (dmp) { return ordered_picks.push(dmp); });
            manager.draft_manager_picks.filter(function (dmp) { return dmp.fancast_player.position == "MF"; }).forEach(function (dmp) { return ordered_picks.push(dmp); });
            manager.draft_manager_picks.filter(function (dmp) { return dmp.fancast_player.position == "FW"; }).forEach(function (dmp) { return ordered_picks.push(dmp); });
            if (ordered_picks[0])
                squad.player_1 = ordered_picks[0].fancast_player;
            if (ordered_picks[1])
                squad.player_2 = ordered_picks[1].fancast_player;
            if (ordered_picks[2])
                squad.player_3 = ordered_picks[2].fancast_player;
            if (ordered_picks[3])
                squad.player_4 = ordered_picks[3].fancast_player;
            if (ordered_picks[4])
                squad.player_5 = ordered_picks[4].fancast_player;
            if (ordered_picks[5])
                squad.player_6 = ordered_picks[5].fancast_player;
            if (ordered_picks[6])
                squad.player_7 = ordered_picks[6].fancast_player;
            if (ordered_picks[7])
                squad.player_8 = ordered_picks[7].fancast_player;
            if (ordered_picks[8])
                squad.player_9 = ordered_picks[8].fancast_player;
            if (ordered_picks[9])
                squad.player_10 = ordered_picks[9].fancast_player;
            if (ordered_picks[10])
                squad.player_11 = ordered_picks[10].fancast_player;
        }
        return squad;
    };
    FancastFunctions.getBasicDraftObject = function (draft) {
        var basicDraft = new draft_1.Draft();
        basicDraft.id = draft.id;
        basicDraft.direction = draft.direction;
        basicDraft.draft_manager_id = draft.draft_manager_id;
        basicDraft.draft_name = draft.draft_name;
        basicDraft.passcode = draft.passcode;
        basicDraft.status_id = draft.status_id;
        var basicManager = new draft_1.DraftManager();
        basicManager.id = draft.draft_manager.id;
        basicManager.draft_id = draft.id;
        basicManager.draft_seed = draft.draft_manager.draft_seed;
        basicManager.name = draft.draft_manager.name;
        basicManager.team_name = draft.draft_manager.team_name;
        basicManager.team_nickname = draft.draft_manager.team_nickname;
        basicManager.team_image_url = draft.draft_manager.team_image_url;
        basicManager.manager_image_url = draft.draft_manager.manager_image_url;
        basicManager.team_colour_1 = draft.draft_manager.team_colour_1;
        basicManager.team_colour_2 = draft.draft_manager.team_colour_2;
        basicDraft.draft_manager = basicManager;
        return basicDraft;
    };
    FancastFunctions.getBasicDraftManagerPickObject = function (pick) {
        var basicPlayer = new fancast_player_1.FancastPlayer();
        basicPlayer.id = pick.player_id;
        basicPlayer.name = pick.fancast_player.name;
        basicPlayer.position = pick.fancast_player.position;
        basicPlayer.era = pick.fancast_player.era;
        var basicPick = new draft_1.DraftManagerPick();
        basicPick.id = pick.id;
        basicPick.player_id = pick.player_id;
        basicPick.pick_order = pick.pick_order;
        basicPick.draft_manager_id = pick.draft_manager_id;
        basicPick.fancast_player = basicPlayer;
        return basicPick;
    };
    return FancastFunctions;
}());
exports.FancastFunctions = FancastFunctions;
//# sourceMappingURL=fancast_functions.js.map