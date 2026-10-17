import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ClientStateService } from '../../../core/services/client-state.service';
import { GstApiService } from '../../../core/services/gst-api.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { PlatformLogoComponent } from '../../../shared/components/platform-logo/platform-logo.component';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';
import { Gstr1Payload, Gstr1Summary } from '../../../core/models/gstr1.model';
import { GST_STATE_MAP } from '../../../core/utils/state-codes';

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
    InrCurrencyPipe,
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

            @if (conversionSuccess(); as result) {
              <!-- Success Banner & Summary -->
              <div class="success-result-box mb-4">
                <div class="d-flex align-items-center gap-2 mb-3">
                  <div class="success-check-badge">
                    <app-icon name="check" [size]="20"></app-icon>
                  </div>
                  <div>
                    <h4 class="m-0 text-success fw-bold">GSTR-1 JSON Generated Successfully!</h4>
                    <small class="text-muted">The file has been prepared according to official GSTN Schema.</small>
                  </div>
                </div>

                <!-- Stats summary grid -->
                <div class="row g-2 mb-3">
                  <div class="col-6 col-md-3">
                    <div class="stat-mini-card">
                      <div class="stat-label">Taxable Value</div>
                      <div class="stat-num text-primary">{{ summary()?.totalTaxableValue | inrCurrency }}</div>
                    </div>
                  </div>
                  <div class="col-6 col-md-3">
                    <div class="stat-mini-card">
                      <div class="stat-label">Total Tax</div>
                      <div class="stat-num text-dark">{{ summary()?.totalTax | inrCurrency }}</div>
                    </div>
                  </div>
                  <div class="col-6 col-md-3">
                    <div class="stat-mini-card">
                      <div class="stat-label">Net Invoices</div>
                      <div class="stat-num text-info">{{ summary()?.netInvoices || 0 }}</div>
                    </div>
                  </div>
                  <div class="col-6 col-md-3">
                    <div class="stat-mini-card">
                      <div class="stat-label">POS States</div>
                      <div class="stat-num text-secondary">{{ summary()?.posCount || 0 }}</div>
                    </div>
                  </div>
                </div>

                <div class="d-flex flex-wrap gap-2 justify-content-end">
                  <button type="button" class="btn btn-outline-primary btn-sm d-flex align-items-center gap-1" (click)="downloadJson()">
                    <app-icon name="download" [size]="14"></app-icon>
                    <span>Download JSON Again</span>
                  </button>
                  <button type="button" class="btn btn-primary-navy btn-sm d-flex align-items-center gap-1" (click)="viewStatement()">
                    <app-icon name="eye" [size]="14"></app-icon>
                    <span>View Full Statement</span>
                  </button>
                </div>
              </div>
            }

            <!-- Quick sample loader bar -->
            <div class="quick-sample-bar mb-3 d-flex align-items-center justify-content-between p-2 rounded bg-light border">
              <div class="d-flex align-items-center gap-2">
                <span class="badge bg-primary">Sample Data Ready</span>
                <small class="text-muted">Includes September 2026 TCS Sales, Returns & Invoices</small>
              </div>
              <button
                type="button"
                class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                (click)="loadSampleSeptemberData()"
                [disabled]="isLoadingSample() || isSubmitting()"
              >
                @if (isLoadingSample()) {
                  <span class="spinner-border spinner-border-sm" role="status"></span>
                  <span>Loading...</span>
                } @else {
                  <app-icon name="cloud-upload" [size]="14"></app-icon>
                  <span>Quick Load Sample Files</span>
                }
              </button>
            </div>

            <!-- Parameters Row -->
            <div class="row g-3 mb-3">
              <div class="col-md-5">
                <label class="form-label fw-semibold small text-muted">Seller GSTIN</label>
                <input
                  type="text"
                  class="form-control font-mono"
                  [(ngModel)]="formGstin"
                  placeholder="e.g. 09OYVPS2177B2ZI"
                  maxlength="15"
                />
              </div>
              <div class="col-md-3">
                <label class="form-label fw-semibold small text-muted">Filing Period (MMYYYY)</label>
                <input
                  type="text"
                  class="form-control font-mono"
                  [(ngModel)]="formPeriod"
                  placeholder="092026"
                  maxlength="6"
                />
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold small text-muted">Seller State Code</label>
                <select class="form-select font-mono" [(ngModel)]="formStateCode">
                  @for (stateEntry of statesList; track stateEntry.code) {
                    <option [value]="stateEntry.code">{{ stateEntry.code }} - {{ stateEntry.name }}</option>
                  }
                </select>
              </div>
            </div>

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

              <!-- File 2: TCS Sales Return (Optional) -->
              <div class="dropzone-box mt-3" [class.has-file]="returnFile()">
                <div class="dropzone-header">
                  <div class="dropzone-title">
                    <span class="badge bg-secondary-subtle text-secondary border me-1">Optional</span>
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

              <!-- File 3: Tax Invoice Details (Optional) -->
              <div class="dropzone-box mt-3" [class.has-file]="invoiceFile()">
                <div class="dropzone-header">
                  <div class="dropzone-title">
                    <span class="badge bg-secondary-subtle text-secondary border me-1">Optional</span>
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
                  Uploading files to Spring Boot API and aggregating GSTR-1 tables...
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
              [disabled]="!salesFile() || isSubmitting()"
            >
              @if (isSubmitting()) {
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span>Converting...</span>
              } @else {
                <app-icon name="cloud-upload" [size]="16"></app-icon>
                <span>Generate & Download GSTR-1</span>
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

  formGstin = '09OYVPS2177B2ZI';
  formPeriod = '092026';
  formStateCode = '09';

  readonly salesFile = signal<File | null>(null);
  readonly returnFile = signal<File | null>(null);
  readonly invoiceFile = signal<File | null>(null);

  readonly isSubmitting = signal<boolean>(false);
  readonly isLoadingSample = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly conversionSuccess = signal<Gstr1Payload | null>(null);
  readonly summary = signal<Gstr1Summary | null>(null);

  readonly statesList = Object.entries(GST_STATE_MAP).map(([code, name]) => ({ code, name }));

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

  async loadSampleSeptemberData(): Promise<void> {
    this.isLoadingSample.set(true);
    this.errorMessage.set(null);
    try {
      const sales = await this.gstApi.loadSampleFile(
        '/sample-data/meesho_september_2026/tcs_sales.csv',
        'tcs_sales.csv',
        'text/csv'
      );
      const returns = await this.gstApi.loadSampleFile(
        '/sample-data/meesho_september_2026/tcs_sales_return.csv',
        'tcs_sales_return.csv',
        'text/csv'
      );
      const invoices = await this.gstApi.loadSampleFile(
        '/sample-data/meesho_september_2026/tax_invoice_details.csv',
        'tax_invoice_details.csv',
        'text/csv'
      );

      this.salesFile.set(sales);
      this.returnFile.set(returns);
      this.invoiceFile.set(invoices);
      this.formGstin = '09OYVPS2177B2ZI';
      this.formPeriod = '092026';
      this.formStateCode = '09';

      this.state.showToast('September 2026 sample CSV files loaded into form!', 'success');
    } catch (err: any) {
      this.errorMessage.set('Could not load sample data: ' + (err.message || err));
    } finally {
      this.isLoadingSample.set(false);
    }
  }

  submitConversion(): void {
    const sales = this.salesFile();
    if (!sales) {
      this.errorMessage.set('Please select the required TCS Sales Report file.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const formData = new FormData();
    formData.append('tcs_sales', sales);
    if (this.returnFile()) {
      formData.append('tcs_sales_return', this.returnFile()!);
    }
    if (this.invoiceFile()) {
      formData.append('tax_invoice_details', this.invoiceFile()!);
    }
    formData.append('gstin', this.formGstin.trim());
    formData.append('period', this.formPeriod.trim());
    formData.append('sellerStateCode', this.formStateCode.trim());

    this.gstApi.convertMeesho(formData).subscribe({
      next: (payload) => {
        this.isSubmitting.set(false);
        this.conversionSuccess.set(payload);
        const calculatedSummary = this.gstApi.calculateSummary(payload);
        this.summary.set(calculatedSummary);

        // Store into global state
        this.state.setGstr1Payload(payload);
        this.state.showToast('GSTR-1 JSON successfully generated & downloaded!', 'success');

        // Automatically trigger browser download of JSON file
        this.gstApi.downloadJsonFile(payload, `GSTR1_Meesho_${this.formPeriod.trim()}.json`);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.message || 'An error occurred during GST report conversion.');
      },
    });
  }

  downloadJson(): void {
    const payload = this.conversionSuccess();
    if (payload) {
      this.gstApi.downloadJsonFile(payload, `GSTR1_Meesho_${this.formPeriod.trim()}.json`);
    }
  }

  viewStatement(): void {
    this.state.closeUploadModal();
    this.state.openStatementModal();
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
