import { Component, Input, Output, EventEmitter, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiTrack } from '../../../services/platform.service';
import { PlayerService } from '../../../services/player.service';
import { TransformedTrackInPlaylistFullData } from '../../../services/library.service';
import formatTime from '../../../utils/format-time';
import { ContextMenuService } from '../../../services/context-menu.service';

@Component({
  selector: 'app-track-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './track-item.component.html',
  styleUrl: './track-item.component.css',
})
export class TrackItemComponent {
  @Input({ required: true }) track!: ApiTrack | TransformedTrackInPlaylistFullData;
  @Output() playRequest = new EventEmitter<void>();
  private playerService = inject(PlayerService);
  private contextMenuService = inject(ContextMenuService);

  formatedDuration = computed(() => formatTime(this.track.duration));

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

  openContextMenu(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    this.contextMenuService.openContextMenu({
      position: { x: rect.left, y: rect.top },
      elementBounds: {
        width: rect.width,
        height: rect.height,
      },
      openAt: 'middle',
      options: [
        {
          icon: 'add',
          label: 'Add to Queue',
          action: () => this.addToQueue(),
        },
      ],
    });
  }
}
