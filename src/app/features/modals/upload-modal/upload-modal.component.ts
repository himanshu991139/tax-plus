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

  private static readonly ALLOWED_EXTENSIONS = ['.csv', '.xlsx', '.xls'];
  private static readonly MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

  onFileSelected(event: Event, type: 'sales' | 'return' | 'invoice'): void {
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

      this.errorMessage.set(null);
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
