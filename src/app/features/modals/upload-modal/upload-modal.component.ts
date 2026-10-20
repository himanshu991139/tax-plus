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

  currentPlatformLogo(): string {
    return this.state.selectedPlatform()?.logoType || 'meesho';
  }

  /**
   * Whether the currently selected platform is Amazon.
   */
  isAmazonPlatform(): boolean {
    return this.state.selectedPlatform()?.id === 'amazon-b2c';
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.state.closeUploadModal();
    }
  }

  /**
   * Expected base file names for Meesho reports (without extension).
   * The dialog only accepts files whose name matches one of these exactly.
   */
  private static readonly MEESHO_FILE_MAP: Record<'sales' | 'return' | 'invoice', string> = {
    sales: 'tcs_sales',
    return: 'tcs_sales_return',
    invoice: 'tax_invoice_details',
  };

  /**
   * Expected base file name for Amazon MTR B2C report.
   */
  private static readonly AMAZON_FILE_NAME = 'MTR';

  private static readonly ALLOWED_EXTENSIONS = ['.csv', '.xlsx', '.xls'];
  private static readonly MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

  /**
   * Checks whether the given file name matches the expected Meesho base name
   * (e.g. "Tax_invoice_details.xlsx" or "tax_invoice_details.csv" matches "tax_invoice_details").
   * Matching is case-insensitive and trims whitespace.
   */
  isMeeshoFileName(fileName: string, type: 'sales' | 'return' | 'invoice'): boolean {
    const expectedBase = UploadModalComponent.MEESHO_FILE_MAP[type].toLowerCase();
    const dotIndex = fileName.lastIndexOf('.');
    const baseName = (dotIndex > 0 ? fileName.substring(0, dotIndex) : fileName).trim().toLowerCase();
    return baseName === expectedBase;
  }

  /**
   * Checks whether the given file name matches the expected Amazon MTR base name.
   */
  isAmazonFileName(fileName: string): boolean {
    const expectedBase = UploadModalComponent.AMAZON_FILE_NAME.toLowerCase();
    const dotIndex = fileName.lastIndexOf('.');
    const baseName = (dotIndex > 0 ? fileName.substring(0, dotIndex) : fileName).trim().toLowerCase();
    return baseName === expectedBase;
  }

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

      if (type === 'amazonMtr') {
        // Amazon: validate exact file name
        if (!this.isAmazonFileName(file.name)) {
          this.errorMessage.set(
            `This is an Amazon upload. The MTR file must be named exactly "${UploadModalComponent.AMAZON_FILE_NAME}", but got "${file.name}".
             Please rename the file or choose the correct Amazon MTR report.`
          );
          input.value = '';
          return;
        }
        this.errorMessage.set(null);
        this.amazonMtrFile.set(file);
      } else {
        // Meesho: validate exact file name
        if (!this.isMeeshoFileName(file.name, type)) {
          const expected = UploadModalComponent.MEESHO_FILE_MAP[type];
          this.errorMessage.set(
            `This is a Meesho upload. The file must be named exactly "${expected}", but got "${file.name}".
             Please rename the file or choose the correct Meesho report.`
          );
          input.value = '';
          return;
        }
        this.errorMessage.set(null);
        if (type === 'sales') this.salesFile.set(file);
        else if (type === 'return') this.returnFile.set(file);
        else if (type === 'invoice') this.invoiceFile.set(file);
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

  private submitMeeshoConversion(): void {
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
        this.state.showToast('Meesho reports submitted successfully! View Statement and Generate & Download GSTR-1 are now available.', 'success');
        this.state.closeUploadModal();
        this.resetFiles();
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
    const period = client.periodCode || '092026';
    const sellerStateCode = client.sellerStateCode || (gstin.length >= 2 ? gstin.substring(0, 2) : '09');

    const formData = new FormData();
    formData.append('mtr_file', mtrFile);
    formData.append('gstin', gstin);
    formData.append('period', period);
    formData.append('sellerStateCode', sellerStateCode);

    this.gstApi.convertAmazon(formData).subscribe({
      next: (payload) => {
        this.isSubmitting.set(false);
        this.state.setGstr1Payload(payload);
        this.state.showToast('Amazon MTR report submitted successfully! View Statement and Generate & Download GSTR-1 are now available.', 'success');
        this.state.closeUploadModal();
        this.resetFiles();
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

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
