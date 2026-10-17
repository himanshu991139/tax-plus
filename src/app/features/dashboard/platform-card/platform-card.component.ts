import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Platform } from '../../../core/models/platform.model';
import { ClientStateService } from '../../../core/services/client-state.service';
import { PlatformLogoComponent } from '../../../shared/components/platform-logo/platform-logo.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-platform-card',
  standalone: true,
  imports: [CommonModule, PlatformLogoComponent, IconComponent],
  template: `
    <div class="platform-card">
      <!-- Card Header Banner -->
      <div class="card-header">
        <span class="type-badge">{{ platform().badge }}</span>
        <span class="frequency-label">{{ platform().filingFrequency }}</span>
      </div>

      <!-- Card Body -->
      <div class="card-body">
        <!-- Logo -->
        <div class="logo-wrapper">
          <app-platform-logo [platform]="platform().logoType"></app-platform-logo>
        </div>

        <!-- Platform Title -->
        <h3 class="platform-title">{{ platform().name }}</h3>

        @if (platform().tagline) {
          <p class="platform-tagline">{{ platform().tagline }}</p>
        }

        <!-- Upload Button -->
        <button
          type="button"
          class="btn-upload"
          (click)="onUploadClick()"
          [title]="platform().hasApiIntegration ? 'Upload and Convert Reports' : 'Upload Data for ' + platform().name"
        >
          <app-icon name="cloud-upload" [size]="16"></app-icon>
          <span>Upload Data</span>
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .platform-card {
        background: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid #e2e8f0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        display: flex;
        flex-direction: column;
        transition: transform 0.2s ease, box-shadow 0.2s ease;

        &:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 20px -5px rgba(26, 43, 109, 0.12);
        }
      }

      .card-header {
        background: #0f172a;
        color: #ffffff;
        padding: 9px 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .type-badge {
        background: rgba(255, 255, 255, 0.15);
        color: #f8fafc;
        border: 1px solid rgba(255, 255, 255, 0.2);
        font-size: 11px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 4px;
        letter-spacing: 0.3px;
      }

      .frequency-label {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.8px;
        text-transform: uppercase;
        color: #94a3b8;
      }

      .card-body {
        padding: 24px 18px 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        flex: 1;
      }

      .logo-wrapper {
        margin-bottom: 8px;
      }

      .platform-title {
        font-size: 17px;
        font-weight: 700;
        color: #0f172a;
        margin: 0 0 6px 0;
      }

      .platform-tagline {
        font-size: 11px;
        color: #64748b;
        margin: 0 0 16px 0;
        line-height: 1.3;
        min-height: 28px;
      }

      .btn-upload {
        width: 100%;
        margin-top: auto;
        background: #0f172a;
        color: #ffffff;
        border: none;
        border-radius: 8px;
        padding: 9px 16px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.15s ease-in-out;

        &:hover {
          background: #4f46e5;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
          transform: translateY(-1px);
        }
      }
    `,
  ],
})
export class PlatformCardComponent {
  readonly platform = input.required<Platform>();
  readonly state = inject(ClientStateService);

  onUploadClick(): void {
    this.state.openUploadModal(this.platform());
  }
}
