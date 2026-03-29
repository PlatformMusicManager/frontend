import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiTrack } from '../../services/library.service';
import { PlayerService } from '../../services/player.service';

@Component({
    // ... (rest of metadata stays same implicitly, but I'm editing imports/class)
    selector: 'app-track-item',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="track-item" (click)="playTrack()">
            <div class="track-img">
                <img [src]="track.picture || 'default-track.png'" alt="Track Art">
                <div class="play-overlay">▶</div>
            </div>
            <div class="track-info">
                <div class="track-title">{{ track.title }}</div>
                <div class="track-meta">
                    <span *ngFor="let artist of track.artists; let last = last">
                        {{ artist.username }}{{ !last ? ', ' : '' }}
                    </span>
                </div>
            </div>
            <div class="track-actions">
                <button class="add-queue-btn" title="Add to Queue" (click)="$event.stopPropagation(); addToQueue()">
                    +
                </button>
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
            position: relative;
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
            position: relative;
        }
        .play-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: none;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 14px;
        }
        .track-item:hover .play-overlay {
            display: flex;
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
            width: 40px;
            text-align: right;
        }
        .track-actions {
            opacity: 0;
            transition: opacity 0.2s;
            margin-left: 10px;
        }
        .track-item:hover .track-actions {
            opacity: 1;
        }
        .add-queue-btn {
            background: none;
            border: 1px solid #b3b3b3;
            color: #b3b3b3;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 16px;
            padding: 0;
            line-height: 1;
        }
        .add-queue-btn:hover {
            border-color: #fff;
            color: #fff;
            transform: scale(1.1);
        }
    `]
})
export class TrackItemComponent {
    @Input({ required: true }) track!: ApiTrack;
    @Output() playRequest = new EventEmitter<void>();
    private playerService = inject(PlayerService);

    formatDuration(ms: number): string {
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000).toFixed(0);
        return minutes + ":" + (Number(seconds) < 10 ? '0' : '') + seconds;
    }

    playTrack() {
        if (this.playRequest.observed) {
            this.playRequest.emit();
        } else {
            this.playerService.playTrack(this.track);
        }
    }

    addToQueue() {
        this.playerService.addToQueue(this.track);
    }
}
