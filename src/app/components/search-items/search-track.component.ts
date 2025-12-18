import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiTrack } from '../../services/library.service';

@Component({
    selector: 'app-search-track',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="track-item">
            <div class="track-img">
                <img [src]="track.picture || 'assets/default-track.png'" alt="Track Art">
            </div>
            <div class="track-info">
                <div class="track-title">{{ track.title }}</div>
                <div class="track-meta">
                    <span *ngFor="let artist of track.artists; let last = last">
                        {{ artist.username }}{{ !last ? ', ' : '' }}
                    </span>
                </div>
            </div>
            <div class="track-duration">{{ formatDuration(track.duration) }}</div>
        </div>
    `,
    styles: [`
        .track-item {
            display: flex;
            align-items: center;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        .track-item:hover {
            background-color: rgba(255, 255, 255, 0.1);
        }
        .track-img {
            width: 40px;
            height: 40px;
            margin-right: 12px;
            background-color: #333;
            border-radius: 4px;
            overflow: hidden;
            flex-shrink: 0;
        }
        .track-img img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .track-info {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        .track-title {
            color: white;
            font-size: 14px;
            margin-bottom: 2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .track-meta {
            color: #b3b3b3;
            font-size: 12px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .track-duration {
            color: #b3b3b3;
            font-size: 13px;
            margin-left: 12px;
        }
    `]
})
export class SearchTrackComponent {
    @Input({ required: true }) track!: ApiTrack;

    formatDuration(ms: number): string {
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000).toFixed(0);
        return minutes + ":" + (Number(seconds) < 10 ? '0' : '') + seconds;
    }
}
