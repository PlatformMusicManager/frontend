import { Component, Input } from '@angular/core';
import { TransformedTrackInPlaylist } from '../../../services/library.service';
import { DotsLoadingComponent } from '../../dots-loading/dots-loading.component';

@Component({
  selector: 'app-track-placeholder',
  imports: [DotsLoadingComponent],
  templateUrl: './track-placeholder.html',
  styleUrl: './track-placeholder.css',
})
export class TrackPlaceholder {
  @Input({ required: true }) track!: TransformedTrackInPlaylist;
}
