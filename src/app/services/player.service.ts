import { Injectable, signal, computed, effect, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiTrack, PlatformService } from './platform.service';

export enum RepeatMode {
  OFF = 0,
  ALL = 1,
  ONE = 2,
}

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private audio = new Audio();
  private currentBlobUrl: string | null = null;

  // Signals for state
  currentTrack = signal<ApiTrack | null>(null);
  isPlaying = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  currentTime = signal<number>(0);
  duration = signal<number>(0);

  // Queue state
  queue = signal<ApiTrack[]>([]);
  originalQueue = signal<ApiTrack[]>([]);
  currentIndex = signal<number>(-1);

  // Playback modes
  repeatMode = signal<RepeatMode>(RepeatMode.OFF);
  shuffle = signal<boolean>(false);

  constructor(private http: HttpClient) {
    this.setupAudioListeners();
  }

  private setupAudioListeners() {
    this.audio.addEventListener('timeupdate', () => {
      this.currentTime.set(this.audio.currentTime);
    });

    this.audio.addEventListener('durationchange', () => {
      this.duration.set(this.audio.duration);
    });

    this.audio.addEventListener('ended', () => {
      this.isPlaying.set(false);
      this.currentTime.set(0);

      if (this.repeatMode() === RepeatMode.ONE) {
        this.audio.play();
        this.isPlaying.set(true);
      } else {
        this.playNext();
      }
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying.set(false);
    });

    this.audio.addEventListener('play', () => {
      this.isPlaying.set(true);
    });
  }

  playTrack(track: ApiTrack, save: boolean = true) {
    if (this.currentTrack()?.id === track.id) {
      this.togglePlay();
      return;
    }

    // Sync currentIndex if track is in the current queue
    const index = this.queue().findIndex((t) => t.id === track.id);
    if (index !== -1) {
      this.currentIndex.set(index);
    }

    this._play(track, save);
  }

  setQueue(tracks: ApiTrack[], startFromIndex: number = 0) {
    this.originalQueue.set([...tracks]); // Clone to be safe

    if (this.shuffle()) {
      const trackToPlay = tracks[startFromIndex];
      const otherTracks = tracks.filter((_, i) => i !== startFromIndex);
      const shuffled = this.shuffleArray(otherTracks);
      const newQueue = [trackToPlay, ...shuffled];
      this.queue.set(newQueue);
      this.currentIndex.set(0);
      this._play(trackToPlay);
    } else {
      this.queue.set(tracks);
      this.currentIndex.set(startFromIndex);
      if (tracks.length > startFromIndex && startFromIndex >= 0) {
        this._play(tracks[startFromIndex]);
      }
    }
  }

  addToQueue(track: ApiTrack) {
    this.originalQueue.update((q) => [...q, track]);
    this.queue.update((q) => [...q, track]);
  }

  toggleShuffle() {
    const isShuffling = !this.shuffle();
    this.shuffle.set(isShuffling);

    const currentQ = this.queue();
    const currentIdx = this.currentIndex();
    const currentTrack = currentQ[currentIdx];

    // History: tracks up to current index
    const history = currentIdx >= 0 ? currentQ.slice(0, currentIdx + 1) : [];
    const historyIds = new Set(history.map((t) => t.id));

    if (isShuffling) {
      // Turning ON
      // Take future tracks from original queue that aren't in history
      // (Actually, if we just turned on, we might want to shuffle the REST of the current queue?
      // User requirement: "if not shuffle called u need to move to queue which was before")

      // Standard smart shuffle: keep history, shuffle the rest of ORIGINAL queue user hasn't heard?
      // OR shuffle the rest of the CURRENT queue?
      // "Smart Shuffle" usually means: Lock history, shuffle everything else.

      // Let's take all tracks from original queue NOT in history.
      const original = this.originalQueue();
      const futureCandidates = original.filter((t) => !historyIds.has(t.id));

      // Allow duplicates? If original has 2 same tracks and we played 1, we should keep 1.
      // Simplified: Filter out tracks that are in history (by ID/instance).
      // Since we don't have unique instance IDs, we'll assume unique track IDs for now or filtered by index if possible.
      // For now, simple ID filter is safest.

      const shuffledFuture = this.shuffleArray(futureCandidates);
      this.queue.set([...history, ...shuffledFuture]);
      // currentIndex stays same
    } else {
      // Turning OFF
      // Restore original order for future tracks.
      // History stays as is.
      // Find all tracks in original queue that are NOT in history, keep their relative order.
      const original = this.originalQueue();
      const futureRestored = original.filter((t) => !historyIds.has(t.id));

      this.queue.set([...history, ...futureRestored]);
    }
  }

  private shuffleArray(array: ApiTrack[]): ApiTrack[] {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  }

  playNext() {
    const q = this.queue();
    const current = this.currentIndex();

    if (q.length === 0) return;

    if (current < q.length - 1) {
      const nextIndex = current + 1;
      this.currentIndex.set(nextIndex);
      this._play(q[nextIndex]);
    } else {
      // End of queue
      if (this.repeatMode() === RepeatMode.ALL) {
        // Loop back to start
        this.currentIndex.set(0);
        this._play(q[0]);
      } else {
        this.isPlaying.set(false);
      }
    }
  }

  playPrevious() {
    const q = this.queue();
    const current = this.currentIndex();
    if (current > 0) {
      const prevIndex = current - 1;
      this.currentIndex.set(prevIndex);
      this._play(q[prevIndex]);
    } else {
      this.seek(0);
    }
  }

  removeFromQueue(index: number) {
    const q = this.queue();
    const trackToRemove = q[index];

    // Remove from visible queue
    let newIndex = this.currentIndex();
    if (index < newIndex) {
      newIndex--;
    } else if (index === newIndex) {
      // Removing currently playing track
      if (q.length > 1) {
        // Play next if available, or stay at index (which will be next track)
        // If last track, handled by bounds check logic later or just stop
      } else {
        this.isPlaying.set(false);
        this.currentTrack.set(null);
        newIndex = -1;
      }
    }

    const newQ = [...q];
    newQ.splice(index, 1);
    this.queue.set(newQ);
    this.currentIndex.set(newIndex);

    // Also remove from originalQueue
    // We need to find *one* instance of this track in originalQueue
    const original = this.originalQueue();
    const originalIndex = original.findIndex((t) => t.id === trackToRemove.id); // Simple ID match
    if (originalIndex !== -1) {
      const newOriginal = [...original];
      newOriginal.splice(originalIndex, 1);
      this.originalQueue.set(newOriginal);
    }

    if (index === this.currentIndex() && newQ.length > 0) {
      // Deleted current track, play the new one at this index
      const safeIndex = Math.min(newIndex, newQ.length - 1);
      this.currentIndex.set(safeIndex);
      this._play(newQ[safeIndex]);
    } else if (newQ.length === 0) {
      this.isPlaying.set(false);
      this.currentTrack.set(null);
      this.currentIndex.set(-1);
    }
  }

  moveInQueue(fromIndex: number, toIndex: number) {
    const q = this.queue();
    if (fromIndex < 0 || fromIndex >= q.length || toIndex < 0 || toIndex >= q.length) return;

    const newQ = [...q];
    const [movedTrack] = newQ.splice(fromIndex, 1);
    newQ.splice(toIndex, 0, movedTrack);

    // Update current index
    let current = this.currentIndex();
    if (current === fromIndex) {
      current = toIndex;
    } else if (current > fromIndex && current <= toIndex) {
      current--;
    } else if (current < fromIndex && current >= toIndex) {
      current++;
    }

    this.queue.set(newQ);
    this.currentIndex.set(current);

    // Note: We do NOT update originalQueue order here,
    // as reordering the shuffle queue implies a temporary change?
    // Or should we? "Shuffle queue" usually implies temporary order.
    // If user manually reorders, they expect that order.
    // But unshuffle would revert it?
    // Implementing "Smart Queue" usually means manual reorders are preserved in valid queue,
    // but restoring original might lose them if we don't sync.
    // For now, let's keep originalQueue strictly "album/playlist order".
  }

  private _play(track: ApiTrack, save: boolean = true) {
    this.currentTrack.set(track);
    this.isLoading.set(true);
    this.isPlaying.set(false); // Valid state until loaded

    // Clean up old blob URL
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }

    const url = `/api/${track.platform}/stream/${track.id}`;

    this.http
      .post(
        url,
        {
          media_url: track.track_url,
          track_token: track.track_token,
        },
        {
          params: { save: save.toString() },
          responseType: 'blob',
        },
      )
      .subscribe({
        next: (blob) => {
          this.currentBlobUrl = URL.createObjectURL(blob);
          this.audio.src = this.currentBlobUrl;
          this.audio.load();
          this.audio
            .play()
            .then(() => {
              this.isPlaying.set(true);
              this.isLoading.set(false);
            })
            .catch((err) => {
              console.error('Error playing audio', err);
              this.isLoading.set(false);
            });
        },
        error: (err) => {
          console.error('Error fetching stream', err);
          this.isLoading.set(false);
        },
      });
  }

  togglePlay() {
    if (this.audio.paused) {
      this.audio.play();
      this.isPlaying.set(true);
    } else {
      this.audio.pause();
      this.isPlaying.set(false);
    }
  }

  seek(seconds: number) {
    this.audio.currentTime = seconds;
  }
}
