import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ClientStateService } from '../../../core/services/client-state.service';
import { GstApiService } from '../../../core/services/gst-api.service';
import { getQuarterMonths, QuarterMonthInfo } from '../../../core/models/client-info.model';
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
  templateUrl: './upload-modal.component.html',
  styleUrl: './upload-modal.component.scss',
})
export class UploadModalComponent {
  readonly state = inject(ClientStateService);
  private readonly gstApi = inject(GstApiService);

  // For Meesho: 3 files (tcs_sales, tcs_sales_return, tax_invoice_details)
  // For Amazon: 1 file (MTR B2C report)
  readonly salesFile = signal<File | null>(null);
  readonly returnFile = signal<File | null>(null);
  readonly invoiceFile = signal<File | null>(null);
  readonly amazonMtrFile = signal<File | null>(null);

  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  // Quarterly filing support: 3 months of the active quarter
  readonly isQuarterly = computed(() => this.state.clientInfo().filingType === 'Quarterly');

  readonly quarterMonths = computed<QuarterMonthInfo[]>(() => {
    const c = this.state.clientInfo();
    return getQuarterMonths(c.quarter || 'Q2', c.financialYear || '2026-2027');
  });

  readonly selectedQuarterMonth = signal<QuarterMonthInfo | null>(null);

  constructor() {
    effect(() => {
      const months = this.quarterMonths();
      const current = this.selectedQuarterMonth();
      if (!current || !months.some((m) => m.periodCode === current.periodCode)) {
        this.selectedQuarterMonth.set(months[0] || null);
      }
    });
  }

  selectMonthTab(m: QuarterMonthInfo): void {
    if (this.selectedQuarterMonth()?.periodCode === m.periodCode) return;
    this.selectedQuarterMonth.set(m);
    this.resetFiles();
  }

  isMonthUploaded(periodCode: string): boolean {
    const platformId = this.state.selectedPlatform()?.id || '';
    return this.state.isQuarterMonthUploaded(platformId, periodCode);
  }

  uploadedMonthsCount(): number {
    const platformId = this.state.selectedPlatform()?.id || '';
    return this.quarterMonths().filter((m) => this.state.isQuarterMonthUploaded(platformId, m.periodCode)).length;
  }

  currentActiveMonth(): QuarterMonthInfo {
    return this.selectedQuarterMonth() || this.quarterMonths()[0];
  }

  effectivePeriodCode(): string {
    if (this.isQuarterly()) {
      return this.currentActiveMonth().periodCode;
    }
    const code = this.state.clientInfo().periodCode;
    return code && /^\d{6}$/.test(code) ? code : '092026';
  }

  /**
   * Whether the currently selected platform is Amazon.
   */
  isAmazonPlatform(): boolean {
    return this.state.selectedPlatform()?.id === 'amazon-b2c';
  }

  onBackdropClick(event?: MouseEvent): void {
    // Intentionally disabled: dialog only closes via close button or icon
  }

  /**
   * Allowed extensions for report files.
   */
  private static readonly ALLOWED_EXTENSIONS = ['.csv', '.xlsx', '.xls'];
  private static readonly MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

  onFileSelected(event: Event, type: 'sales' | 'return' | 'invoice' | 'amazonMtr'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
      if (!UploadModalComponent.ALLOWED_EXTENSIONS.includes(ext)) {
        this.errorMessage.set(`Invalid file type for "${file.name}". Please upload a .csv, .xlsx or .xls file.`);
        input.value = '';
        return;
      }

      if (file.size === 0) {
        this.errorMessage.set(`"${file.name}" is empty. Please choose a valid report file.`);
        input.value = '';
        return;
      }

      if (file.size > UploadModalComponent.MAX_FILE_SIZE_BYTES) {
        this.errorMessage.set(`"${file.name}" is ${this.formatBytes(file.size)}. Maximum allowed size is 10 MB.`);
        input.value = '';
        return;
      }

      // Check month match asynchronously
      if (type !== 'amazonMtr') {
        const activeMonth = this.isQuarterly() ? this.currentActiveMonth() : null;
        const expectedMonth = activeMonth
          ? parseInt(activeMonth.periodCode.substring(0, 2), 10)
          : parseInt(this.effectivePeriodCode().substring(0, 2), 10);
        const expectedMonthName = activeMonth
          ? activeMonth.monthName
          : this.getMonthName(expectedMonth);

        this.validateFileMonth(file, expectedMonth, expectedMonthName).then((err) => {
          if (err) {
            this.errorMessage.set(err);
            input.value = '';
            if (type === 'sales') this.salesFile.set(null);
            else if (type === 'return') this.returnFile.set(null);
            else if (type === 'invoice') this.invoiceFile.set(null);
          } else {
            this.errorMessage.set(null);
            if (type === 'sales') this.salesFile.set(file);
            else if (type === 'return') this.returnFile.set(file);
            else if (type === 'invoice') this.invoiceFile.set(file);
          }
        });
        return;
      }

      if (type === 'amazonMtr') {
        this.errorMessage.set(null);
        this.amazonMtrFile.set(file);
      }
    }
  }

  submitConversion(): void {
    if (this.isAmazonPlatform()) {
      this.submitAmazonConversion();
    } else {
      this.submitMeeshoConversion();
    }
  }

  private async submitMeeshoConversion(): Promise<void> {
    const sales = this.salesFile();
    const returnF = this.returnFile();
    const invoiceF = this.invoiceFile();

    if (!sales || !returnF || !invoiceF) {
      this.errorMessage.set('All 3 reports (TCS Sales, TCS Sales Return, and Tax Invoice Details) are required.');
      return;
    }

    const activeMonth = this.isQuarterly() ? this.currentActiveMonth() : null;
    const expectedMonth = activeMonth
      ? parseInt(activeMonth.periodCode.substring(0, 2), 10)
      : parseInt(this.effectivePeriodCode().substring(0, 2), 10);
    const expectedMonthName = activeMonth
      ? activeMonth.monthName
      : this.getMonthName(expectedMonth);

    // Validate all files for month consistency
    for (const f of [sales, returnF, invoiceF]) {
      const err = await this.validateFileMonth(f, expectedMonth, expectedMonthName);
      if (err) {
        this.errorMessage.set(err);
        return;
      }
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const client = this.state.clientInfo();
    const gstin = client.gstin || '';
    const period = this.effectivePeriodCode();
    const sellerStateCode = client.sellerStateCode || (gstin.length >= 2 ? gstin.substring(0, 2) : '09');
    const isQ = this.isQuarterly();
    const platformId = this.state.selectedPlatform()?.id || 'meesho-b2c';

    const formData = new FormData();
    formData.append('tcs_sales', sales);
    formData.append('tcs_sales_return', returnF);
    formData.append('tax_invoice_details', invoiceF);
    formData.append('gstin', gstin);
    formData.append('period', period);
    formData.append('sellerStateCode', sellerStateCode);
    if (isQ && client.quarter) {
      formData.append('quarter', client.quarter);
    }

    const request$ = isQ
      ? this.gstApi.convertMeeshoQuarterly(formData)
      : this.gstApi.convertMeesho(formData);

    request$.subscribe({
      next: (payload) => {
        this.isSubmitting.set(false);
        if (isQ) {
          this.state.setQuarterMonthPayload(platformId, period, payload);
          const monthName = this.currentActiveMonth().monthName;
          this.state.showToast(`${monthName} reports uploaded and consolidated into Quarterly return!`, 'success');
          // Do NOT reset files here in quarterly mode so the selected file labels remain visible.
          // Files are cleared automatically when the user switches to a different month tab.
        } else {
          this.state.setGstr1Payload(payload);
          this.state.showToast('Meesho reports submitted successfully! View Statement and Generate & Download GSTR-1 are now available.', 'success');
          this.state.closeUploadModal();
          this.resetFiles();
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.message || 'An error occurred during Meesho GST report conversion.');
      },
    });
  }

  private submitAmazonConversion(): void {
    const mtrFile = this.amazonMtrFile();

    if (!mtrFile) {
      this.errorMessage.set('The Amazon MTR (Merchant Tax Report) file is required.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const client = this.state.clientInfo();
    const gstin = client.gstin || '';
    const period = this.effectivePeriodCode();
    const sellerStateCode = client.sellerStateCode || (gstin.length >= 2 ? gstin.substring(0, 2) : '09');
    const isQ = this.isQuarterly();
    const platformId = this.state.selectedPlatform()?.id || 'amazon-b2c';

    const formData = new FormData();
    formData.append('mtr_file', mtrFile);
    formData.append('gstin', gstin);
    formData.append('period', period);
    formData.append('sellerStateCode', sellerStateCode);
    if (isQ && client.quarter) {
      formData.append('quarter', client.quarter);
    }

    const request$ = isQ
      ? this.gstApi.convertAmazonQuarterly(formData)
      : this.gstApi.convertAmazon(formData);

    request$.subscribe({
      next: (payload) => {
        this.isSubmitting.set(false);
        if (isQ) {
          this.state.setQuarterMonthPayload(platformId, period, payload);
          const monthName = this.currentActiveMonth().monthName;
          this.state.showToast(`${monthName} Amazon MTR uploaded and consolidated into Quarterly return!`, 'success');
          // Do NOT reset files here in quarterly mode so the selected file labels remain visible.
          // Files are cleared automatically when the user switches to a different month tab.
        } else {
          this.state.setGstr1Payload(payload);
          this.state.showToast('Amazon MTR report submitted successfully! View Statement and Generate & Download GSTR-1 are now available.', 'success');
          this.state.closeUploadModal();
          this.resetFiles();
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.message || 'An error occurred during Amazon GST report conversion.');
      },
    });
  }

  resetFiles(): void {
    this.salesFile.set(null);
    this.returnFile.set(null);
    this.invoiceFile.set(null);
    this.amazonMtrFile.set(null);
    this.errorMessage.set(null);
  }

  onDoneClick(): void {
    this.state.closeUploadModal();
    if (this.state.gstr1Payload()) {
      this.state.showToast('Quarterly platform reports saved. View Statement and Generate & Download GSTR-1 are available.', 'success');
    }
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  private getMonthName(m: number): string {
    const names = [
      '',
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
    return names[m] || `month ${m}`;
  }

  private async validateFileMonth(file: File, expectedMonth: number, expectedMonthName: string): Promise<string | null> {
    try {
      const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

      if (ext === '.csv') {
        const text = await file.text();
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) return null;

        const headers = lines[0]
          .split(',')
          .map((h) => h.trim().replace(/^["']|["']$/g, '').toLowerCase().replace(/[^a-z0-9]/g, '_'));

        const monthCol = headers.findIndex((h) => h === 'month_number' || h === 'month' || h.includes('month_num'));
        const dateCol = headers.findIndex((h) => h.includes('order_date') || h.includes('invoice_date') || h.includes('date'));

        for (let i = 1; i < Math.min(lines.length, 100); i++) {
          const cols = lines[i].split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
          if (monthCol !== -1 && cols[monthCol]) {
            const m = parseInt(cols[monthCol], 10);
            if (!isNaN(m) && m !== expectedMonth) {
              const foundName = this.getMonthName(m);
              return `Filing month mismatch in '${file.name}': expected ${expectedMonthName} (month ${expectedMonth}), but found month_number ${m} (${foundName}). Please verify that the report matches the selected tax period.`;
            }
          } else if (dateCol !== -1 && cols[dateCol]) {
            const match = cols[dateCol].match(/(\d{4})-(\d{2})-\d{2}/);
            if (match) {
              const m = parseInt(match[2], 10);
              if (!isNaN(m) && m !== expectedMonth) {
                const foundName = this.getMonthName(m);
                return `Filing month mismatch in '${file.name}': expected ${expectedMonthName} (month ${expectedMonth}), but found date with month ${m} (${foundName}). Please verify that the report matches the selected tax period.`;
              }
            }
          }
        }
      } else if (ext === '.xlsx' || ext === '.xls') {
        const XLSX = await import('xlsx');
        const buffer = await file.arrayBuffer();
        const wb = XLSX.read(buffer, { type: 'array', sheetRows: 100 });
        if (!wb.SheetNames || wb.SheetNames.length === 0) return null;
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const json: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false });
        if (json.length < 2) return null;

        const headers = (json[0] || []).map((h) => String(h || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '_'));
        const monthCol = headers.findIndex((h) => h === 'month_number' || h === 'month' || h.includes('month_num'));
        const dateCol = headers.findIndex((h) => h.includes('order_date') || h.includes('invoice_date') || h.includes('date'));

        for (let i = 1; i < json.length; i++) {
          const row = json[i];
          if (!row || row.length === 0) continue;
          if (monthCol !== -1 && row[monthCol] !== undefined && row[monthCol] !== null && String(row[monthCol]).trim() !== '') {
            const m = parseInt(String(row[monthCol]).trim(), 10);
            if (!isNaN(m) && m !== expectedMonth) {
              const foundName = this.getMonthName(m);
              return `Filing month mismatch in '${file.name}': expected ${expectedMonthName} (month ${expectedMonth}), but found month_number ${m} (${foundName}). Please verify that the report matches the selected tax period.`;
            }
          } else if (dateCol !== -1 && row[dateCol]) {
            const val = String(row[dateCol]).trim();
            const match = val.match(/(\d{4})-(\d{2})-\d{2}/);
            if (match) {
              const m = parseInt(match[2], 10);
              if (!isNaN(m) && m !== expectedMonth) {
                const foundName = this.getMonthName(m);
                return `Filing month mismatch in '${file.name}': expected ${expectedMonthName} (month ${expectedMonth}), but found date with month ${m} (${foundName}). Please verify that the report matches the selected tax period.`;
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('File month validation warning:', err);
    }
    return null;
  }
}
