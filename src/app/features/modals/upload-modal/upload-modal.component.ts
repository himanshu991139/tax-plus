import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ClientStateService } from '../../../core/services/client-state.service';
import { GstApiService } from '../../../core/services/gst-api.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { PlatformLogoComponent } from '../../../shared/components/platform-logo/platform-logo.component';

@Component({
  selector: 'app-upload-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatProgressBarModule,
    MatTooltipModule,
    IconComponent,
    PlatformLogoComponent,
  ],
  template: `
    @if (state.isUploadModalOpen()) {
      <div class="modal-overlay" (click)="onBackdropClick($event)">
        <div class="modal-dialog-custom" (click)="$event.stopPropagation()">
          <!-- Modal Header -->
          <div class="modal-header-custom">
            <div class="header-left-col">
              <div class="modal-platform-badge">
                <app-platform-logo [platform]="currentPlatformLogo()" class="header-mini-logo"></app-platform-logo>
                <div>
                  <h2 class="modal-title">
                    Import {{ state.selectedPlatform()?.name || 'Platform' }} Data
                  </h2>
                  <div class="modal-subtitle">
                    Filing Period: <strong>{{ state.clientInfo().period }}</strong> | GSTIN:
                    <span class="font-mono">{{ state.clientInfo().gstin }}</span>
                  </div>
                </div>
              </div>
            </div>

            <button type="button" class="btn-close-custom" (click)="state.closeUploadModal()" aria-label="Close">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body-custom">
            @if (errorMessage()) {
              <div class="alert alert-danger d-flex align-items-center gap-2 mb-3" role="alert">
                <app-icon name="alert" [size]="18"></app-icon>
                <div class="flex-grow-1">{{ errorMessage() }}</div>
                <button type="button" class="btn-close" (click)="errorMessage.set(null)"></button>
              </div>
            }


            <!-- Upload File Inputs -->
            <div class="file-dropzone-group">
              <!-- File 1: TCS Sales (Required) -->
              <div class="dropzone-box" [class.has-file]="salesFile()">
                <div class="dropzone-header">
                  <div class="dropzone-title">
                    <span class="badge bg-danger-subtle text-danger border border-danger-subtle me-1">Required</span>
                    <strong>TCS Sales Report</strong> (.xlsx or .csv)
                  </div>
                  <small class="text-muted">Meesho forward orders report (tcs_sales.csv/xlsx)</small>
                </div>

                @if (salesFile(); as file) {
                  <div class="selected-file-pill">
                    <div class="d-flex align-items-center gap-2">
                      <app-icon name="excel" [size]="20" class="text-success"></app-icon>
                      <span class="file-name">{{ file.name }}</span>
                      <span class="file-size text-muted">({{ formatBytes(file.size) }})</span>
                    </div>
                    <button type="button" class="btn-remove-file" (click)="salesFile.set(null)">
                      <app-icon name="x" [size]="14"></app-icon>
                    </button>
                  </div>
                } @else {
                  <label class="file-picker-label">
                    <input type="file" accept=".xlsx,.xls,.csv" (change)="onFileSelected($event, 'sales')" />
                    <app-icon name="cloud-upload" [size]="22" class="text-primary"></app-icon>
                    <span>Click or drag to choose <strong>tcs_sales</strong> file</span>
                  </label>
                }
              </div>

              <!-- File 2: TCS Sales Return (Required) -->
              <div class="dropzone-box mt-3" [class.has-file]="returnFile()">
                <div class="dropzone-header">
                  <div class="dropzone-title">
                    <span class="badge bg-danger-subtle text-danger border border-danger-subtle me-1">Required</span>
                    <strong>TCS Sales Return Report</strong> (.xlsx or .csv)
                  </div>
                  <small class="text-muted">Customer returns & RTOs report (tcs_sales_return.csv/xlsx)</small>
                </div>

                @if (returnFile(); as file) {
                  <div class="selected-file-pill">
                    <div class="d-flex align-items-center gap-2">
                      <app-icon name="excel" [size]="20" class="text-warning"></app-icon>
                      <span class="file-name">{{ file.name }}</span>
                      <span class="file-size text-muted">({{ formatBytes(file.size) }})</span>
                    </div>
                    <button type="button" class="btn-remove-file" (click)="returnFile.set(null)">
                      <app-icon name="x" [size]="14"></app-icon>
                    </button>
                  </div>
                } @else {
                  <label class="file-picker-label">
                    <input type="file" accept=".xlsx,.xls,.csv" (change)="onFileSelected($event, 'return')" />
                    <app-icon name="cloud-upload" [size]="22" class="text-secondary"></app-icon>
                    <span>Click or drag to choose <strong>tcs_sales_return</strong> file</span>
                  </label>
                }
              </div>

              <!-- File 3: Tax Invoice Details (Required) -->
              <div class="dropzone-box mt-3" [class.has-file]="invoiceFile()">
                <div class="dropzone-header">
                  <div class="dropzone-title">
                    <span class="badge bg-danger-subtle text-danger border border-danger-subtle me-1">Required</span>
                    <strong>Tax Invoice Details Report</strong> (.xlsx or .csv)
                  </div>
                  <small class="text-muted">Tax invoice document series report (tax_invoice_details.csv/xlsx)</small>
                </div>

                @if (invoiceFile(); as file) {
                  <div class="selected-file-pill">
                    <div class="d-flex align-items-center gap-2">
                      <app-icon name="csv" [size]="20" class="text-info"></app-icon>
                      <span class="file-name">{{ file.name }}</span>
                      <span class="file-size text-muted">({{ formatBytes(file.size) }})</span>
                    </div>
                    <button type="button" class="btn-remove-file" (click)="invoiceFile.set(null)">
                      <app-icon name="x" [size]="14"></app-icon>
                    </button>
                  </div>
                } @else {
                  <label class="file-picker-label">
                    <input type="file" accept=".xlsx,.xls,.csv" (change)="onFileSelected($event, 'invoice')" />
                    <app-icon name="cloud-upload" [size]="22" class="text-secondary"></app-icon>
                    <span>Click or drag to choose <strong>tax_invoice_details</strong> file</span>
                  </label>
                }
              </div>
            </div>

            @if (isSubmitting()) {
              <div class="mt-3">
                <mat-progress-bar mode="indeterminate"></mat-progress-bar>
                <div class="text-center mt-2 small text-primary fw-semibold">
                  Uploading reports and converting to GSTR-1...
                </div>
              </div>
            }
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer-custom">
            <button
              type="button"
              class="btn btn-outline-secondary"
              (click)="state.closeUploadModal()"
              [disabled]="isSubmitting()"
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-primary-navy d-flex align-items-center gap-2"
              (click)="submitConversion()"
              [disabled]="!salesFile() || !returnFile() || !invoiceFile() || isSubmitting()"
            >
              @if (isSubmitting()) {
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span>Submitting...</span>
              } @else {
                <app-icon name="check" [size]="16"></app-icon>
                <span>Submit</span>
              }
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
        max-width: 680px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08);
        overflow: hidden;
      }

      .modal-header-custom {
        padding: 16px 20px;
        background: linear-gradient(135deg, #1e293b, #0f172a);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .modal-platform-badge {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .modal-title {
          font-size: 17px;
          font-weight: 700;
          margin: 0;
          color: #ffffff;
        }

        .modal-subtitle {
          font-size: 12px;
          color: #cbd5e1;
          margin-top: 2px;
        }

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
        padding: 20px 24px;
        overflow-y: auto;
        flex: 1;
      }

      .modal-footer-custom {
        padding: 14px 24px;
        border-top: 1px solid #e2e8f0;
        background: #f8fafc;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 12px;
      }

      .file-dropzone-group {
        display: flex;
        flex-direction: column;
      }

      .dropzone-box {
        border: 1.5px dashed #cbd5e1;
        border-radius: 8px;
        padding: 12px 16px;
        background: #ffffff;
        transition: all 0.15s ease-in-out;

        &.has-file {
          border-color: #3b82f6;
          background: #f8fafc;
        }

        .dropzone-header {
          margin-bottom: 8px;
        }

        .dropzone-title {
          font-size: 13px;
          color: #1e293b;
        }
      }

      .file-picker-label {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 14px;
        background: #f8fafc;
        border-radius: 6px;
        cursor: pointer;
        margin: 0;
        font-size: 13px;
        color: #475569;
        transition: background 0.15s;

        &:hover {
          background: #f1f5f9;
        }

        input[type='file'] {
          display: none;
        }
      }

      .selected-file-pill {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #ffffff;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        padding: 8px 12px;

        .file-name {
          font-weight: 600;
          font-size: 13px;
          color: #0f172a;
        }

        .file-size {
          font-size: 12px;
        }

        .btn-remove-file {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 2px;
          display: flex;
          align-items: center;
          border-radius: 4px;

          &:hover {
            color: #ef4444;
          }
        }
      }

      .success-result-box {
        background: #ecfdf5;
        border: 1px solid #a7f3d0;
        border-radius: 10px;
        padding: 16px;

        .success-check-badge {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #10b981;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }

      .stat-mini-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 8px 10px;
        text-align: center;

        .stat-label {
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 600;
        }

        .stat-num {
          font-size: 15px;
          font-weight: 700;
          margin-top: 2px;
        }
      }
    `,
  ],
})
export class UploadModalComponent {
  readonly state = inject(ClientStateService);
  private readonly gstApi = inject(GstApiService);

  readonly salesFile = signal<File | null>(null);
  readonly returnFile = signal<File | null>(null);
  readonly invoiceFile = signal<File | null>(null);

  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  currentPlatformLogo(): string {
    return this.state.selectedPlatform()?.logoType || 'meesho';
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.state.closeUploadModal();
    }
  }

  onFileSelected(event: Event, type: 'sales' | 'return' | 'invoice'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (type === 'sales') this.salesFile.set(file);
      else if (type === 'return') this.returnFile.set(file);
      else if (type === 'invoice') this.invoiceFile.set(file);
    }
  }

  submitConversion(): void {
    const sales = this.salesFile();
    const returnF = this.returnFile();
    const invoiceF = this.invoiceFile();

    if (!sales || !returnF || !invoiceF) {
      this.errorMessage.set('All 3 reports (TCS Sales, TCS Sales Return, and Tax Invoice Details) are required.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const client = this.state.clientInfo();
    const gstin = client.gstin || '';
    const period = client.periodCode || '092026';
    const sellerStateCode = client.sellerStateCode || (gstin.length >= 2 ? gstin.substring(0, 2) : '09');

    const formData = new FormData();
    formData.append('tcs_sales', sales);
    formData.append('tcs_sales_return', returnF);
    formData.append('tax_invoice_details', invoiceF);
    formData.append('gstin', gstin);
    formData.append('period', period);
    formData.append('sellerStateCode', sellerStateCode);

    this.gstApi.convertMeesho(formData).subscribe({
      next: (payload) => {
        this.isSubmitting.set(false);
        this.state.setGstr1Payload(payload);
        this.state.showToast('Platform reports submitted successfully! View Statement and Generate & Download GSTR-1 are now available.', 'success');
        this.state.closeUploadModal();
        this.resetFiles();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.message || 'An error occurred during GST report conversion.');
      },
    });
  }

  resetFiles(): void {
    this.salesFile.set(null);
    this.returnFile.set(null);
    this.invoiceFile.set(null);
    this.errorMessage.set(null);
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
