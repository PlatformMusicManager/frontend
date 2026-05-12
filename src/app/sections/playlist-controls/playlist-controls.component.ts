import { Component, computed, EventEmitter, inject, input, Output } from '@angular/core';
import { SearchComponent } from '../../components/search/search.component';
import { ApiPlaylist } from '../../services/platform.service';
import { TransformedUserPlaylist } from '../../services/library.service';
import { PlayerService } from '../../services/player.service';
import { RoundHoverableButtonComponent } from '../../components/round-hoverable-button/round-hoverable-button.component';

@Component({
  selector: 'app-playlist-controls',
  imports: [SearchComponent, RoundHoverableButtonComponent],
  templateUrl: './playlist-controls.component.html',
  styleUrl: './playlist-controls.component.css',
})
export class PlaylistControlsComponent {
  private playerService = inject(PlayerService);

  playlist = input.required<
    (ApiPlaylist & { type: 'api' }) | (TransformedUserPlaylist & { type: 'user' })
  >();

  loadedTracks = computed(() => {
    const playlist = this.playlist();
    if (playlist.type === 'api') {
      return playlist.tracks;
    }
    return playlist.tracks.filter((t) => t.type === 'full');
  });

  playPlaylist() {
    const tracks = this.loadedTracks();
    // TypeScript now knows 'data' is ApiPlaylist because of the generic above
    if (tracks && tracks.length > 0) {
      this.playerService.setQueue(tracks, 0);
    }
  }

  playShuffle() {
    const tracks = this.loadedTracks();
    if (tracks && tracks.length > 0) {
      this.playerService.setQueue(tracks, null, true);
    }
  }
}
