import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientStateService } from '../../../core/services/client-state.service';
import { GstApiService } from '../../../core/services/gst-api.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { GST_STATE_MAP } from '../../../core/utils/state-codes';

@Component({
  selector: 'app-add-profile-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    @if (state.isAddProfileModalOpen()) {
      <div class="modal-overlay" (click)="onBackdropClick($event)">
        <div class="modal-dialog-custom" (click)="$event.stopPropagation()">
          <!-- Modal Header -->
          <div class="modal-header-brand">
            <div class="d-flex align-items-center gap-2">
              <div class="header-icon-circle">
                <app-icon name="building" [size]="18"></app-icon>
              </div>
              <h3 class="m-0 fs-5 fw-bold text-white">Add New GST Profile</h3>
            </div>
            <button type="button" class="btn-close-white" (click)="state.closeAddProfileModal()" aria-label="Close">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body-custom">
            <!-- GSTIN Field -->
            <div class="mb-3">
              <label class="form-label fw-bold small text-dark d-flex align-items-center gap-1">
                <app-icon name="id-card" [size]="15" class="text-primary"></app-icon>
                <span>GSTIN :</span>
              </label>
              <input
                type="text"
                class="form-control font-mono text-uppercase"
                placeholder="ENTER GSTIN OF THE CLIENT (E.G. 09AAACO4007A1Z3)"
                maxlength="15"
                [(ngModel)]="gstin"
                (ngModelChange)="onGstinChange($event)"
              />
              <div class="form-text text-danger small mt-1">
                Please ensure the GSTIN is entered correctly. Once added, it cannot be modified.
              </div>
              @if (detectedState()) {
                <div class="detected-state-pill mt-1">
                  <span>State Detected: <strong>{{ detectedState() }} (Code {{ stateCode() }})</strong></span>
                </div>
              }
            </div>

            <!-- Company Name -->
            <div class="mb-3">
              <label class="form-label fw-bold small text-dark d-flex align-items-center gap-1">
                <app-icon name="building" [size]="15" class="text-primary"></app-icon>
                <span>Company Name :</span>
              </label>
              <input
                type="text"
                class="form-control"
                placeholder="Enter the Company of the Client"
                [(ngModel)]="companyName"
              />
            </div>

            <!-- Owner Name -->
            <div class="mb-3">
              <label class="form-label fw-bold small text-dark d-flex align-items-center gap-1">
                <app-icon name="user" [size]="15" class="text-primary"></app-icon>
                <span>Owner Name :</span>
              </label>
              <input
                type="text"
                class="form-control"
                placeholder="Enter the Name of the Client"
                [(ngModel)]="ownerName"
              />
            </div>


            

            <!-- GST Username -->
            <div class="mb-3">
              <label class="form-label fw-bold small text-dark d-flex align-items-center gap-1">
                <app-icon name="user" [size]="15" class="text-primary"></app-icon>
                <span>GST Username :</span>
              </label>
              <input
                type="text"
                class="form-control"
                placeholder="Enter GST Username"
                [(ngModel)]="gstUsername"
              />
             
            </div>

          </div>

          <!-- Modal Footer -->
          <div class="modal-footer-custom">
            <button
              type="button"
              class="btn btn-outline-secondary"
              (click)="state.closeAddProfileModal()"
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-brand-indigo"
              (click)="saveProfile()"
              [disabled]="!gstin || !companyName || isSubmitting()"
            >
              {{ isSubmitting() ? 'Saving...' : 'Save Profile' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .modal-dialog-custom {
        background: #ffffff;
        border-radius: 14px;
        width: 100%;
        max-width: 620px;
        max-height: 90vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.35);
      }

      .modal-header-brand {
        padding: 16px 24px;
        background: linear-gradient(135deg, #1e293b, #0f172a);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .header-icon-circle {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
        }

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
          transition: background 0.15s;

          &:hover {
            background: rgba(255, 255, 255, 0.3);
          }
        }
      }

      .modal-body-custom {
        padding: 24px;
        overflow-y: auto;
      }

      .modal-footer-custom {
        padding: 14px 24px;
        background: #f8fafc;
        border-top: 1px solid #e2e8f0;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }

      .detected-state-pill {
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        color: #166534;
        font-size: 12px;
        padding: 4px 10px;
        border-radius: 6px;
      }
    `,
  ],
})
export class AddProfileModalComponent {
  readonly state = inject(ClientStateService);
  private readonly gstApi = inject(GstApiService);

  gstin = '';
  companyName = '';
  ownerName = '';
  gstUsername = '';
  gstPassword = '';

  readonly isSubmitting = signal<boolean>(false);
  readonly showPassword = signal<boolean>(false);
  readonly detectedState = signal<string | null>(null);
  readonly stateCode = signal<string>('09');

  onGstinChange(val: string): void {
    if (val && val.length >= 2) {
      const code = val.substring(0, 2);
      this.stateCode.set(code);
      const stateName = GST_STATE_MAP[code];
      if (stateName) {
        this.detectedState.set(stateName);
      } else {
        this.detectedState.set(null);
      }
    } else {
      this.detectedState.set(null);
    }
  }

  saveProfile(): void {
    const cleanGstin = this.gstin.trim().toUpperCase();
    const cleanCompanyName = this.companyName.trim();
    const cleanOwnerName = this.ownerName.trim() || cleanCompanyName;

    if (!cleanGstin || !cleanCompanyName) {
      this.state.showToast('Company Name and GSTIN are required.', 'error');
      return;
    }

    if (cleanGstin.length !== 15) {
      this.state.showToast('GSTIN must be 15 alphanumeric characters.', 'warning');
      return;
    }

    this.isSubmitting.set(true);

    this.gstApi.createCompany({
      companyName: cleanCompanyName,
      ownerName: cleanOwnerName,
      gstin: cleanGstin,
    }).subscribe({
      next: (created) => {
        this.isSubmitting.set(false);
        this.state.loadProfilesFromBackend();
        this.state.showToast(`GST Profile "${created.companyName}" created successfully!`, 'success');
        this.state.closeAddProfileModal();
        this.resetForm();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.state.showToast(err.message || 'Failed to create profile.', 'error');
      },
    });
  }

  private resetForm(): void {
    this.gstin = '';
    this.companyName = '';
    this.ownerName = '';
    this.gstUsername = '';
    this.gstPassword = '';
    this.detectedState.set(null);
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.state.closeAddProfileModal();
    }
  }
}
