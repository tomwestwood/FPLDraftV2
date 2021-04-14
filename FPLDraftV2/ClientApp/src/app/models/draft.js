"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DraftFunctions = exports.FancastSquadTicker = exports.SquadTicker = exports.DraftSquad = exports.DraftManagerFavourite = exports.DraftManagerPick = exports.DraftManager = exports.Draft = void 0;
var fpl_1 = require("./fpl");
var Draft = /** @class */ (function () {
    function Draft() {
    }
    return Draft;
}());
exports.Draft = Draft;
var DraftManager = /** @class */ (function () {
    function DraftManager() {
    }
    return DraftManager;
}());
exports.DraftManager = DraftManager;
var DraftManagerPick = /** @class */ (function () {
    function DraftManagerPick() {
    }
    return DraftManagerPick;
}());
exports.DraftManagerPick = DraftManagerPick;
var DraftManagerFavourite = /** @class */ (function () {
    function DraftManagerFavourite() {
    }
    return DraftManagerFavourite;
}());
exports.DraftManagerFavourite = DraftManagerFavourite;
var DraftSquad = /** @class */ (function () {
    function DraftSquad() {
    }
    return DraftSquad;
}());
exports.DraftSquad = DraftSquad;
var SquadTicker = /** @class */ (function () {
    function SquadTicker() {
        this.ticker_direction = false;
    }
    return SquadTicker;
}());
exports.SquadTicker = SquadTicker;
var FancastSquadTicker = /** @class */ (function () {
    function FancastSquadTicker() {
        this.ticker_direction = false;
    }
    return FancastSquadTicker;
}());
exports.FancastSquadTicker = FancastSquadTicker;
var DraftFunctions = /** @class */ (function () {
    function DraftFunctions() {
    }
    DraftFunctions.getBasicDraftObject = function (draft) {
        var basicDraft = new Draft();
        basicDraft.id = draft.id;
        basicDraft.direction = draft.direction;
        basicDraft.draft_manager_id = draft.draft_manager_id;
        basicDraft.draft_name = draft.draft_name;
        basicDraft.passcode = draft.passcode;
        basicDraft.status_id = draft.status_id;
        var basicManager = new DraftManager();
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
    DraftFunctions.getBasicDraftManagerPickObject = function (pick) {
        var basicClub = new fpl_1.Club();
        basicClub.id = pick.player.club.id;
        basicClub.code = pick.player.club.code;
        basicClub.name = pick.player.club.name;
        basicClub.badge_url = pick.player.club.badge_url;
        var basicPlayer = new fpl_1.Player();
        basicPlayer.id = pick.player_id;
        basicPlayer.name = pick.player.name;
        basicPlayer.first_name = pick.player.first_name;
        basicPlayer.web_name = pick.player.web_name;
        basicPlayer.position = pick.player.position;
        basicPlayer.club = pick.player.club;
        basicPlayer.photo_url = pick.player.photo_url;
        basicPlayer.now_cost = pick.player.now_cost;
        basicPlayer.photo_url = pick.player.photo_url;
        basicPlayer.code = pick.player.code;
        var basicPick = new DraftManagerPick();
        basicPick.id = pick.id;
        basicPick.player_id = pick.player_id;
        basicPick.pick_order = pick.pick_order;
        basicPick.draft_manager_id = pick.draft_manager_id;
        basicPick.player = basicPlayer;
        basicPick.player.club = basicClub;
        return basicPick;
    };
    DraftFunctions.getDraftSquadForManager = function (manager) {
        var squad = new DraftSquad();
        if (manager.draft_manager_picks) {
            if (manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 1; })[0])
                squad.gk_1 = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 1; })[0].player;
            if (manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 1; })[1])
                squad.gk_2 = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 1; })[1].player;
            if (manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 2; })[0])
                squad.def_1 = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 2; })[0].player;
            if (manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 2; })[1])
                squad.def_2 = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 2; })[1].player;
            if (manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 2; })[2])
                squad.def_3 = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 2; })[2].player;
            if (manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 2; })[3])
                squad.def_4 = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 2; })[3].player;
            if (manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 2; })[4])
                squad.def_5 = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 2; })[4].player;
            if (manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 3; })[0])
                squad.mid_1 = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 3; })[0].player;
            if (manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 3; })[1])
                squad.mid_2 = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 3; })[1].player;
            if (manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 3; })[2])
                squad.mid_3 = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 3; })[2].player;
            if (manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 3; })[3])
                squad.mid_4 = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 3; })[3].player;
            if (manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 3; })[4])
                squad.mid_5 = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 3; })[4].player;
            if (manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 4; })[0])
                squad.fw_1 = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 4; })[0].player;
            if (manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 4; })[1])
                squad.fw_2 = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 4; })[1].player;
            if (manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 4; })[2])
                squad.fw_3 = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 4; })[2].player;
        }
        return squad;
    };
    return DraftFunctions;
}());
exports.DraftFunctions = DraftFunctions;
//# sourceMappingURL=draft.js.map