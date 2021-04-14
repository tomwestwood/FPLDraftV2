import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { HomeComponent } from './home/home.component';
import { FavouritelistComponent } from './favouritelist/favouritelist.component';
import { DraftComponent } from './draft/draft.component';
import { ConfirmPlayerComponent } from './controls/confirm-player/confirm-player.component';
import { TerminalComponent } from './terminal/terminal.component';
import { TerminalPlayerComponent } from './controls/terminal-player/terminal-player.component';
import { PreviewSquadComponent } from './controls/preview-squad/preview-squad.component';
import { LiveFixtureComponent } from './live/fixture/liveFixture.component';

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

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    FavouritelistComponent,
    DraftComponent,
    TerminalPlayerComponent,
    ConfirmPlayerComponent,
    TerminalComponent,
    PreviewSquadComponent,
    LiveFixtureComponent,

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
      { path: 'favouritelist', component: FavouritelistComponent },
      { path: 'draft', component: DraftComponent },
      { path: 'terminal', component: TerminalComponent },
      { path: 'livefixture/:leagueId/:gameweekId/:id', component: LiveFixtureComponent },
      { path: 'fancast', component: FancastDraftComponent },
      { path: 'fancastterminal', component: FancastTerminalComponent },
      { path: 'fancastreview', component: FancastReviewComponent }
    ]),
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
