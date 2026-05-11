import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LibraryService, UserWithPlaylists } from '../../services/library.service';
import { PlaylistCardComponent } from '../../components/media-items/playlist-card.component';
import { Platform } from '../../services/platform.service';

@Component({
    selector: 'app-library',
    standalone: true,
    imports: [CommonModule, PlaylistCardComponent],
    templateUrl: './library.component.html',
    styleUrls: ['./library.component.css']
})
export class LibraryComponent implements OnInit {
    user: UserWithPlaylists | null = null;
    greeting: string = 'Good day';
    readonly Platform = Platform;

    constructor(private libraryService: LibraryService) { }

    ngOnInit(): void {
        this.updateGreeting();
        this.libraryService.currentUser$.subscribe((data) => {
            this.user = data;
        });
    }

    updateGreeting(): void {
        const hour = new Date().getHours();
        if (hour < 12) {
            this.greeting = 'Good morning';
        } else if (hour < 18) {
            this.greeting = 'Good afternoon';
        } else {
            this.greeting = 'Good evening';
        }
    }

    deletePlaylist(id: number, event: Event): void {
        event.stopPropagation();
        if (confirm('Are you sure you want to delete this playlist?')) {
            this.libraryService.deletePlaylist(id).subscribe({
                error: (err) => console.error('Failed to delete playlist', err)
            });
        }
    }
}
