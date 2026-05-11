import { Component, effect, inject, input } from '@angular/core';
import {
  LibraryService,
  TransformedUserPlaylist,
  TransformedTrackInPlaylist,
  TransformedTrackInPlaylistFullData,
} from '../../services/library.service';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { concat, concatMap, delay, from, of, scan, switchMap } from 'rxjs';
import checkParamsBeforeCall from '../../utils/check-params-before-call';
import { ToastService } from '../../services/toast.service';
import { Platform } from '../../services/platform.service';
import { PlayerService } from '../../services/player.service';
import { TrackItemComponent } from '../../components/media-items/track/track-item.component';
import { PlaylistHeaderComponent } from '../../sections/playlist-header/playlist-header.component';
import { PlaylistControlsComponent } from '../../sections/playlist-controls/playlist-controls.component';

@Component({
  selector: 'app-user-playlist',
  imports: [TrackItemComponent, PlaylistHeaderComponent, PlaylistControlsComponent],
  templateUrl: './user-playlist.component.html',
  styleUrl: './user-playlist.component.css',
})
export class UserPlaylistComponent {
  id = input<string | undefined>();

  protected readonly Platform = Platform;

  private libraryService = inject(LibraryService);
  private toastService = inject(ToastService);
  private playerService = inject(PlayerService);

  constructor() {
    effect(() => {
      const error = this.error();
      if (error) {
        this.toastService.show(error.message || 'Failed to load playlist', 'error');
      }
    });
  }

  playlistResource = rxResource<TransformedUserPlaylist, { id: string | undefined }>({
    params: () => ({ id: this.id() }),
    stream: ({ params }) =>
      checkParamsBeforeCall((id: string) => this.libraryService.getUserPlaylist(+id), params.id),
  });

  playlist = toSignal(
    toObservable(this.playlistResource.value).pipe(
      switchMap((playlist) => {
        if (!playlist) return of(null);

        const partialTracks = playlist.tracks.filter(
          (t): t is TransformedTrackInPlaylist => t.type === 'partial',
        );

        if (partialTracks.length === 0) return of(playlist);

        const enriched$ = from(partialTracks).pipe(
          concatMap((track) => this.libraryService.getFullTrack(track).pipe(delay(500))),
          scan(
            (acc, fullTrack) => ({
              ...acc,
              tracks: acc.tracks.map((t) =>
                t.track_in_playlist_id === fullTrack.track_in_playlist_id ? fullTrack : t,
              ),
            }),
            playlist,
          ),
        );

        return concat(of(playlist), enriched$);
      }),
    ),
    { initialValue: null },
  );

  isLoading = this.playlistResource.isLoading;
  error = this.playlistResource.error;

  playPlaylist() {
    const data = this.playlist();
    if (!data) return;
    const fullTracks = data.tracks.filter(
      (t): t is TransformedTrackInPlaylistFullData => t.type === 'full',
    );
    if (fullTracks.length > 0) {
      this.playerService.setQueue(fullTracks, 0);
    }
  }
}
