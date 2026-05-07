import { Component, inject, signal } from '@angular/core';
import {
  LibraryService,
  TransformedUserPlaylist,
  TransformedTrackInPlaylist,
} from '../../services/library.service';
import { ActivatedRoute } from '@angular/router';
import { concatMap, delay, from, of } from 'rxjs';

@Component({
  selector: 'app-user-playlist',
  imports: [],
  templateUrl: './user-playlist.html',
  styleUrl: './user-playlist.css',
})
export class UserPlaylist {
  playlistData = signal<TransformedUserPlaylist | null>(null);

  private route = inject(ActivatedRoute);
  private libraryService = inject(LibraryService);

  ngOnInit(): void {
    this.libraryService.getUserPlaylist(this.route.snapshot.params['id']).subscribe((playlist) => {
      this.playlistData.set(playlist);

      const partialTracks = playlist.tracks.filter(
        (t) => t.type === 'partial',
      ) as TransformedTrackInPlaylist[];

      from(partialTracks)
        .pipe(
          concatMap((track) =>
            of(track).pipe(
              delay(500),
              concatMap((t) => this.libraryService.getFullTrack(t)),
            ),
          ),
        )
        .subscribe((fullTrack) => {
          this.playlistData.update((data) => {
            if (!data) return data;
            return {
              ...data,
              tracks: data.tracks.map((t) =>
                t.track_in_playlist_id === fullTrack.track_in_playlist_id ? fullTrack : t,
              ),
            };
          });
        });
    });
  }
}
