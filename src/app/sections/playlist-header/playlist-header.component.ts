import { Component, Input } from '@angular/core';
import formatTime from '../../utils/format-time';
import { Platform } from '../../services/platform.service';

@Component({
  selector: 'app-playlist-header',
  imports: [],
  templateUrl: './playlist-header.component.html',
  styleUrl: './playlist-header.component.css',
})
export class PlaylistHeaderComponent {
  @Input() image: string | null = null;
  @Input({ required: true }) title!: string;
  @Input({ required: true }) platform!: Platform;
  @Input({ required: true }) owner!: string;
  @Input({ required: true }) count!: number;
  @Input({ required: true }) duration!: number;

  formatTime = formatTime;
}
