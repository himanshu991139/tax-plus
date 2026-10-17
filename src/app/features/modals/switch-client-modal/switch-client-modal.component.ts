import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientStateService } from '../../../core/services/client-state.service';
import { GstProfile } from '../../../core/models/client-info.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { GST_STATE_MAP } from '../../../core/utils/state-codes';

@Component({
  selector: 'app-switch-client-modal',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    @if (state.isSwitchClientModalOpen()) {
      <div class="modal-overlay" (click)="onBackdropClick($event)">
        <div class="modal-dialog-custom" (click)="$event.stopPropagation()">
          <!-- Modal Header -->
          <div class="modal-header-custom">
            <div class="d-flex align-items-center gap-2">
              <app-icon name="switch" [size]="18" class="text-white"></app-icon>
              <h3 class="m-0 fs-5 fw-bold text-white">Switch Client Profile</h3>
            </div>
            <button type="button" class="btn-close-custom" (click)="close()" aria-label="Close">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body-custom">
            <!-- Quick Client Profiles List from State -->
            <div class="mb-4">
              <label class="form-label fw-semibold small text-muted">Quick Client Profiles</label>
              <div class="d-flex flex-column gap-2 profile-list-container">
                @for (profile of state.profiles(); track profile.id) {
                  <div
                    class="preset-client-card"
                    [class.active]="currentProfile()?.id === profile.id"
                    (click)="selectProfile(profile)"
                  >
                    <div class="d-flex align-items-center justify-content-between">
                      <div>
                        <strong class="d-block text-dark">{{ profile.companyName }}</strong>
                        <div class="small text-muted font-mono">
                          {{ profile.gstin }} (State: {{ profile.sellerStateCode }})
                        </div>
                      </div>
                      <span class="badge bg-light text-dark border">{{ profile.period || 'September 2026' }}</span>
                    </div>
                  </div>
                } @empty {
                  <div class="p-3 text-center text-muted small bg-light rounded border">
                    No client profiles found. Add a profile first.
                  </div>
                }
              </div>
            </div>

            <hr class="my-3 text-muted" />

            <!-- Read-only Details of Selected Client -->
            <div class="profile-details-section">
              <div class="small fw-semibold text-muted mb-2">Profile Details (View Only)</div>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label small fw-semibold text-muted">Company Name</label>
                  <input
                    type="text"
                    class="form-control"
                    [value]="currentProfile()?.companyName || ''"
                    disabled
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-semibold text-muted">Client Name</label>
                  <input
                    type="text"
                    class="form-control"
                    [value]="currentProfile()?.ownerName || ''"
                    disabled
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-semibold text-muted">GSTIN</label>
                  <input
                    type="text"
                    class="form-control font-mono"
                    [value]="currentProfile()?.gstin || ''"
                    disabled
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-semibold text-muted">Seller State</label>
                  <input
                    type="text"
                    class="form-control font-mono"
                    [value]="getStateDisplay(currentProfile()?.sellerStateCode)"
                    disabled
                  />
                </div>
                <div class="col-md-12">
                  <label class="form-label small fw-semibold text-muted">Filing Period</label>
                  <input
                    type="text"
                    class="form-control"
                    [value]="currentProfile()?.period || 'September 2026'"
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer-custom">
            <button type="button" class="btn btn-outline-secondary" (click)="close()">
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-brand-indigo"
              (click)="applySwitch()"
              [disabled]="!currentProfile()"
            >
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
          transition: background 0.15s;

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

      .profile-list-container {
        max-height: 220px;
        overflow-y: auto;
        padding-right: 2px;
      }

      .preset-client-card {
        padding: 10px 14px;
        border: 1.5px solid #e2e8f0;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.15s;

        &:hover {
          background: #f8fafc;
          border-color: #6366f1;
        }

        &.active {
          border-color: #4f46e5;
          background: #eff6ff;
          box-shadow: 0 0 0 1px #4f46e5;
        }
      }

      .form-control:disabled {
        background-color: #f8fafc;
        border-color: #e2e8f0;
        color: #1e293b;
        font-weight: 500;
        cursor: not-allowed;
      }

      .modal-footer-custom {
        padding: 14px 20px;
        background: #f8fafc;
        border-top: 1px solid #e2e8f0;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }
    `,
  ],
})
export class SwitchClientModalComponent {
  readonly state = inject(ClientStateService);

  readonly selectedProfile = signal<GstProfile | null>(null);

  currentProfile(): GstProfile | null {
    return this.selectedProfile() || this.state.activeProfile() || this.state.profiles()[0] || null;
  }

  selectProfile(profile: GstProfile): void {
    this.selectedProfile.set(profile);
  }

  getStateDisplay(code?: string): string {
    if (!code) return '';
    const name = GST_STATE_MAP[code];
    return name ? `${code} - ${name}` : code;
  }

  applySwitch(): void {
    const selected = this.currentProfile();
    if (!selected) return;

    this.state.setActiveProfile(selected);
    this.state.showToast(`Switched active client to "${selected.companyName}"!`, 'success');
    this.close();
  }

  close(): void {
    this.selectedProfile.set(null);
    this.state.closeSwitchClientModal();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close();
    }
  }
}
