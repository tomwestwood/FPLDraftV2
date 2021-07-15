"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DraftFunctions = exports.FancastSquadTicker = exports.RoundPicks = exports.SquadTicker = exports.DraftSquad = exports.DraftManagerFavourite = exports.SealedBid = exports.DraftManagerPick = exports.DraftManager = exports.Draft = exports.DraftStatuses = void 0;
var fpl_1 = require("./fpl");
var DraftStatuses;
(function (DraftStatuses) {
    DraftStatuses[DraftStatuses["NotStarted"] = 1] = "NotStarted";
    DraftStatuses[DraftStatuses["Waiting"] = 2] = "Waiting";
    DraftStatuses[DraftStatuses["PreDraft"] = 3] = "PreDraft";
    DraftStatuses[DraftStatuses["Drafting"] = 4] = "Drafting";
    DraftStatuses[DraftStatuses["DraftingComplete"] = 5] = "DraftingComplete";
    DraftStatuses[DraftStatuses["Timeout"] = 6] = "Timeout";
    DraftStatuses[DraftStatuses["SealedBids"] = 7] = "SealedBids";
    DraftStatuses[DraftStatuses["CheckingBids"] = 8] = "CheckingBids";
    DraftStatuses[DraftStatuses["BidsReceived"] = 9] = "BidsReceived";
    DraftStatuses[DraftStatuses["FinalChance"] = 10] = "FinalChance";
    DraftStatuses[DraftStatuses["SigningComplete"] = 11] = "SigningComplete";
    DraftStatuses[DraftStatuses["SigningFailed"] = 12] = "SigningFailed";
})(DraftStatuses = exports.DraftStatuses || (exports.DraftStatuses = {}));
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
var SealedBid = /** @class */ (function () {
    function SealedBid() {
    }
    return SealedBid;
}());
exports.SealedBid = SealedBid;
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
var RoundPicks = /** @class */ (function () {
    function RoundPicks() {
    }
    return RoundPicks;
}());
exports.RoundPicks = RoundPicks;
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
        var _this = this;
        var basicDraft = new Draft();
        basicDraft.id = draft.id;
        basicDraft.direction = draft.direction;
        basicDraft.draft_manager_id = draft.draft_manager_id;
        basicDraft.draft_name = draft.draft_name;
        basicDraft.passcode = draft.passcode;
        basicDraft.status_id = draft.status_id;
        basicDraft.draft_round = draft.draft_round;
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
        basicDraft.draft_managers = [];
        draft.draft_managers.forEach(function (dm) {
            basicDraft.draft_managers.push(dm);
        });
        basicDraft.draft_manager_picks = [];
        basicDraft.draft_manager.draft_manager_picks = [];
        draft.draft_manager_picks.forEach(function (dmp) {
            basicDraft.draft_manager_picks.push(_this.getBasicDraftManagerPickObject(dmp, false));
            if (dmp.draft_manager_id == draft.draft_manager.id) {
                basicDraft.draft_manager.draft_manager_picks.push(_this.getBasicDraftManagerPickObject(dmp, false));
            }
        });
        if (draft.draft_manager.draft_squad) {
            basicDraft.draft_manager.draft_squad = draft.draft_manager.draft_squad;
        }
        else {
            basicDraft.draft_manager.draft_squad = this.getDraftSquadForManager(basicDraft.draft_manager);
        }
        return basicDraft;
    };
    DraftFunctions.getBasicDraftManagerPickObject = function (pick, includeManager) {
        var _this = this;
        var _a;
        if (includeManager === void 0) { includeManager = true; }
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
        basicPick.nominator_id = pick.nominator_id;
        basicPick.player = basicPlayer;
        basicPick.player.club = basicClub;
        basicPick.draft_id = pick.draft_id;
        basicPick.value_price = pick.value_price;
        basicPick.signed_price = pick.signed_price;
        basicPick.sealed_bids = [];
        (_a = pick.sealed_bids) === null || _a === void 0 ? void 0 : _a.forEach(function (sb) {
            basicPick.sealed_bids.push(_this.getBasicSealedBidsObject(sb));
        });
        return basicPick;
    };
    DraftFunctions.getBasicSealedBidsObject = function (sealedBid) {
        var basicSealedBid = new SealedBid();
        basicSealedBid.draft_manager_id = sealedBid.draft_manager_id;
        basicSealedBid.draft_manager_name = sealedBid.draft_manager_name;
        basicSealedBid.player_id = sealedBid.player_id;
        basicSealedBid.player_name = sealedBid.player_name;
        basicSealedBid.bid_amount = sealedBid.bid_amount;
        basicSealedBid.bid_eligible = sealedBid.bid_eligible;
        return basicSealedBid;
    };
    DraftFunctions.getDraftPicksForManager = function (manager, draft, fplBase) {
        if (draft.draft_manager_picks) {
            manager.draft_manager_picks = draft.draft_manager_picks.filter(function (dmp) { return dmp.draft_manager_id == manager.id; });
            manager.draft_manager_picks.forEach(function (dmp) {
                fplBase.elements.filter(function (e) { return e.id == dmp.player_id; }).forEach(function (e) {
                    e.draft_manager_id = manager.id;
                    //e.draft_manager = manager;
                    dmp.player = e;
                });
            });
            return manager.draft_manager_picks;
        }
        return undefined;
    };
    DraftFunctions.getDraftSquadForManager = function (manager) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5;
        var squad = new DraftSquad();
        if (manager.draft_manager_picks) {
            squad.gk_1 = (_b = (_a = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 1; })[0]) === null || _a === void 0 ? void 0 : _a.player) !== null && _b !== void 0 ? _b : undefined;
            squad.gk_2 = (_d = (_c = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 1; })[1]) === null || _c === void 0 ? void 0 : _c.player) !== null && _d !== void 0 ? _d : undefined;
            squad.def_1 = (_f = (_e = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 2; })[0]) === null || _e === void 0 ? void 0 : _e.player) !== null && _f !== void 0 ? _f : undefined;
            squad.def_2 = (_h = (_g = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 2; })[1]) === null || _g === void 0 ? void 0 : _g.player) !== null && _h !== void 0 ? _h : undefined;
            squad.def_3 = (_k = (_j = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 2; })[2]) === null || _j === void 0 ? void 0 : _j.player) !== null && _k !== void 0 ? _k : undefined;
            squad.def_4 = (_m = (_l = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 2; })[3]) === null || _l === void 0 ? void 0 : _l.player) !== null && _m !== void 0 ? _m : undefined;
            squad.def_5 = (_p = (_o = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 2; })[4]) === null || _o === void 0 ? void 0 : _o.player) !== null && _p !== void 0 ? _p : undefined;
            squad.mid_1 = (_r = (_q = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 3; })[0]) === null || _q === void 0 ? void 0 : _q.player) !== null && _r !== void 0 ? _r : undefined;
            squad.mid_2 = (_t = (_s = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 3; })[1]) === null || _s === void 0 ? void 0 : _s.player) !== null && _t !== void 0 ? _t : undefined;
            squad.mid_3 = (_v = (_u = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 3; })[2]) === null || _u === void 0 ? void 0 : _u.player) !== null && _v !== void 0 ? _v : undefined;
            squad.mid_4 = (_x = (_w = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 3; })[3]) === null || _w === void 0 ? void 0 : _w.player) !== null && _x !== void 0 ? _x : undefined;
            squad.mid_5 = (_z = (_y = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 3; })[4]) === null || _y === void 0 ? void 0 : _y.player) !== null && _z !== void 0 ? _z : undefined;
            squad.fw_1 = (_1 = (_0 = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 4; })[0]) === null || _0 === void 0 ? void 0 : _0.player) !== null && _1 !== void 0 ? _1 : undefined;
            squad.fw_2 = (_3 = (_2 = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 4; })[1]) === null || _2 === void 0 ? void 0 : _2.player) !== null && _3 !== void 0 ? _3 : undefined;
            squad.fw_3 = (_5 = (_4 = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 4; })[2]) === null || _4 === void 0 ? void 0 : _4.player) !== null && _5 !== void 0 ? _5 : undefined;
        }
        return squad;
    };
    DraftFunctions.setPlayerOwner = function (player, draftManager) {
        player.draft_manager_id = draftManager.id;
        player.draft_manager = draftManager;
    };
    DraftFunctions.convertStatusToString = function (status) {
        switch (status) {
            case 1: return 'Not started';
            case 2: return 'Waiting';
            case 3: return 'Pre-draft';
            case 4: return 'Drafting';
            case 5: return 'Drafting complete';
            case 6: return 'TIMEOUT';
            case 7: return 'Sealed bids';
            case 8: return 'Checking bids';
            case 9: return 'Bids received';
            case 10: return 'Final chance';
            case 11: return 'Signing complete';
            case 12: return 'Signing failed';
            default: return 'Unknown';
        }
    };
    DraftFunctions.convertStatusToIcon = function (status) {
        switch (status) {
            case 1: return 'play_circle_outline';
            case 2: return 'access_time';
            case 3: return 'hourglass_top';
            case 4: return 'shopping_cart';
            case 5: return 'check';
            case 6: return 'block';
            default: return 'adb';
        }
    };
    return DraftFunctions;
}());
exports.DraftFunctions = DraftFunctions;
//# sourceMappingURL=draft.js.map