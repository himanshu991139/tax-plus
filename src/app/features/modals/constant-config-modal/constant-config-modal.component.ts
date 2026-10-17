import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientStateService } from '../../../core/services/client-state.service';
import { ConstantConfig } from '../../../core/models/client-info.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { GST_STATE_MAP } from '../../../core/utils/state-codes';

@Component({
  selector: 'app-constant-config-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    @if (state.isConstantConfigModalOpen()) {
      <div class="modal-overlay" (click)="onBackdropClick($event)">
        <div class="modal-dialog-custom" (click)="$event.stopPropagation()">
          <div class="modal-header-config">
            <div class="d-flex align-items-center gap-2">
              <app-icon name="settings" [size]="18" class="text-white"></app-icon>
              <h3 class="m-0 fs-5 fw-bold text-white">System Configuration & Constants</h3>
            </div>
            <button type="button" class="btn-close-white" (click)="state.closeConstantConfigModal()" aria-label="Close">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <div class="modal-body-custom">
            <div class="mb-3">
              <label class="form-label small fw-bold text-dark">Backend API Endpoint URL</label>
              <input type="text" class="form-control font-mono" [(ngModel)]="formConfig.apiBaseUrl" />
              <small class="text-muted">Spring Boot Meesho GSTR-1 converter endpoint</small>
            </div>

            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <label class="form-label small fw-bold text-dark">Current Filing Period Tracker</label>
                <input type="text" class="form-control" [(ngModel)]="formConfig.currentFilingPeriod" />
                <small class="text-muted">e.g. 9/15</small>
              </div>

              <div class="col-md-6">
                <label class="form-label small fw-bold text-dark">Deadline Days Left</label>
                <input type="number" class="form-control" [(ngModel)]="formConfig.filingDeadlineDaysLeft" />
                <small class="text-muted">e.g. 6</small>
              </div>
            </div>

            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <label class="form-label small fw-bold text-dark">Max Profiles Allowed</label>
                <input type="number" class="form-control" [(ngModel)]="formConfig.maxProfilesAllowed" />
                <small class="text-muted">Default limit: 10</small>
              </div>

              <div class="col-md-6">
                <label class="form-label small fw-bold text-dark">Default GST State Code</label>
                <select class="form-select font-mono" [(ngModel)]="formConfig.defaultStateCode">
                  @for (s of statesList; track s.code) {
                    <option [value]="s.code">{{ s.code }} - {{ s.name }}</option>
                  }
                </select>
              </div>
            </div>

            <div class="p-3 bg-light rounded border">
              <h6 class="fw-bold mb-2 small text-dark">Supported GST Rates</h6>
              <div class="d-flex gap-2">
                @for (rate of formConfig.taxRatesSupported; track rate) {
                  <span class="badge bg-primary-subtle text-primary border">{{ rate }}%</span>
                }
              </div>
            </div>
          </div>

          <div class="modal-footer-custom">
            <button type="button" class="btn btn-outline-secondary" (click)="state.closeConstantConfigModal()">
              Cancel
            </button>
            <button type="button" class="btn btn-brand-indigo" (click)="saveConfig()">
              Save Configuration
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
        border-radius: 12px;
        width: 100%;
        max-width: 580px;
        overflow: hidden;
        box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.35);
      }

      .modal-header-config {
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

      .modal-body-custom {
        padding: 24px;
      }

      .modal-footer-custom {
        padding: 14px 24px;
        background: #f8fafc;
        border-top: 1px solid #e2e8f0;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }
    `,
  ],
})
export class ConstantConfigModalComponent {
  readonly state = inject(ClientStateService);

  formConfig: ConstantConfig = { ...this.state.constantConfig() };

  readonly statesList = Object.entries(GST_STATE_MAP).map(([code, name]) => ({ code, name }));

  saveConfig(): void {
    this.state.updateConstantConfig(this.formConfig);
    this.state.closeConstantConfigModal();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.state.closeConstantConfigModal();
    }
  }
}
