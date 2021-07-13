"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchFilter = void 0;
var SearchFilter = /** @class */ (function () {
    function SearchFilter() {
        this.player_name = '';
        this.position_id = 0;
        this.club_id = 0;
        this.showFavourites = false;
    }
    SearchFilter.prototype.clearFilters = function () {
        this.club_id = 0;
        this.position_id = 0;
        this.player_name = '';
        this.showFavourites = false;
    };
    return SearchFilter;
}());
exports.SearchFilter = SearchFilter;
//# sourceMappingURL=searchFilter.js.map