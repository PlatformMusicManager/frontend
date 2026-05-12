import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { PlayerService, RepeatMode } from '../../services/player.service';
import { DotsLoadingComponent } from '../dots-loading/dots-loading.component';
import { RoundHoverableButtonComponent } from '../round-hoverable-button/round-hoverable-button.component';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [CommonModule, DragDropModule, DotsLoadingComponent, RoundHoverableButtonComponent],
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css'],
})
export class PlayerComponent {
  playerService = inject(PlayerService);

  currentTrack = this.playerService.currentTrack;
  isPlaying = this.playerService.isPlaying;
  isLoading = this.playerService.isLoading;
  currentTime = this.playerService.currentTime;
  duration = this.playerService.duration;

  progressWidth = computed(() => {
    const dur = this.duration();
    if (!dur) return '0%';
    return `${(this.currentTime() / dur) * 100}%`;
  });

  get currentArt(): string {
    return this.currentTrack()?.picture || '';
  }

  get currentTitle(): string {
    return this.currentTrack()?.title || '';
  }

  get currentArtist(): string {
    const track = this.currentTrack();
    if (!track) return '';
    return track.artists.map((a) => a.username).join(', ');
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  togglePlay() {
    this.playerService.togglePlay();
  }

  showQueue = false;

  toggleQueue() {
    this.showQueue = !this.showQueue;
  }

  nextTrack() {
    this.playerService.playNext();
  }

  previousTrack() {
    this.playerService.playPrevious();
  }

  removeFromQueue(index: number) {
    this.playerService.removeFromQueue(index);
  }

  drop(event: CdkDragDrop<string[]>) {
    this.playerService.moveInQueue(event.previousIndex, event.currentIndex);
  }

  isDragging = false;

  onDragStarted() {
    this.isDragging = true;
  }

  onDragEnded() {
    // slight delay to ensure click event fires (and gets ignored) before resetting
    setTimeout(() => {
      this.isDragging = false;
    }, 200);
  }

  playQueueTrack(track: any, index: number) {
    if (!this.isDragging) {
      this.playerService.currentIndex.set(index);
      this.playerService.playTrack(track);
    }
  }

  toggleShuffle() {
    this.playerService.toggleShuffle();
  }

  toggleRepeat() {
    const current = this.playerService.repeatMode();
    let next: RepeatMode;
    if (current === RepeatMode.OFF) next = RepeatMode.ALL;
    else if (current === RepeatMode.ALL) next = RepeatMode.ONE;
    else next = RepeatMode.OFF;

    this.playerService.repeatMode.set(next);
  }

  // Expose enum to template
  RepeatMode = RepeatMode;

  onSeek(event: MouseEvent) {
    const container = event.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const width = rect.width;
    const percentage = offsetX / width;
    const seekTime = percentage * this.duration();
    this.playerService.seek(seekTime);
  }
}
