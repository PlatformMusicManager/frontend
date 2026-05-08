import { Injectable, signal } from '@angular/core';
import { Observable, throwError } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts = signal<Toast[]>([]);
  private counter = 0;

  show(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const id = this.counter++;
    this.toasts.update((toasts) => [...toasts, { id, message, type }]);

    // Auto remove after 5 seconds
    setTimeout(() => this.remove(id), 5000);
  }

  remove(id: number) {
    this.toasts.update((toasts) => toasts.filter((t) => t.id !== id));
  }
}
