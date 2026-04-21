import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiTrack } from '../../../services/platform.service';
import { PlayerService } from '../../../services/player.service';

@Component({
  selector: 'app-track-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './track-item.component.html',
  styleUrl: './track-item.component.css',
})
export class TrackItemComponent {
  @Input({ required: true }) track!: ApiTrack;
  @Output() playRequest = new EventEmitter<void>();
  private playerService = inject(PlayerService);

  formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes + ':' + (Number(seconds) < 10 ? '0' : '') + seconds;
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
