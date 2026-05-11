import { Component, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { PlayerService } from '../../services/player.service';
import { PlatformService, Platform, ApiSearchPage } from '../../services/platform.service';
import { TrackItemComponent } from '../../components/media-items/track/track-item.component';
import { PlaylistCardComponent } from '../../components/media-items/playlist-card.component';
import { ArtistCardComponent } from '../../components/media-items/artist-card.component';
import checkParamsBeforeCall from '../../utils/check-params-before-call';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TrackItemComponent,
    PlaylistCardComponent,
    ArtistCardComponent,
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent {
  query = input<string | undefined>(undefined, { alias: 'q' });

  private platformService = inject(PlatformService);
  private playerService = inject(PlayerService);
  private router = inject(Router);

  platform = toSignal(this.platformService.platform$);

  searchResource = rxResource<
    ApiSearchPage | null,
    { query: string | undefined; platform: Platform | undefined }
  >({
    params: () => {
      const q = this.query();
      const p = this.platform();
      if ((!q || !p) && this.platformService.lastPerformedSearch) {
        this.router.navigate(['/search'], {
          queryParams: {
            q: this.platformService.lastPerformedSearch.query,
          },
        });
        return { query: this.platformService.lastPerformedSearch.query, platform: p };
      }
      return { query: q, platform: p };
    },
    stream: ({ params }) =>
      checkParamsBeforeCall(
        this.platformService.search.bind(this.platformService),
        params.query,
        params.platform,
      ),
  });

  get searchResults() {
    return this.searchResource.value;
  }

  get isLoading() {
    return this.searchResource.isLoading;
  }

  playTrack(index: number) {
    const results = this.searchResults();
    if (results?.tracks) {
      this.playerService.setQueue(results.tracks, index);
    }
  }
}
