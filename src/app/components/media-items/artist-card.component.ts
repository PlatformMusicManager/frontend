import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Platform } from '../../services/platform.service';

@Component({
    selector: 'app-artist-card',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="card" (click)="navigateToArtist()">
            <div class="card-image circle">
                <img [src]="image || 'default-user.png'" alt="Artist">
            </div>
            <div class="card-content">
                <h4>{{ name }}</h4>
                <p>Artist</p>
            </div>
        </div>
    `,
    styles: [`
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
            box-shadow: 0 8px 24px rgba(0,0,0,0.5);
            background-color: #333;
            border-radius: 4px;
            overflow: hidden;
        }
        .card-image.circle {
            border-radius: 50%;
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
    `]
})
export class ArtistCardComponent {
    @Input({ required: true }) name!: string;
    @Input() image?: string;
    @Input({ required: true }) id!: string;
    @Input({ required: true }) platform!: Platform;

    private router = inject(Router);

    navigateToArtist() {
        if (this.id && this.platform) {
            this.router.navigate([`artist/${this.platform}/${this.id}`]);
        }
    }
}
