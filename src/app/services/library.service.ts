import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, tap, map } from 'rxjs';
import { Platform } from './platform.service';

export interface ApiArtist {
    id: string;
    username: string;
    picture?: string;
    is_dummy: boolean;
}

export interface ApiTrack {
    id: string;
    title: string;
    duration: number;
    track_url?: string;
    track_token?: string;
    platform: Platform;
    picture?: string;
    artists: ApiArtist[];
    active?: boolean; // For UI state
}

export interface ApiPlaylist {
    id: string;
    title: string;
    parent_username: string;
    picture?: string;
    platform: Platform;
    tracks: ApiTrack[];
    size: number;
}

export interface ApiSearchPage {
    tracks: ApiTrack[];
    artists: ApiArtist[];
    playlists: ApiPlaylist[];
    albums: any[]; // Define properly if needed
    users: any[]; // Define properly if needed
}

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
    providedIn: 'root'
})
export class LibraryService {
    private apiUrl = '/api/library';
    private currentUserSubject = new BehaviorSubject<UserWithPlaylists | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) { }

    createPlaylist(title: string): Observable<PlaylistInUser> {
        return this.http.post<number>(`${this.apiUrl}/playlist`, { title }, {
            withCredentials: true
        }).pipe(
            map(id => ({ id, title })),
            tap(newPlaylist => {
                const currentUser = this.currentUserSubject.value;
                if (currentUser) {
                    const updatedUser = {
                        ...currentUser,
                        playlists: [...currentUser.playlists, newPlaylist]
                    };
                    this.currentUserSubject.next(updatedUser);
                }
            })
        );
    }

    deletePlaylist(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/playlist/${id}`, {
            withCredentials: true
        }).pipe(
            tap(() => {
                const currentUser = this.currentUserSubject.value;
                if (currentUser) {
                    const updatedUser = {
                        ...currentUser,
                        playlists: currentUser.playlists.filter(p => p.id !== id)
                    };
                    this.currentUserSubject.next(updatedUser);
                }
            })
        );
    }

    getMe(): Observable<UserWithPlaylists> {
        return this.http.get<UserWithPlaylists>(`${this.apiUrl}/me`, {
            withCredentials: true
        }).pipe(
            tap(user => this.currentUserSubject.next(user))
        );
    }

    logout(): void {
        this.currentUserSubject.next(null);
        // We could also call the backend endpoint /api/auth/logout if it exists
        // this.http.post('/api/auth/logout', {}).subscribe();
    }

    search(query: string, platform: Platform): Observable<ApiSearchPage> {
        return this.http.get<ApiSearchPage>(`/api/${platform}/search`, {
            params: { query, offset: '0', limit: '10' },
            withCredentials: true
        });
    }

    getPlaylist(id: string, platform: Platform, save: boolean = false): Observable<ApiPlaylist> {
        return this.http.get<ApiPlaylist>(`/api/${platform}/playlist/${id}`, {
            params: { save: save.toString() },
            withCredentials: true
        });
    }

    getArtistDetails(id: string, platform: Platform): Observable<ArtistDetails> {
        return this.http.get<ArtistDetails>(`/api/${platform}/user/${id}/details`, {
            withCredentials: true
        });
    }

    getArtist(id: string, platform: Platform): Observable<ApiArtist> {
        return this.http.get<ApiArtist>(`/api/${platform}/user/${id}`, {
            withCredentials: true
        });
    }

    getArtistTracks(id: string, platform: Platform): Observable<ApiTrack[]> {
        return this.http.get<ApiTrack[]>(`/api/${platform}/user/${id}/tracks`, {
            withCredentials: true
        });
    }
}

export interface ArtistDetails {
    artist: ApiArtist;
    tracks: ApiTrack[];
    playlists: ApiPlaylist[];
}
