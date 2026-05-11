import { Component, effect, inject, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerService } from '../../services/player.service';
import {
  PlatformService,
  Platform,
  ApiTrack,
  ApiArtistDetails,
} from '../../services/platform.service';
import { TrackItemComponent } from '../../components/media-items/track/track-item.component';
import { PlaylistCardComponent } from '../../components/media-items/playlist-card.component';
import { rxResource } from '@angular/core/rxjs-interop';
import checkParamsBeforeCall from '../../utils/check-params-before-call';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-artist',
  standalone: true,
  imports: [CommonModule, TrackItemComponent, PlaylistCardComponent],
  templateUrl: './artist.component.html',
  styleUrl: './artist.component.css',
})
export class ArtistComponent {
  // route params
  id = input<string | undefined>();
  platform = input<Platform | undefined>();

  private platformService = inject(PlatformService);
  private playerService = inject(PlayerService);
  private toastService = inject(ToastService);

  constructor() {
    effect(() => {
      const error = this.error();
      if (error) {
        this.toastService.show(error.message || 'Failed to load artist', 'error');
      }
    });
  }

  artistResource = rxResource<
    ApiArtistDetails,
    { id: string | undefined; platform: Platform | undefined }
  >({
    params: () => ({
      id: this.id(),
      platform: this.platform(),
    }),
    stream: ({ params }) =>
      checkParamsBeforeCall(
        this.platformService.getArtistDetails.bind(this.platformService),
        params.id,
        params.platform,
      ),
  });

  artist = this.artistResource.value;
  isLoading = this.artistResource.isLoading;
  error = this.artistResource.error;

  playAll() {
    const tracks = this.artist()?.tracks;
    if (tracks && tracks.length > 0) {
      this.playerService.setQueue(tracks);
    }
  }

  playTrackFromList(index: number) {
    const tracks = this.artist()?.tracks;
    if (tracks && tracks.length > 0) {
      this.playerService.setQueue(tracks, index);
    }
  }

  playTrack(track: ApiTrack) {
    this.playerService.playTrack(track);
  }
}
