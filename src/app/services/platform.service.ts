import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export enum Platform {
  Deezer = 'deezer',
  Soundcloud = 'soundcloud',
}

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

export interface ApiArtistDetails {
  artist: ApiArtist;
  tracks: ApiTrack[];
  playlists: ApiPlaylist[];
}

export interface ApiSearchPage {
  tracks: ApiTrack[];
  artists: ApiArtist[];
  playlists: ApiPlaylist[];
  albums: any[]; // Define properly if needed
  users: any[]; // Define properly if needed
}

@Injectable({
  providedIn: 'root',
})
export class PlatformService {
  private platformSubject = new BehaviorSubject<Platform>(Platform.Deezer);
  public platform$ = this.platformSubject.asObservable();

  constructor(private http: HttpClient) {
    const savedPlatform = localStorage.getItem('platform') as Platform;
    if (savedPlatform && Object.values(Platform).includes(savedPlatform)) {
      this.platformSubject.next(savedPlatform);
    }
  }

  setPlatform(platform: Platform): void {
    localStorage.setItem('platform', platform);
    this.platformSubject.next(platform);
  }

  getCurrentPlatform(): Platform {
    return this.platformSubject.value;
  }

  search(query: string, platform: Platform): Observable<ApiSearchPage> {
    return this.http.get<ApiSearchPage>(`/api/${platform}/search`, {
      params: { query, offset: '0', limit: '10' },
      withCredentials: true,
    });
  }

  getPlaylist(id: string, platform: Platform, save: boolean = false): Observable<ApiPlaylist> {
    return this.http.get<ApiPlaylist>(`/api/${platform}/playlist/${id}`, {
      params: { save: save.toString() },
      withCredentials: true,
    });
  }

  getArtistDetails(id: string, platform: Platform): Observable<ApiArtistDetails> {
    return this.http.get<ApiArtistDetails>(`/api/${platform}/user/${id}/details`, {
      withCredentials: true,
    });
  }

  getArtist(id: string, platform: Platform): Observable<ApiArtist> {
    return this.http.get<ApiArtist>(`/api/${platform}/user/${id}`, {
      withCredentials: true,
    });
  }

  getArtistTracks(id: string, platform: Platform): Observable<ApiTrack[]> {
    return this.http.get<ApiTrack[]>(`/api/${platform}/user/${id}/tracks`, {
      withCredentials: true,
    });
  }
}
