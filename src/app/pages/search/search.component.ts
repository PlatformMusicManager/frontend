import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { switchMap, combineLatest, map, filter, catchError, of } from 'rxjs';
import { LibraryService, ApiSearchPage } from '../../services/library.service';
import { PlayerService } from '../../services/player.service';
import { PlatformService, Platform } from '../../services/platform.service';
import { TrackItemComponent } from '../../components/media-items/track-item.component';
import { PlaylistCardComponent } from '../../components/media-items/playlist-card.component';
import { ArtistCardComponent } from '../../components/media-items/artist-card.component';

@Component({
    selector: 'app-search',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TrackItemComponent,
        PlaylistCardComponent,
        ArtistCardComponent
    ],
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private libraryService = inject(LibraryService);
    private platformService = inject(PlatformService);
    private cdr = inject(ChangeDetectorRef);
    private playerService = inject(PlayerService); // Added injection

    // ...

    playTrack(index: number) {
        if (this.searchResults?.tracks) {
            this.playerService.setQueue(this.searchResults.tracks, index);
        }
    }

    searchResults: ApiSearchPage | null = null;
    isLoading = false;
    currentQuery = '';
    currentPlatform: Platform | null = null;

    ngOnInit() {
        combineLatest([
            this.route.queryParams,
            this.platformService.platform$
        ]).pipe(
            map(([params, platform]) => ({ query: params['q'], platform })),
            filter(data => !!data.query),
            switchMap(data => {
                this.currentQuery = data.query;
                this.currentPlatform = data.platform;
                this.searchResults = null; // Clear previous results
                return this.libraryService.search(data.query, data.platform).pipe(
                    catchError(err => {
                        console.error('Search API failed', err);
                        return of(null);
                    })
                );
            })
        ).subscribe({
            next: (results) => {
                console.log('Search results received:', results);
                this.searchResults = results;
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Search subscription failed', err);
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }
}
