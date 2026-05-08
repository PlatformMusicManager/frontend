import { Component, inject, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PlayerService } from '../../services/player.service';
import {
  PlatformService,
  Platform,
  ApiArtist,
  ApiPlaylist,
  ApiTrack,
  ApiArtistDetails,
} from '../../services/platform.service';
import { TrackItemComponent } from '../../components/media-items/track/track-item.component';
import { PlaylistCardComponent } from '../../components/media-items/playlist-card.component';
import { rxResource } from '@angular/core/rxjs-interop';

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

  artist = signal<ApiArtist | null>(null);
  tracks = signal<ApiTrack[]>([]);
  playlists = signal<ApiPlaylist[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  private platformService = inject(PlatformService);
  private playerService = inject(PlayerService);

  artistResource = rxResource<ApiArtistDetails, { id: string; platform: Platform }>({
    params: () => ({
      id: this.id()!,
      platform: this.platform()!,
    }),
    stream: ({ params }) => this.platformService.getArtistDetails(params.id, params.platform),
  });

  // ngOnInit() {
  //   this.route.paramMap.subscribe((params) => {
  //     const id = params.get('id');
  //     const platformStr = params.get('platform');

  //     if (id && platformStr) {
  //       const platform = platformStr as Platform;
  //       this.loadArtist(id, platform);
  //     } else {
  //       this.error.set('Invalid artist parameters');
  //       this.loading.set(false);
  //     }
  //   });
  // }

  loadArtist(id: string, platform: Platform) {
    this.loading.set(true);
    this.error.set(null);

    this.platformService.getArtistDetails(id, platform).subscribe({
      next: (details) => {
        this.artist.set(details.artist);
        this.tracks.set(details.tracks);
        this.playlists.set(details.playlists);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching artist details:', err);
        this.error.set('Failed to load artist details');
        this.loading.set(false);
      },
    });
  }

  playAll() {
    const tracks = this.tracks();
    if (tracks.length > 0) {
      this.playerService.setQueue(tracks);
    }
  }

  playTrackFromList(index: number) {
    const tracks = this.tracks();
    if (tracks.length > 0) {
      this.playerService.setQueue(tracks, index);
    }
  }

  playTrack(track: ApiTrack) {
    this.playerService.playTrack(track);
  }
}
