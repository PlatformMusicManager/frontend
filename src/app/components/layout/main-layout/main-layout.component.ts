import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LibraryService, UserWithPlaylists } from '../../../services/library.service';
import { CreatePlaylistModalComponent } from '../../create-playlist-modal/create-playlist-modal.component';
import { PlatformSelectorComponent } from '../../platform-selector/platform-selector.component';
import { PlayerComponent } from '../../player/player.component';
import { inject, OnInit } from '@angular/core';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [CommonModule, RouterModule, CreatePlaylistModalComponent, PlatformSelectorComponent, PlayerComponent],
    templateUrl: './main-layout.component.html',
    styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {
    user = signal<UserWithPlaylists | null>(null);
    showCreatePlaylistModal = false;
    showUserMenu = false;
    private libraryService = inject(LibraryService);
    private router = inject(Router);

    ngOnInit(): void {
        this.libraryService.currentUser$.subscribe((data) => {
            this.user.set(data);
        });

        if (this.user() === null) {
            this.libraryService.getMe().subscribe({
                error: (err) => console.error('Failed to fetch user data', err)
            });
        }
    }

    get userInitial(): string {
        return this.user()?.username ? this.user()!.username.charAt(0).toUpperCase() : '?';
    }

    openCreatePlaylistModal(): void {
        this.showCreatePlaylistModal = true;
    }

    closeCreatePlaylistModal(): void {
        this.showCreatePlaylistModal = false;
    }

    toggleUserMenu(): void {
        this.showUserMenu = !this.showUserMenu;
    }

    logout(): void {
        this.libraryService.logout();
        this.showUserMenu = false;
        this.router.navigate(['/login']);
    }

    onSearch(event: any): void {
        const query = event.target.value;
        if (query && query.trim().length > 0) {
            this.router.navigate(['/search'], { queryParams: { q: query } });
        }
    }

    onPlaylistCreated(title: string): void {
        this.libraryService.createPlaylist(title).subscribe({
            next: () => {
                this.closeCreatePlaylistModal();
            },
            error: (err) => console.error('Failed to create playlist', err)
        });
    }
}
