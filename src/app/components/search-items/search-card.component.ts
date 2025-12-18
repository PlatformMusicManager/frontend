import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-search-card',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="card">
            <div class="card-image" [class.circle]="type === 'Artist'">
                <img [src]="image || defaultImage" [alt]="type">
            </div>
            <div class="card-content">
                <h4>{{ title }}</h4>
                <p>{{ subtitle }}</p>
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
export class SearchCardComponent {
    @Input({ required: true }) title!: string;
    @Input() subtitle: string = '';
    @Input() image?: string;
    @Input() type: 'Artist' | 'Playlist' | 'Album' = 'Playlist';

    get defaultImage(): string {
        return this.type === 'Artist' ? 'assets/default-user.png' : 'assets/default-playlist.png';
    }
}
