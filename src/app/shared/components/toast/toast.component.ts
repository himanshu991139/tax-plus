import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientStateService } from '../../../core/services/client-state.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    @if (state.toast(); as toast) {
      <div class="toast-container" [class]="'toast-' + toast.type">
        <div class="toast-content">
          <span class="toast-icon">
            @switch (toast.type) {
              @case ('success') {
                <app-icon name="check" [size]="18"></app-icon>
              }
              @case ('error') {
                <app-icon name="alert" [size]="18"></app-icon>
              }
              @case ('warning') {
                <app-icon name="alert" [size]="18"></app-icon>
              }
              @default {
                <app-icon name="info" [size]="18"></app-icon>
              }
            }
          </span>
          <span class="toast-message">{{ toast.message }}</span>
          <button type="button" class="toast-close" (click)="state.dismissToast()" aria-label="Close">
            <app-icon name="x" [size]="14"></app-icon>
          </button>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .toast-container {
        position: fixed;
        bottom: 28px;
        right: 28px;
        z-index: 9999;
        display: flex;
        align-items: center;
        padding: 12px 18px;
        border-radius: 10px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        font-weight: 500;
        animation: slideIn 0.25s ease-out;

        &.toast-success {
          background: #065f46;
          color: #ecfdf5;
          border-left: 4px solid #10b981;
        }

        &.toast-error {
          background: #881337;
          color: #fff1f2;
          border-left: 4px solid #f43f5e;
        }

        &.toast-info {
          background: #1e3a8a;
          color: #eff6ff;
          border-left: 4px solid #3b82f6;
        }

        &.toast-warning {
          background: #78350f;
          color: #fffbeb;
          border-left: 4px solid #f59e0b;
        }
      }

      .toast-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .toast-message {
        line-height: 1.4;
      }

      .toast-close {
        background: transparent;
        border: none;
        color: inherit;
        opacity: 0.75;
        cursor: pointer;
        padding: 2px;
        display: inline-flex;
        border-radius: 4px;
        transition: opacity 0.15s;

        &:hover {
          opacity: 1;
        }
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(12px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class ToastComponent {
  readonly state = inject(ClientStateService);
}
