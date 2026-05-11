import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-playlist-controls',
  imports: [],
  templateUrl: './playlist-controls.component.html',
  styleUrl: './playlist-controls.component.css',
})
export class PlaylistControlsComponent {
  @Output() play = new EventEmitter<void>();
}
