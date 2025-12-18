import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="toast-container">
      <div *ngFor="let toast of toastService.toasts()" 
           class="toast" 
           [ngClass]="toast.type"
           (click)="toastService.remove(toast.id)">
        {{ toast.message }}
        <span class="close-btn">&times;</span>
      </div>
    </div>
  `,
    styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .toast {
      padding: 15px 20px;
      border-radius: 8px;
      color: white;
      min-width: 250px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      animation: slideIn 0.3s ease-out;
      backdrop-filter: blur(10px);
    }
    .toast.success { background: rgba(34, 197, 94, 0.9); } /* green-500 */
    .toast.error { background: rgba(239, 68, 68, 0.9); }   /* red-500 */
    .toast.info { background: rgba(59, 130, 246, 0.9); }   /* blue-500 */
    
    .close-btn {
      margin-left: 10px;
      font-weight: bold;
      font-size: 1.2rem;
    }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent {
    toastService = inject(ToastService);
}
