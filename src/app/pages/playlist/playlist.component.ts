import { Component, inject, input, effect } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { PlayerService } from '../../services/player.service';
import { PlatformService, Platform, ApiPlaylist } from '../../services/platform.service'; // Added ApiPlaylist import
import { TrackItemComponent } from '../../components/media-items/track/track-item.component';
import { PlaylistHeaderComponent } from '../../sections/playlist-header/playlist-header.component';
import { ToastService } from '../../services/toast.service';
import checkParamsBeforeCall from '../../utils/check-params-before-call';
import { PlaylistControlsComponent } from '../../sections/playlist-controls/playlist-controls.component';

@Component({
  selector: 'app-playlist',
  standalone: true,
  imports: [TrackItemComponent, PlaylistHeaderComponent, PlaylistControlsComponent],
  templateUrl: './playlist.component.html',
  styleUrl: './playlist.component.css',
})
export class PlaylistComponent {
  // Use specific types for inputs to help the Resource
  id = input<string | undefined>();
  platform = input<Platform | undefined>();

  private playerService = inject(PlayerService);
  private platformService = inject(PlatformService);
  private toastService = inject(ToastService);

  constructor() {
    effect(() => {
      const error = this.error();
      // Показываем тост только если ошибка реально существует
      if (error) {
        this.toastService.show(error.message || 'Failed to load playlist', 'error');
      }
    });
  }

  // Explicitly type the Resource <ValueType, RequestType>
  playlistResource = rxResource<
    ApiPlaylist,
    { id: string | undefined; platform: Platform | undefined }
  >({
    params: () => ({
      id: this.id(),
      platform: this.platform(),
    }),
    stream: ({ params }) =>
      checkParamsBeforeCall(
        this.platformService.getPlaylist.bind(this.platformService),
        params.id,
        params.platform,
      ),
  });

  // Derived signals
  playlist = this.playlistResource.value;
  isLoading = this.playlistResource.isLoading;
  error = this.playlistResource.error;
}
