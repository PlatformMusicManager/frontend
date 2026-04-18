import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PlayerService } from '../../services/player.service';
import { PlatformService, Platform, ApiPlaylist } from '../../services/platform.service';
import { TrackItemComponent } from '../../components/media-items/track-item.component';
import { switchMap, catchError, of } from 'rxjs';

@Component({
  selector: 'app-playlist',
  standalone: true,
  imports: [CommonModule, TrackItemComponent],
  templateUrl: './playlist.component.html',
  styleUrl: './playlist.component.css',
})
export class PlaylistComponent implements OnInit {
  playlist = signal<ApiPlaylist | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  private route = inject(ActivatedRoute);
  private playerService = inject(PlayerService);
  private platformService = inject(PlatformService);

  ngOnInit() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          const platform = params.get('platform');

          if (!id || !platform) return of(null);
          this.loading.set(true);

          const platformEnum = platform as Platform;

          return this.platformService.getPlaylist(id, platformEnum).pipe(
            catchError((err) => {
              console.error(err);
              this.error.set('Failed to load playlist');
              return of(null);
            }),
          );
        }),
      )
      .subscribe((result) => {
        if (result) {
          this.playlist.set(result);
        }
        this.loading.set(false);
      });
  }

  playPlaylist() {
    const playlist = this.playlist();
    if (playlist && playlist.tracks.length > 0) {
      this.playerService.setQueue(playlist.tracks, 0);
    }
  }
}
