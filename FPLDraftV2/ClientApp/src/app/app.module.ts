import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { AdminComponent } from './admin/admin.component';
import { HomeComponent } from './home/home.component';
import { FavouritelistComponent } from './favouritelist/favouritelist.component';
import { DraftComponent } from './draft/draft.component';
import { DraftHeaderComponent } from './draft/draft-header/draft-header.component';
import { DraftSelectingComponent } from './draft/draft-selecting/draft-selecting.component';
import { ConfirmPlayerComponent } from './controls/confirm-player/confirm-player.component';
import { DraftNextManagerDialogComponent } from './draft/dialogs/draft-next-manager-dialog/draft-next-manager-dialog.component';
import { DraftNewManagerDialogComponent } from './draft/dialogs/draft-new-manager-dialog/draft-new-manager-dialog.component';
import { DraftFinalChanceDialogComponent } from './draft/dialogs/draft-final-chance-dialog/draft-final-chance-dialog.component';
import { TerminalComponent } from './terminal/terminal.component';
import { TerminalPlayerComponent } from './controls/terminal-player/terminal-player.component';
import { TerminalDraftManagersComponent } from './terminal/terminal-elements/terminal-draft-managers/terminal-draft-managers.component';
import { TerminalDraftingProgressComponent } from './terminal/terminal-elements/terminal-drafting-progress/terminal-drafting-progress.component';
import { TerminalNominationProgressComponent } from './terminal/terminal-elements/terminal-nomination-progress/terminal-nomination-progress.component';
import { TerminalSquadInfoComponent } from './terminal/terminal-elements/terminal-squad-info/terminal-squad-info.component';
import { PreviewSquadComponent } from './controls/preview-squad/preview-squad.component';
import { LiveFixtureComponent } from './live/fixture/liveFixture.component';
import { LineupComponent } from './live/lineup/lineup.component';
import { FixtureLineupsComponent } from './live/fixture-lineups/fixture-lineups.component';
import { TerminalWaitingComponent } from './terminal/terminal-waiting/terminal-waiting.component';
import { TerminalNominationComponent } from './terminal/terminal-nomination/terminal-nomination.component';
import { TerminalSigningComponent } from './terminal/terminal-signing/terminal-signing.component';
import { TerminalTimeoutComponent } from './terminal/terminal-timeout/terminal-timeout.component';

import { LeagueTableComponent } from './live/league-table/league-table.component';

// fancast:
import { FancastDraftComponent } from './fancast/draft/fancast-draft.component';
import { FancastTerminalComponent } from './fancast/terminal/fancast-terminal.component';
import { FancastReviewComponent } from './fancast/review/fancast-review.component';
import { FancastConfirmPlayerComponent } from './fancast/controls/confirm-player/fancast-confirm-player.component';
import { FancastPreviewSquadComponent } from './fancast/controls/preview-squad/fancast-preview-squad.component';
import { FancastTerminalPlayerComponent } from './fancast/controls/terminal-player/fancast-terminal-player.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatTableModule } from '@angular/material/table';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule, MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TableComponent } from './live/table/table.component';

@NgModule({
  declarations: [
    AppComponent,
    AdminComponent,
    NavMenuComponent,
    HomeComponent,
    FavouritelistComponent,
    DraftComponent,
    DraftHeaderComponent,
    DraftSelectingComponent,
    DraftNextManagerDialogComponent,
    DraftNewManagerDialogComponent,
    DraftFinalChanceDialogComponent,
    TerminalPlayerComponent,
    ConfirmPlayerComponent,
    TerminalComponent,
    TerminalDraftManagersComponent,
    TerminalDraftingProgressComponent,
    TerminalNominationProgressComponent,
    TerminalSquadInfoComponent,
    PreviewSquadComponent,
    LiveFixtureComponent,
    LineupComponent,
    FixtureLineupsComponent,
    TableComponent,
    LeagueTableComponent,
    TerminalWaitingComponent,
    TerminalNominationComponent,
    TerminalSigningComponent,
    TerminalTimeoutComponent,

    // fancast:
    FancastDraftComponent,
    FancastTerminalComponent,
    FancastReviewComponent,
    FancastConfirmPlayerComponent,
    FancastPreviewSquadComponent,
    FancastTerminalPlayerComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot([
    { path: '', component: HomeComponent, pathMatch: 'full' },
    { path: 'admin', component: AdminComponent },
    { path: 'favouritelist', component: FavouritelistComponent },
    { path: 'draft', component: DraftComponent },
    { path: 'terminal', component: TerminalComponent },
    { path: 'livefixture/:leagueId/:gameweekId/:id', component: LiveFixtureComponent },
    { path: 'livetable/:leagueId', component: TableComponent },
    { path: 'leaguetable/:leagueId', component: LeagueTableComponent },
    { path: 'livelineup/:entryId/:gameweekId', component: LineupComponent },
    { path: 'livefixturelineups/:leagueId/:gameweekId/:id', component: FixtureLineupsComponent },
    { path: 'fancast', component: FancastDraftComponent },
    { path: 'fancastterminal', component: FancastTerminalComponent },
    { path: 'fancastreview', component: FancastReviewComponent }
], { relativeLinkResolution: 'legacy' }),
    BrowserAnimationsModule,
    MatStepperModule,
    MatTableModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatInputModule,
    MatSortModule,
    MatPaginatorModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatListModule,
    MatChipsModule,
    MatProgressBarModule,
    MatDialogModule,
    MatCheckboxModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
