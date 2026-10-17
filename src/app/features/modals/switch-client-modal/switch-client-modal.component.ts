import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientStateService } from '../../../core/services/client-state.service';
import { ClientInfo } from '../../../core/models/client-info.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { GST_STATE_MAP } from '../../../core/utils/state-codes';

@Component({
  selector: 'app-switch-client-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    @if (state.isSwitchClientModalOpen()) {
      <div class="modal-overlay" (click)="onBackdropClick($event)">
        <div class="modal-dialog-custom" (click)="$event.stopPropagation()">
          <div class="modal-header-custom">
            <div class="d-flex align-items-center gap-2">
              <app-icon name="switch" [size]="18" class="text-white"></app-icon>
              <h3 class="m-0 fs-5 fw-bold text-white">Switch Client Profile</h3>
            </div>
            <button type="button" class="btn-close-custom" (click)="state.closeSwitchClientModal()" aria-label="Close">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <div class="modal-body-custom">
            <!-- Preset Clients -->
            <div class="mb-4">
              <label class="form-label fw-semibold small text-muted">Quick Client Profiles</label>
              <div class="d-flex flex-column gap-2">
                @for (preset of presetClients; track preset.gstin) {
                  <div
                    class="preset-client-card"
                    [class.active]="formClient.gstin === preset.gstin"
                    (click)="selectPreset(preset)"
                  >
                    <div class="d-flex align-items-center justify-content-between">
                      <div>
                        <strong>{{ preset.company }}</strong>
                        <div class="small text-muted font-mono">{{ preset.gstin }} (State: {{ preset.sellerStateCode }})</div>
                      </div>
                      <span class="badge bg-light text-dark border">{{ preset.period }}</span>
                    </div>
                  </div>
                }
              </div>
            </div>

            <hr class="my-3 text-muted" />

            <!-- Edit Custom Form -->
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label small fw-semibold text-muted">Company Name</label>
                <input type="text" class="form-control" [(ngModel)]="formClient.company" />
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-semibold text-muted">Client Name</label>
                <input type="text" class="form-control" [(ngModel)]="formClient.client" />
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-semibold text-muted">GSTIN</label>
                <input type="text" class="form-control font-mono" [(ngModel)]="formClient.gstin" maxlength="15" />
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-semibold text-muted">Seller State</label>
                <select class="form-select font-mono" [(ngModel)]="formClient.sellerStateCode">
                  @for (s of statesList; track s.code) {
                    <option [value]="s.code">{{ s.code }} - {{ s.name }}</option>
                  }
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label small fw-semibold text-muted">Period (Display)</label>
                <input type="text" class="form-control" [(ngModel)]="formClient.period" />
              </div>
              <div class="col-md-4">
                <label class="form-label small fw-semibold text-muted">Period Code (MMYYYY)</label>
                <input type="text" class="form-control font-mono" [(ngModel)]="formClient.periodCode" maxlength="6" />
              </div>
              <div class="col-md-4">
                <label class="form-label small fw-semibold text-muted">Type</label>
                <select class="form-select" [(ngModel)]="formClient.type">
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                </select>
              </div>
            </div>
          </div>

          <div class="modal-footer-custom">
            <button type="button" class="btn btn-outline-secondary" (click)="state.closeSwitchClientModal()">
              Cancel
            </button>
            <button type="button" class="btn btn-primary-navy" (click)="saveClient()">
              Save & Apply
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
        max-width: 600px;
        overflow: hidden;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
      }

      .modal-header-custom {
        padding: 16px 20px;
        background: linear-gradient(135deg, #1e293b, #0f172a);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .btn-close-custom {
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
        padding: 20px;
        max-height: 75vh;
        overflow-y: auto;
      }

      .modal-footer-custom {
        padding: 14px 20px;
        background: #f8fafc;
        border-top: 1px solid #e2e8f0;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }

      .preset-client-card {
        padding: 10px 14px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.15s;

        &:hover {
          background: #f8fafc;
          border-color: #3b82f6;
        }

        &.active {
          border-color: #1a2b6d;
          background: #eff6ff;
        }
      }
    `,
  ],
})
export class SwitchClientModalComponent {
  readonly state = inject(ClientStateService);

  formClient: ClientInfo = { ...this.state.clientInfo() };

  readonly statesList = Object.entries(GST_STATE_MAP).map(([code, name]) => ({ code, name }));

  readonly presetClients: ClientInfo[] = [
    {
      company: 'dsdivine13',
      client: 'dsdivine13',
      gstin: '09OYVPS2177B2ZI',
      period: 'September 2026',
      periodCode: '092026',
      type: 'Monthly',
      year: '2026',
      sellerStateCode: '09',
    },
    {
      company: 'Astra Ecom Solutions',
      client: 'AstraRetail',
      gstin: '27AARCA1234F1Z5',
      period: 'September 2026',
      periodCode: '092026',
      type: 'Monthly',
      year: '2026',
      sellerStateCode: '27',
    },
    {
      company: 'Zenith Global Enterprise',
      client: 'ZenithStore',
      gstin: '29ABCDE1234F2Z5',
      period: 'September 2026',
      periodCode: '092026',
      type: 'Monthly',
      year: '2026',
      sellerStateCode: '29',
    },
  ];

  selectPreset(preset: ClientInfo): void {
    this.formClient = { ...preset };
  }

  saveClient(): void {
    this.state.clientInfo.set(this.formClient);
    this.state.showToast('Client details updated successfully!', 'success');
    this.state.closeSwitchClientModal();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.state.closeSwitchClientModal();
    }
  }
}
