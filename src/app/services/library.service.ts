import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, tap, map } from 'rxjs';
import { ApiTrack, Platform, PlatformService } from './platform.service';

export interface PlaylistInUser {
  id: number;
  title: string;
}

export interface UserWithPlaylists {
  id: number;
  email: string;
  username: string;
  playlists: PlaylistInUser[];
}

export interface FullTrackResponse {
  id: number;
  title: string;
  img: string | null;
  author: {
    id: number;
    title: string;
    img: string | null;
  };
  duration: number;
}

export interface TrackInPlaylistResponse {
  track_in_playlist_id: number;
  position: number;
  platform: Platform;
  track_id: number;
}

export interface UserPlaylistBase {
  id: number;
  title: string;
  owner_id: number;
  owner_name: string;
}

export interface UserPlaylistWithTracks extends UserPlaylistBase {
  tracks: TrackInPlaylistResponse[];
  found_tracks_soundcloud: FullTrackResponse[];
  found_tracks_deezer: FullTrackResponse[];
}

export interface TransformedTrackInPlaylistFullData extends ApiTrack, TrackInPlaylistResponse {
  type: 'full';
}

export interface TransformedTrackInPlaylist extends TrackInPlaylistResponse {
  type: 'partial';
}

export interface TransformedUserPlaylist extends UserPlaylistBase {
  tracks: (TransformedTrackInPlaylistFullData | TransformedTrackInPlaylist)[];
}

@Injectable({
  providedIn: 'root',
})
export class LibraryService {
  private apiUrl = '/api/library';
  private currentUserSubject = new BehaviorSubject<UserWithPlaylists | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private platformService: PlatformService,
  ) {}

  createPlaylist(title: string): Observable<PlaylistInUser> {
    return this.http
      .post<number>(
        `${this.apiUrl}/playlist`,
        { title },
        {
          withCredentials: true,
        },
      )
      .pipe(
        map((id) => ({ id, title })),
        tap({
          next: (newPlaylist) => {
            const currentUser = this.currentUserSubject.value;
            if (currentUser) {
              const updatedUser = {
                ...currentUser,
                playlists: [...currentUser.playlists, newPlaylist],
              };
              this.currentUserSubject.next(updatedUser);
            }
          },
        }),
      );
  }

  getFullTrack(
    partial: TransformedTrackInPlaylist,
  ): Observable<TransformedTrackInPlaylistFullData> {
    const observable = this.platformService.getTrack(partial.track_id.toString(), partial.platform);

    return observable.pipe(
      map((track) => {
        return {
          ...track,
          ...partial,
          type: 'full',
        };
      }),
    );
  }

  getUserPlaylist(id: number): Observable<TransformedUserPlaylist> {
    return this.http
      .get<UserPlaylistWithTracks>(`${this.apiUrl}/playlist/${id}`, {
        withCredentials: true,
      })
      .pipe(
        map((playlist): TransformedUserPlaylist => {
          return {
            ...playlist,
            tracks: playlist.tracks.map(
              (track): TransformedTrackInPlaylistFullData | TransformedTrackInPlaylist => {
                let foundTrack: FullTrackResponse | null = null;

                if (track.platform === Platform.Soundcloud) {
                  foundTrack =
                    playlist.found_tracks_soundcloud.find((t) => t.id === track.track_id) || null;
                } else if (track.platform === Platform.Deezer) {
                  foundTrack =
                    playlist.found_tracks_deezer.find((t) => t.id === track.track_id) || null;
                }

                if (foundTrack) {
                  return {
                    ...track,
                    id: foundTrack.id.toString(),
                    title: foundTrack.title,
                    picture: foundTrack.img || undefined,
                    duration: foundTrack.duration,
                    artists: [
                      {
                        id: foundTrack.author.id.toString(),
                        username: foundTrack.author.title,
                        picture: foundTrack.author.img || undefined,
                        is_dummy: false,
                      },
                    ],
                    type: 'full',
                    // ...foundTrack,
                  };
                }

                return {
                  ...track,
                  type: 'partial',
                };
              },
            ),
          };
        }),
      );
  }

  deletePlaylist(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/playlist/${id}`, {
        withCredentials: true,
      })
      .pipe(
        tap({
          next: () => {
            const currentUser = this.currentUserSubject.value;
            if (currentUser) {
              const updatedUser = {
                ...currentUser,
                playlists: currentUser.playlists.filter((p) => p.id !== id),
              };
              this.currentUserSubject.next(updatedUser);
            }
          },
        }),
      );
  }

  getMe(): Observable<UserWithPlaylists> {
    return this.http
      .get<UserWithPlaylists>(`${this.apiUrl}/me`, {
        withCredentials: true,
      })
      .pipe(tap({ next: (user) => this.currentUserSubject.next(user) }));
  }

  logout(): void {
    this.currentUserSubject.next(null);
  }

  saveToPlaylist(playlistId: number, trackId: string, platform: Platform): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/playlist/track`,
      { playlist_id: playlistId, track_id: trackId, platform },
      {
        withCredentials: true,
      },
    );
  }

  removeFromPlaylist(trackInPlaylistId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/playlist/track/${trackInPlaylistId}`, {
      withCredentials: true,
    });
  }

  moveTrackInPlaylist(trackInPlaylistId: number, newPosition: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/playlist/track/move`, {
      track_in_playlist_id: trackInPlaylistId,
      new_position: newPosition,
    });
  }
}
