import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LibraryService, ApiSearchPage } from '../../services/library.service';
import { PlatformService } from '../../services/platform.service';
import { switchMap, combineLatest, map, debounceTime, filter, catchError, of } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { SearchTrackComponent } from '../../components/search-items/search-track.component';
import { SearchCardComponent } from '../../components/search-items/search-card.component';

@Component({
    selector: 'app-search',
    standalone: true,
    imports: [CommonModule, SearchTrackComponent, SearchCardComponent],
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private libraryService = inject(LibraryService);
    private platformService = inject(PlatformService);
    private cdr = inject(ChangeDetectorRef);

    searchResults: ApiSearchPage | null = null;
    isLoading = false;
    currentQuery = '';

    ngOnInit() {
        combineLatest([
            this.route.queryParams,
            this.platformService.platform$
        ]).pipe(
            map(([params, platform]) => ({ query: params['q'], platform })),
            filter(data => !!data.query),
            switchMap(data => {
                this.currentQuery = data.query;
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
