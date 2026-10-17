import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientStateService } from '../../../core/services/client-state.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-client-info-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    @if (state.isClientInfoModalOpen()) {
      <div class="modal-overlay" (click)="onBackdropClick($event)">
        <div class="modal-dialog-info" (click)="$event.stopPropagation()">
          <!-- Header -->
          <div class="modal-header-info">
            <div class="d-flex align-items-center gap-2">
              <app-icon name="info" [size]="18" class="text-white"></app-icon>
              <h3 class="m-0 fs-5 fw-bold text-white">Client Information</h3>
            </div>
            <button type="button" class="btn-close-white" (click)="state.closeClientInfoModal()" aria-label="Close">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <!-- Body -->
          <div class="modal-body-info">
            @if (profile(); as p) {
              <!-- Client Details Table -->
              <div class="client-detail-rows mb-4">
                <div class="detail-row">
                  <span class="detail-label d-flex align-items-center gap-2">
                    <app-icon name="building" [size]="16" class="text-secondary"></app-icon>
                    <span>Company Name</span>
                  </span>
                  <span class="detail-val fw-bold">{{ p.companyName }}</span>
                </div>

                <div class="detail-row">
                  <span class="detail-label d-flex align-items-center gap-2">
                    <app-icon name="user" [size]="16" class="text-secondary"></app-icon>
                    <span>Owner Name</span>
                  </span>
                  <span class="detail-val fw-bold">{{ p.ownerName }}</span>
                </div>

                <div class="detail-row">
                  <span class="detail-label d-flex align-items-center gap-2">
                    <app-icon name="id-card" [size]="16" class="text-secondary"></app-icon>
                    <span>GSTIN</span>
                  </span>
                  <span class="detail-val font-mono fw-bold">{{ p.gstin }}</span>
                </div>

                <div class="detail-row">
                  <span class="detail-label d-flex align-items-center gap-2">
                    <app-icon name="calendar" [size]="16" class="text-secondary"></app-icon>
                    <span>Type Of Filing</span>
                  </span>
                  <span class="detail-val">{{ p.typeOfFiling }}</span>
                </div>
              </div>

              <!-- Month and Year Selection -->
              <div class="filing-period-selection border-top pt-3">
                <h5 class="fs-6 fw-bold text-dark mb-3">Please provide Month and Year of Filing</h5>

                <div class="mb-3">
                  <label class="form-label small fw-bold text-dark d-flex align-items-center gap-1">
                    <app-icon name="calendar" [size]="15" class="text-primary"></app-icon>
                    <span>Month of Filing :</span>
                  </label>
                  <select class="form-select" [(ngModel)]="selectedMonth">
                    <option value="" disabled>Select month</option>
                    @for (m of months; track m) {
                      <option [value]="m">{{ m }}</option>
                    }
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label small fw-bold text-dark d-flex align-items-center gap-1">
                    <app-icon name="calendar" [size]="15" class="text-primary"></app-icon>
                    <span>Year of Filing :</span>
                  </label>
                  <select class="form-select" [(ngModel)]="selectedYear">
                    <option value="" disabled>Select year</option>
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>
                </div>
              </div>
            }
          </div>

          <!-- Footer -->
          <div class="modal-footer-info">
            <button
              type="button"
              class="btn btn-secondary px-4"
              (click)="state.closeClientInfoModal()"
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-brand-amber px-4"
              (click)="confirmImport()"
              [disabled]="!selectedMonth || !selectedYear"
            >
              Import Data
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .modal-dialog-info {
        background: #ffffff;
        border-radius: 12px;
        width: 100%;
        max-width: 540px;
        overflow: hidden;
        box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.35);
      }

      .modal-header-info {
        padding: 16px 20px;
        background: linear-gradient(135deg, #1e293b, #0f172a);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .btn-close-white {
          background: rgba(255, 255, 255, 0.15);
          border: none;
          color: #ffffff;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;

          &:hover {
            background: rgba(255, 255, 255, 0.3);
          }
        }
      }

      .modal-body-info {
        padding: 24px;
      }

      .modal-footer-info {
        padding: 14px 24px;
        background: #f8fafc;
        border-top: 1px solid #e2e8f0;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }

      .client-detail-rows {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .detail-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 8px;
        border-bottom: 1px dashed #e2e8f0;

        .detail-label {
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
        }

        .detail-val {
          font-size: 14px;
          color: #0f172a;
        }
      }
    `,
  ],
})
export class ClientInfoModalComponent {
  readonly state = inject(ClientStateService);

  selectedMonth = 'September';
  selectedYear = '2026';

  readonly months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  profile() {
    return this.state.pendingProfile() || this.state.activeProfile();
  }

  confirmImport(): void {
    this.state.confirmProfileImport(this.selectedMonth, this.selectedYear);
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.state.closeClientInfoModal();
    }
  }
}
