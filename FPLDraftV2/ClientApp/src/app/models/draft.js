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
        this.bid_eligible = true;
        this.is_max_bid = false;
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
        basicManager.team_fpl_id = draft.draft_manager.team_fpl_id;
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
        basicPick.player_name = pick.player_name;
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
        var _a, _b;
        if (manager && draft.draft_manager_picks) {
            manager.draft_manager_picks = (_b = (_a = draft.draft_manager_picks) === null || _a === void 0 ? void 0 : _a.filter(function (dmp) { return dmp.draft_manager_id == manager.id; })) !== null && _b !== void 0 ? _b : [];
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
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        var squad = new DraftSquad();
        if (manager === null || manager === void 0 ? void 0 : manager.draft_manager_picks) {
            squad.gk_1 = (_a = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 1; })[0]) !== null && _a !== void 0 ? _a : undefined;
            squad.gk_2 = (_b = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 1; })[1]) !== null && _b !== void 0 ? _b : undefined;
            squad.def_1 = (_c = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 2; })[0]) !== null && _c !== void 0 ? _c : undefined;
            squad.def_2 = (_d = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 2; })[1]) !== null && _d !== void 0 ? _d : undefined;
            squad.def_3 = (_e = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 2; })[2]) !== null && _e !== void 0 ? _e : undefined;
            squad.def_4 = (_f = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 2; })[3]) !== null && _f !== void 0 ? _f : undefined;
            squad.def_5 = (_g = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 2; })[4]) !== null && _g !== void 0 ? _g : undefined;
            squad.mid_1 = (_h = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 3; })[0]) !== null && _h !== void 0 ? _h : undefined;
            squad.mid_2 = (_j = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 3; })[1]) !== null && _j !== void 0 ? _j : undefined;
            squad.mid_3 = (_k = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 3; })[2]) !== null && _k !== void 0 ? _k : undefined;
            squad.mid_4 = (_l = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 3; })[3]) !== null && _l !== void 0 ? _l : undefined;
            squad.mid_5 = (_m = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 3; })[4]) !== null && _m !== void 0 ? _m : undefined;
            squad.fw_1 = (_o = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 4; })[0]) !== null && _o !== void 0 ? _o : undefined;
            squad.fw_2 = (_p = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 4; })[1]) !== null && _p !== void 0 ? _p : undefined;
            squad.fw_3 = (_q = manager.draft_manager_picks.filter(function (pick) { return pick.player.position.id == 4; })[2]) !== null && _q !== void 0 ? _q : undefined;
            squad.num_of_picks = manager.draft_manager_picks.length;
            squad.budget_spent = manager.draft_manager_picks.reduce(function (sum, current) { return sum + current.signed_price; }, 0);
            squad.budget_remaining = 100 - squad.budget_spent;
            squad.budget_per_player = squad.budget_remaining / (15 - squad.num_of_picks);
        }
        else {
            squad.num_of_picks = 0;
            squad.budget_spent = 0;
            squad.budget_remaining = 100;
            squad.budget_per_player = 100 / 15;
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