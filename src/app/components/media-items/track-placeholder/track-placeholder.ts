import { Component, Input } from '@angular/core';
import { TransformedTrackInPlaylist } from '../../../services/library.service';
import { DotsLoading } from '../../dots-loading/dots-loading';

@Component({
  selector: 'app-track-placeholder',
  imports: [DotsLoading],
  templateUrl: './track-placeholder.html',
  styleUrl: './track-placeholder.css',
})
export class TrackPlaceholder {
  @Input({ required: true }) track!: TransformedTrackInPlaylist;
}
