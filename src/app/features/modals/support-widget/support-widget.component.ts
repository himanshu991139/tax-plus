import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientStateService } from '../../../core/services/client-state.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-support-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <!-- Support Modal Dialog -->
    @if (state.isSupportModalOpen()) {
      <div class="modal-overlay" (click)="onBackdropClick($event)">
        <div class="modal-dialog-custom" (click)="$event.stopPropagation()">
          <div class="modal-header-custom">
            <div class="d-flex align-items-center gap-2">
              <app-icon name="support" [size]="18" class="text-white"></app-icon>
              <h3 class="m-0 fs-5 fw-bold text-white">Raise a Support Ticket</h3>
            </div>
            <button type="button" class="btn-close-custom" (click)="state.closeSupportModal()" aria-label="Close">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <div class="modal-body-custom">
            @if (ticketSubmitted()) {
              <div class="text-center py-4">
                <div class="success-icon-badge mx-auto mb-3">
                  <app-icon name="check" [size]="28"></app-icon>
                </div>
                <h4 class="fw-bold text-success">Ticket Submitted Successfully!</h4>
                <p class="text-muted small">
                  Ticket ID: <strong>#TKT-{{ ticketId() }}</strong><br />
                  Our GST compliance team will review your report within 2-4 hours.
                </p>
                <button type="button" class="btn btn-primary-navy btn-sm" (click)="state.closeSupportModal(); ticketSubmitted.set(false)">
                  Done
                </button>
              </div>
            } @else {
              <div class="mb-3">
                <label class="form-label small fw-semibold text-muted">Issue Category</label>
                <select class="form-select" [(ngModel)]="category">
                  <option value="meesho_conversion">Meesho GSTR-1 Conversion Error</option>
                  <option value="tax_mismatch">Table 7 (B2CS) Tax Netting Mismatch</option>
                  <option value="missing_hsn">Table 12 HSN Code Missing</option>
                  <option value="general">General Support / Feature Request</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold text-muted">Subject</label>
                <input type="text" class="form-control" [(ngModel)]="subject" placeholder="e.g. Issue converting September 2026 reports" />
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold text-muted">Description / Details</label>
                <textarea
                  class="form-control"
                  rows="4"
                  [(ngModel)]="description"
                  placeholder="Describe what occurred, any specific error message, or invoice series details..."
                ></textarea>
              </div>
            }
          </div>

          @if (!ticketSubmitted()) {
            <div class="modal-footer-custom">
              <button type="button" class="btn btn-outline-secondary" (click)="state.closeSupportModal()">
                Cancel
              </button>
              <button type="button" class="btn btn-primary-navy" (click)="submitTicket()" [disabled]="!subject.trim()">
                Submit Ticket
              </button>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [
    `
      .floating-support-btn {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 1040;
        background: linear-gradient(135deg, #4f46e5, #4338ca);
        color: #ffffff;
        border: none;
        border-radius: 9999px;
        padding: 8px 16px 8px 10px;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 8px 20px rgba(79, 70, 229, 0.4);
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(79, 70, 229, 0.55);
        }

        .support-icon-circle {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.18);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .support-text-col {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          line-height: 1.1;

          .support-title {
            font-size: 13px;
            font-weight: 700;
          }

          .support-sub {
            font-size: 10px;
            color: #c7d2fe;
          }
        }
      }

      .modal-dialog-custom {
        background: #ffffff;
        border-radius: 12px;
        width: 100%;
        max-width: 520px;
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
      }

      .modal-footer-custom {
        padding: 12px 20px;
        background: #f8fafc;
        border-top: 1px solid #e2e8f0;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }

      .success-icon-badge {
        width: 54px;
        height: 54px;
        border-radius: 50%;
        background: #ecfdf5;
        color: #10b981;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `,
  ],
})
export class SupportWidgetComponent {
  readonly state = inject(ClientStateService);

  category = 'meesho_conversion';
  subject = '';
  description = '';
  readonly ticketSubmitted = signal<boolean>(false);
  readonly ticketId = signal<number>(Math.floor(10000 + Math.random() * 90000));

  submitTicket(): void {
    this.ticketId.set(Math.floor(10000 + Math.random() * 90000));
    this.ticketSubmitted.set(true);
    this.state.showToast('Support ticket created successfully!', 'success');
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.state.closeSupportModal();
    }
  }
}
