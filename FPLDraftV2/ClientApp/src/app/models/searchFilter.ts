export class SearchFilter {
  player_name: string = '';
  position_id: number = 0;
  club_id: number = 0;
  showFavourites: boolean = false;

  clearFilters(): void {
    this.club_id = 0;
    this.position_id = 0;
    this.player_name = '';
    this.showFavourites = false;
  }
}
