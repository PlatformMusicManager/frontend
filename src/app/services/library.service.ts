import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, tap, map } from 'rxjs';
import { Platform } from './platform.service';

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

@Injectable({
  providedIn: 'root',
})
export class LibraryService {
  private apiUrl = '/api/library';
  private currentUserSubject = new BehaviorSubject<UserWithPlaylists | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

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
        tap((newPlaylist) => {
          const currentUser = this.currentUserSubject.value;
          if (currentUser) {
            const updatedUser = {
              ...currentUser,
              playlists: [...currentUser.playlists, newPlaylist],
            };
            this.currentUserSubject.next(updatedUser);
          }
        }),
      );
  }

  deletePlaylist(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/playlist/${id}`, {
        withCredentials: true,
      })
      .pipe(
        tap(() => {
          const currentUser = this.currentUserSubject.value;
          if (currentUser) {
            const updatedUser = {
              ...currentUser,
              playlists: currentUser.playlists.filter((p) => p.id !== id),
            };
            this.currentUserSubject.next(updatedUser);
          }
        }),
      );
  }

  getMe(): Observable<UserWithPlaylists> {
    return this.http
      .get<UserWithPlaylists>(`${this.apiUrl}/me`, {
        withCredentials: true,
      })
      .pipe(tap((user) => this.currentUserSubject.next(user)));
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
