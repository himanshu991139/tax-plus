import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClientStateService } from '../../../core/services/client-state.service';
import { GstApiService } from '../../../core/services/gst-api.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-client-header',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  template: `
    <div class="client-header-container">
      <!-- Back Link & Title Row -->
      <div class="d-flex align-items-center justify-content-between mb-2">
        <a routerLink="/app/profiles" class="back-link">
          <app-icon name="chevron-down" [size]="14" customClass="rotate-left"></app-icon>
          <span>Back to Manage GST Profiles</span>
        </a>
        <span class="badge bg-light text-secondary border">Filing Dashboard</span>
      </div>

      <div class="page-title-row">
        <h1 class="page-title">
          <span class="title-cloud-icon">
            <app-icon name="cloud-upload" [size]="24"></app-icon>
          </span>
          <span>Import Data from Platform</span>
        </h1>
        <p class="page-subtitle">
          <app-icon name="info" [size]="15" customClass="info-icon"></app-icon>
          <span>Upload platform sales reports, view verified statement, and generate GSTR-1 JSON.</span>
        </p>
      </div>

      <!-- Client Info Card -->
      <div class="client-info-card">
        <div class="client-meta-grid">
          <!-- Company -->
          <div class="meta-item">
            <div class="meta-icon-col">
              <app-icon name="building" [size]="18"></app-icon>
            </div>
            <div class="meta-text-col">
              <div class="meta-label">Company</div>
              <div class="meta-value">{{ state.clientInfo().company }}</div>
            </div>
          </div>

          <!-- Client -->
          <div class="meta-item">
            <div class="meta-icon-col">
              <app-icon name="user" [size]="18"></app-icon>
            </div>
            <div class="meta-text-col">
              <div class="meta-label">Client</div>
              <div class="meta-value">{{ state.clientInfo().client }}</div>
            </div>
          </div>

          <!-- GSTIN -->
          <div class="meta-item gstin-item">
            <div class="meta-icon-col">
              <app-icon name="id-card" [size]="18"></app-icon>
            </div>
            <div class="meta-text-col">
              <div class="meta-label">GSTIN</div>
              <div class="meta-value font-mono">{{ state.clientInfo().gstin }}</div>
            </div>
          </div>


        </div>

        <!-- Switch Client Action Button -->
        <button type="button" class="btn-switch-client" (click)="state.openSwitchClientModal()">
          <app-icon name="switch" [size]="14"></app-icon>
          <span>Switch Client</span>
        </button>
      </div>

      <!-- Action Row: View Statement & Generate & Download GSTR-1 -->
      <div class="action-row">
        <button
          type="button"
          class="btn-view-statement"
          (click)="state.openStatementModal()"
        >
          <app-icon name="file-text" [size]="15"></app-icon>
          <span>View Statement</span>
          @if (state.gstr1Payload()) {
            <span class="statement-ready-dot" title="Data generated from backend"></span>
          }
        </button>

        <button
          type="button"
          class="btn-download-gstr1"
          (click)="downloadGstr1()"
          [disabled]="!state.gstr1Payload()"
          [title]="state.gstr1Payload() ? 'Download generated GSTR-1 JSON' : 'Submit platform data first to enable GSTR-1 download'"
        >
          <app-icon name="download" [size]="15"></app-icon>
          <span>Generate & Download GSTR-1</span>
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .client-header-container {
        margin-bottom: 24px;
      }

      .back-link {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: #4f46e5;
        font-size: 13px;
        font-weight: 600;
        text-decoration: none;
        transition: color 0.15s;

        &:hover {
          color: #4338ca;
          text-decoration: underline;
        }

        .rotate-left {
          transform: rotate(90deg);
        }
      }

      .page-title-row {
        margin-bottom: 16px;

        .page-title {
          font-size: 22px;
          font-weight: 800;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0 0 4px 0;
        }

        .title-cloud-icon {
          color: #4f46e5;
          display: inline-flex;
        }

        .page-subtitle {
          margin: 0;
          font-size: 13px;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 6px;

          .info-icon {
            color: #94a3b8;
          }
        }
      }

      .client-info-card {
        background: #ffffff;
        border: 1.5px solid #cbd5e1;
        border-radius: 12px;
        padding: 14px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04);
        flex-wrap: wrap;
      }

      .client-meta-grid {
        display: flex;
        align-items: center;
        gap: 28px;
        flex-wrap: wrap;
        flex: 1;
      }

      .meta-item {
        display: flex;
        align-items: center;
        gap: 10px;

        .meta-icon-col {
          color: #4f46e5;
          display: flex;
          align-items: center;
        }

        .meta-text-col {
          display: flex;
          flex-direction: column;

          .meta-label {
            font-size: 11px;
            color: #64748b;
            font-weight: 500;
            line-height: 1.2;
          }

          .meta-value {
            font-size: 14px;
            font-weight: 700;
            color: #0f172a;
            line-height: 1.3;

            &.font-mono {
              font-family: 'JetBrains Mono', monospace;
              letter-spacing: 0.3px;
            }
          }
        }
      }

      .btn-switch-client {
        background: #ffffff;
        border: 1px solid #cbd5e1;
        color: #334155;
        border-radius: 6px;
        padding: 7px 14px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: all 0.15s ease-in-out;
        white-space: nowrap;

        &:hover {
          background: #f8fafc;
          border-color: #64748b;
          color: #0f172a;
        }
      }

      .action-row {
        margin-top: 14px;
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }

      .btn-view-statement {
        background: #0f172a;
        color: #ffffff;
        border: none;
        border-radius: 6px;
        padding: 8px 16px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 2px 6px rgba(15, 23, 42, 0.2);
        transition: all 0.15s ease-in-out;

        &:hover {
          background: #1e293b;
          transform: translateY(-1px);
        }

        .statement-ready-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.4);
        }
      }

      .btn-download-gstr1 {
        background: linear-gradient(135deg, #4f46e5, #6366f1);
        color: #ffffff;
        border: none;
        border-radius: 6px;
        padding: 8px 18px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 2px 6px rgba(79, 70, 229, 0.25);
        transition: all 0.15s ease-in-out;

        &:hover:not(:disabled) {
          background: linear-gradient(135deg, #4338ca, #4f46e5);
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(79, 70, 229, 0.35);
        }

        &:disabled {
          background: #e2e8f0;
          color: #94a3b8;
          box-shadow: none;
          cursor: not-allowed;
          opacity: 0.7;
        }
      }
    `,
  ],
})
export class ClientHeaderComponent {
  readonly state = inject(ClientStateService);
  private readonly gstApi = inject(GstApiService);

  downloadGstr1(): void {
    const payload = this.state.gstr1Payload();
    if (!payload) {
      this.state.showToast('Please submit platform reports first to generate GSTR-1.', 'warning');
      return;
    }
    const client = this.state.clientInfo();
    const period = client.periodCode || 'return';
    const filename = `GSTR1_${client.company || 'Client'}_${period}.json`;
    this.gstApi.downloadJsonFile(payload, filename);
    this.state.showToast('GSTR-1 JSON downloaded successfully!', 'success');
  }
}
