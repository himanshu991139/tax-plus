import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ClientStateService } from '../../../core/services/client-state.service';
import { GstApiService } from '../../../core/services/gst-api.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';
import { getStateName } from '../../../core/utils/state-codes';
import { Gstr1Payload } from '../../../core/models/gstr1.model';

@Component({
  selector: 'app-statement-modal',
  standalone: true,
  imports: [CommonModule, MatTabsModule, MatTooltipModule, IconComponent, InrCurrencyPipe],
  template: `
    @if (state.isStatementModalOpen()) {
      <div class="modal-overlay" (click)="onBackdropClick($event)">
        <div class="modal-dialog-large" (click)="$event.stopPropagation()">
          <!-- Header -->
          <div class="modal-header-custom">
            <div class="d-flex align-items-center gap-2">
              <app-icon name="file-text" [size]="20" class="text-white"></app-icon>
              <div>
                <h3 class="m-0 fw-bold fs-5 text-white">GSTR-1 Statement Summary</h3>
                <div class="statement-subtitle text-white-50 small">
                  GSTIN: <span class="font-mono text-white">{{ state.clientInfo().gstin }}</span> | Period:
                  <span class="text-white">{{ state.clientInfo().period }}</span>
                </div>
              </div>
            </div>

            <div class="d-flex align-items-center gap-2">
              @if (state.gstr1Payload()) {
                <button type="button" class="btn btn-sm btn-outline-light d-flex align-items-center gap-1" (click)="downloadJson()">
                  <app-icon name="download" [size]="14"></app-icon>
                  <span>Export JSON</span>
                </button>
              }
              <button type="button" class="btn-close-custom" (click)="state.closeStatementModal()" aria-label="Close">
                <app-icon name="x" [size]="18"></app-icon>
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="modal-body-custom">
            @if (state.gstr1Payload(); as gstr1) {
              <!-- Metrics Cards Row -->
              <div class="row g-2 mb-4">
                <div class="col-6 col-md-3">
                  <div class="metric-card">
                    <span class="metric-title">Taxable Value</span>
                    <span class="metric-val text-primary">{{ summary()?.totalTaxableValue | inrCurrency }}</span>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="metric-card">
                    <span class="metric-title">Total Tax (IGST+CGST+SGST)</span>
                    <span class="metric-val text-success">{{ summary()?.totalTax | inrCurrency }}</span>
                  </div>
                </div>
                <div class="col-6 col-md-2">
                  <div class="metric-card">
                    <span class="metric-title">IGST</span>
                    <span class="metric-val">{{ summary()?.totalIgst | inrCurrency }}</span>
                  </div>
                </div>
                <div class="col-6 col-md-2">
                  <div class="metric-card">
                    <span class="metric-title">CGST / SGST</span>
                    <span class="metric-val">{{ summary()?.totalCgst | inrCurrency }}</span>
                  </div>
                </div>
                <div class="col-6 col-md-2">
                  <div class="metric-card">
                    <span class="metric-title">Net Invoices</span>
                    <span class="metric-val text-dark">{{ summary()?.netInvoices || 0 }}</span>
                  </div>
                </div>
              </div>

              <!-- Mat Tabs for Tables -->
              <mat-tab-group animationDuration="150ms">
                <!-- Tab 1: Table 7 B2CS -->
                <mat-tab label="Table 7 (B2CS Supplies)">
                  <div class="tab-table-container">
                    <div class="table-info-strip d-flex justify-content-between align-items-center mb-2">
                      <span class="small text-muted">
                        Taxable supplies to unregistered persons (net of returns, segregated by POS)
                      </span>
                      <span class="badge bg-secondary">{{ gstr1.b2cs?.length || 0 }} State Entries</span>
                    </div>

                    <div class="table-responsive border rounded">
                      <table class="table table-hover table-striped align-middle mb-0">
                        <thead class="table-light">
                          <tr>
                            <th>#</th>
                            <th>Supply Type</th>
                            <th>POS</th>
                            <th>State Name</th>
                            <th class="text-end">Rate</th>
                            <th class="text-end">Taxable Value (₹)</th>
                            <th class="text-end">IGST (₹)</th>
                            <th class="text-end">CGST (₹)</th>
                            <th class="text-end">SGST (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          @for (item of gstr1.b2cs; track $index) {
                            <tr [class.table-warning]="item.txval < 0">
                              <td>{{ $index + 1 }}</td>
                              <td>
                                <span class="badge" [class.bg-primary]="item.sply_ty === 'INTER'" [class.bg-success]="item.sply_ty === 'INTRA'">
                                  {{ item.sply_ty }}
                                </span>
                              </td>
                              <td class="font-mono fw-bold">{{ item.pos }}</td>
                              <td>{{ getState(item.pos) }}</td>
                              <td class="text-end">{{ item.rt }}%</td>
                              <td class="text-end font-mono" [class.text-danger]="item.txval < 0">
                                {{ item.txval | inrCurrency: false }}
                              </td>
                              <td class="text-end font-mono">{{ item.iamt || 0 | inrCurrency: false }}</td>
                              <td class="text-end font-mono">{{ item.camt || 0 | inrCurrency: false }}</td>
                              <td class="text-end font-mono">{{ item.samt || 0 | inrCurrency: false }}</td>
                            </tr>
                          }
                        </tbody>
                        <tfoot class="table-light fw-bold">
                          <tr>
                            <td colspan="5" class="text-end">Total:</td>
                            <td class="text-end font-mono text-primary">{{ summary()?.totalTaxableValue | inrCurrency }}</td>
                            <td class="text-end font-mono">{{ summary()?.totalIgst | inrCurrency }}</td>
                            <td class="text-end font-mono">{{ summary()?.totalCgst | inrCurrency }}</td>
                            <td class="text-end font-mono">{{ summary()?.totalSgst | inrCurrency }}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </mat-tab>

                <!-- Tab 2: Table 12 HSN Summary -->
                <mat-tab label="Table 12 (HSN Summary)">
                  <div class="tab-table-container">
                    <div class="table-responsive border rounded mt-2">
                      <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                          <tr>
                            <th>HSN Code</th>
                            <th>Description</th>
                            <th>UQC</th>
                            <th class="text-end">Total Qty</th>
                            <th class="text-end">Tax Rate</th>
                            <th class="text-end">Taxable Value (₹)</th>
                            <th class="text-end">IGST (₹)</th>
                            <th class="text-end">CGST (₹)</th>
                            <th class="text-end">SGST (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          @for (hsn of gstr1.hsn?.hsn_b2c; track hsn.num) {
                            <tr>
                              <td class="font-mono fw-bold">{{ hsn.hsn_sc }}</td>
                              <td>{{ hsn.user_desc || 'General Goods' }}</td>
                              <td><span class="badge bg-light text-dark border">{{ hsn.uqc }}</span></td>
                              <td class="text-end font-mono">{{ hsn.qty }}</td>
                              <td class="text-end">{{ hsn.rt }}%</td>
                              <td class="text-end font-mono text-primary">{{ hsn.txval | inrCurrency: false }}</td>
                              <td class="text-end font-mono">{{ hsn.iamt || 0 | inrCurrency: false }}</td>
                              <td class="text-end font-mono">{{ hsn.camt || 0 | inrCurrency: false }}</td>
                              <td class="text-end font-mono">{{ hsn.samt || 0 | inrCurrency: false }}</td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>
                  </div>
                </mat-tab>

                <!-- Tab 3: Table 14 Supeco -->
                <mat-tab label="Table 14 (E-Commerce Supplies)">
                  <div class="tab-table-container">
                    <div class="table-responsive border rounded mt-2">
                      <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                          <tr>
                            <th>E-Commerce Operator GSTIN (ETIN)</th>
                            <th class="text-end">Supplies Value (₹)</th>
                            <th class="text-end">IGST (₹)</th>
                            <th class="text-end">CGST (₹)</th>
                            <th class="text-end">SGST (₹)</th>
                            <th class="text-center">Flag</th>
                          </tr>
                        </thead>
                        <tbody>
                          @for (eco of gstr1.supeco?.clttx; track $index) {
                            <tr>
                              <td class="font-mono fw-bold">{{ eco.etin }} (Meesho)</td>
                              <td class="text-end font-mono text-primary">{{ eco.suppval | inrCurrency: false }}</td>
                              <td class="text-end font-mono">{{ eco.igst || 0 | inrCurrency: false }}</td>
                              <td class="text-end font-mono">{{ eco.cgst || 0 | inrCurrency: false }}</td>
                              <td class="text-end font-mono">{{ eco.sgst || 0 | inrCurrency: false }}</td>
                              <td class="text-center"><span class="badge bg-secondary">{{ eco.flag }}</span></td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>
                  </div>
                </mat-tab>

                <!-- Tab 4: Table 13 Documents Issued -->
                <mat-tab label="Table 13 (Documents)">
                  <div class="tab-table-container">
                    <div class="table-responsive border rounded mt-2">
                      <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                          <tr>
                            <th>Nature of Document</th>
                            <th>Serial Number From</th>
                            <th>Serial Number To</th>
                            <th class="text-end">Total Number</th>
                            <th class="text-end">Cancelled</th>
                            <th class="text-end">Net Issued</th>
                          </tr>
                        </thead>
                        <tbody>
                          @for (det of gstr1.doc_issue?.doc_det; track det.doc_num) {
                            @for (doc of det.docs; track doc.num) {
                              <tr>
                                <td class="fw-semibold">{{ det.doc_typ }}</td>
                                <td class="font-mono">{{ doc.from }}</td>
                                <td class="font-mono">{{ doc.to }}</td>
                                <td class="text-end font-mono">{{ doc.totnum }}</td>
                                <td class="text-end font-mono text-danger">{{ doc.cancel }}</td>
                                <td class="text-end font-mono text-success fw-bold">{{ doc.net_issue }}</td>
                              </tr>
                            }
                          }
                        </tbody>
                      </table>
                    </div>
                  </div>
                </mat-tab>

                <!-- Tab 5: Raw JSON View -->
                <mat-tab label="Official JSON Payload">
                  <div class="tab-table-container">
                    <div class="d-flex justify-content-between align-items-center my-2">
                      <span class="small text-muted">Direct output ready for official GST portal or Offline Tool</span>
                      <button type="button" class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" (click)="copyJson()">
                        <app-icon name="copy" [size]="14"></app-icon>
                        <span>{{ isCopied() ? 'Copied!' : 'Copy to Clipboard' }}</span>
                      </button>
                    </div>
                    <pre class="json-code-box"><code>{{ formattedJson() }}</code></pre>
                  </div>
                </mat-tab>
              </mat-tab-group>
            } @else {
              <!-- Empty State -->
              <div class="text-center py-5">
                <div class="empty-icon-circle mx-auto mb-3">
                  <app-icon name="file-text" [size]="32" class="text-muted"></app-icon>
                </div>
                <h4 class="fw-bold text-dark">No statement data generated yet</h4>
                <p class="text-muted small max-w-400 mx-auto mb-4">
                  Upload your Meesho sales or return reports to convert them into a verified GSTR-1 statement, or load
                  sample data to explore the statement.
                </p>
                <button
                  type="button"
                  class="btn btn-primary-navy d-inline-flex align-items-center gap-2"
                  (click)="openUploadModal()"
                >
                  <app-icon name="cloud-upload" [size]="16"></app-icon>
                  <span>Upload Meesho Data</span>
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .modal-dialog-large {
        background: #ffffff;
        border-radius: 12px;
        width: 100%;
        max-width: 1050px;
        max-height: 92vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        overflow: hidden;
      }

      .modal-header-custom {
        padding: 16px 24px;
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
        padding: 24px;
        overflow-y: auto;
        flex: 1;
      }

      .metric-card {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 10px 14px;
        display: flex;
        flex-direction: column;

        .metric-title {
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
        }

        .metric-val {
          font-size: 16px;
          font-weight: 700;
          margin-top: 2px;
        }
      }

      .tab-table-container {
        padding: 16px 0;
      }

      .json-code-box {
        background: #0f172a;
        color: #e2e8f0;
        padding: 16px;
        border-radius: 8px;
        max-height: 420px;
        overflow-y: auto;
        font-family: 'JetBrains Mono', monospace;
        font-size: 12px;
      }

      .empty-icon-circle {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: #f1f5f9;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .max-w-400 {
        max-width: 400px;
      }
    `,
  ],
})
export class StatementModalComponent {
  readonly state = inject(ClientStateService);
  private readonly gstApi = inject(GstApiService);

  readonly isCopied = signal<boolean>(false);

  summary() {
    return this.state.gstr1Summary();
  }

  formattedJson(): string {
    const payload = this.state.gstr1Payload();
    return payload ? JSON.stringify(payload, null, 2) : '';
  }

  getState(pos: string): string {
    return getStateName(pos);
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.state.closeStatementModal();
    }
  }

  downloadJson(): void {
    const payload = this.state.gstr1Payload();
    if (payload) {
      this.gstApi.downloadJsonFile(payload, `GSTR1_Meesho_${this.state.clientInfo().periodCode}.json`);
    }
  }

  copyJson(): void {
    const jsonStr = this.formattedJson();
    navigator.clipboard.writeText(jsonStr).then(() => {
      this.isCopied.set(true);
      this.state.showToast('GSTR-1 JSON copied to clipboard!', 'success');
      setTimeout(() => this.isCopied.set(false), 2500);
    });
  }

  openUploadModal(): void {
    this.state.closeStatementModal();
    const meesho = this.state.platforms().find((p) => p.id === 'meesho-b2c');
    if (meesho) {
      this.state.openUploadModal(meesho);
    }
  }
}
