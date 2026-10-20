import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientStateService } from '../../../core/services/client-state.service';
import { GstApiService } from '../../../core/services/gst-api.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { GST_STATE_MAP } from '../../../core/utils/state-codes';

@Component({
  selector: 'app-add-profile-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './add-profile-modal.component.html',
  styleUrl: './add-profile-modal.component.scss',
})
export class AddProfileModalComponent {
  readonly state = inject(ClientStateService);
  private readonly gstApi = inject(GstApiService);

  gstin = '';
  companyName = '';
  gstUsername = '';
  gstPassword = '';

  readonly isSubmitting = signal<boolean>(false);
  readonly showPassword = signal<boolean>(false);
  readonly detectedState = signal<string | null>(null);
  readonly stateCode = signal<string>('09');
  readonly hasAttemptedSubmit = signal<boolean>(false);

  /** GSTIN format: 2-digit state code + 10-char PAN + entity number + 'Z' + check char (15 chars total). */
  private static readonly GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

  /** True when something is typed but it does not yet match the GSTIN format. */
  readonly gstinInvalid = computed(() => {
    const v = this.gstin.trim().toUpperCase();
    return v.length > 0 && !AddProfileModalComponent.GSTIN_REGEX.test(v);
  });

  readonly companyNameInvalid = computed(() => {
    return this.hasAttemptedSubmit() && !this.companyName.trim();
  });

  readonly gstinRequiredInvalid = computed(() => {
    return this.hasAttemptedSubmit() && (!this.gstin.trim() || this.gstinInvalid());
  });

  onGstinChange(val: string): void {
    // Sanitize to only alphanumeric characters and force uppercase
    const cleaned = (val || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    this.gstin = cleaned;

    if (cleaned.length >= 2) {
      const code = cleaned.substring(0, 2);
      this.stateCode.set(code);
      const stateName = GST_STATE_MAP[code];
      if (stateName) {
        this.detectedState.set(stateName);
      } else {
        this.detectedState.set(null);
      }
    } else {
      this.detectedState.set(null);
    }
  }

  saveProfile(): void {
    this.hasAttemptedSubmit.set(true);
    const cleanGstin = this.gstin.trim().toUpperCase();
    const cleanCompanyName = this.companyName.trim();
    if (!cleanGstin || !cleanCompanyName) {
      this.state.showToast('Company Name and GSTIN are required.', 'error');
      return;
    }

    if (!AddProfileModalComponent.GSTIN_REGEX.test(cleanGstin)) {
      this.state.showToast('GSTIN must be 15 characters in the format 09AAACO4007A1Z3.', 'warning');
      return;
    }

    if (cleanCompanyName.length > 100) {
      this.state.showToast('Company Name must be at most 100 characters.', 'warning');
      return;
    }

    this.isSubmitting.set(true);

    this.gstApi.createCompany({
      companyName: cleanCompanyName,
      gstin: cleanGstin,
    }).subscribe({
      next: (created) => {
        this.isSubmitting.set(false);
        this.state.loadProfilesFromBackend();
        this.state.showToast(`GST Profile "${created.companyName}" created successfully!`, 'success');
        this.state.closeAddProfileModal();
        this.resetForm();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.state.showToast(err.message || 'Failed to create profile.', 'error');
      },
    });
  }

  private resetForm(): void {
    this.gstin = '';
    this.companyName = '';
    this.gstUsername = '';
    this.gstPassword = '';
    this.hasAttemptedSubmit.set(false);
    this.detectedState.set(null);
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.state.closeAddProfileModal();
    }
  }
}
