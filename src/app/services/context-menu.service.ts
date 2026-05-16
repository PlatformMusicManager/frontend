import { EventEmitter, HostListener, Injectable, signal } from '@angular/core';
import { fromEvent } from 'rxjs';

export interface ContextMenuOptionsState {
  position: {
    x: number;
    y: number;
  };
  elementBounds: {
    width: number;
    height: number;
  };
  openAt: 'middle' | 'top';
  options: {
    icon: string;
    label: string;
    action: () => void;
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class ContextMenuService {
  private contextMenuOptionsSignal = signal<ContextMenuOptionsState | null>(null);
  public contextMenuOptions = this.contextMenuOptionsSignal.asReadonly();
  private closeEvent = new EventEmitter<void>();

  constructor() {
    fromEvent(document, 'scroll', { capture: true }).subscribe(() => {
      this.closeContextMenu();
    });
    fromEvent(window, 'resize').subscribe(() => {
      this.closeContextMenu();
    });
  }

  public openContextMenu(options: ContextMenuOptionsState) {
    this.contextMenuOptionsSignal.set({
      ...options,
    });
    return this.closeEvent;
  }

  public closeContextMenu() {
    this.contextMenuOptionsSignal.set(null);
    this.closeEvent.emit();
    this.closeEvent.complete();
    this.closeEvent = new EventEmitter<void>();
  }

  public changeContextMenuPosition(
    position: { x: number; y: number },
    bounds: { width: number; height: number },
  ) {
    this.contextMenuOptionsSignal.update((options) => {
      if (!options) return options;
      return {
        ...options,
        position,
        elementBounds: bounds,
      };
    });
  }
}
