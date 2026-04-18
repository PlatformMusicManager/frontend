import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Platform } from '../../services/platform.service';
// We need the ID to navigate, assuming the card input has it.
// If 'title' etc are inputs, we might want to pass the full Playlist object or add an ID input.
// Previous usage in search.component.html: [title]="playlist.title" [image]="playlist.picture" etc.
// We should probably pass the whole playlist object or at least the ID.

@Component({
  selector: 'app-playlist-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" (click)="navigateToPlaylist()">
      <div class="card-image">
        <img [src]="image || 'default-playlist.png'" alt="Playlist" />
      </div>
      <div class="card-content">
        <h4>{{ title }}</h4>
        <p>{{ subtitle }}</p>
      </div>
    </div>
  `,
  styles: [
    `
      .card {
        background-color: #181818;
        padding: 16px;
        border-radius: 8px;
        transition: background-color 0.3s ease;
        cursor: pointer;
        height: 100%;
      }
      .card:hover {
        background-color: #282828;
      }
      .card-image {
        width: 100%;
        aspect-ratio: 1;
        margin-bottom: 16px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
        background-color: #333;
        border-radius: 4px;
        overflow: hidden;
      }
      .card-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .card-content h4 {
        color: white;
        font-weight: 700;
        font-size: 16px;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .card-content p {
        color: #b3b3b3;
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `,
  ],
})
export class PlaylistCardComponent {
  @Input() id!: string;
  @Input({ required: true }) title!: string;
  @Input() subtitle: string = '';
  @Input() image?: string;
  @Input() platform!: Platform;

  private router = inject(Router);

  navigateToPlaylist() {
    if (this.id) {
      this.router.navigate([`playlist/${this.platform}/${this.id}`]);
    }
  }
}
