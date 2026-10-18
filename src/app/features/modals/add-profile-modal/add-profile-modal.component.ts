import { Component, inject, signal } from '@angular/core';
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
  ownerName = '';
  gstUsername = '';
  gstPassword = '';

  readonly isSubmitting = signal<boolean>(false);
  readonly showPassword = signal<boolean>(false);
  readonly detectedState = signal<string | null>(null);
  readonly stateCode = signal<string>('09');

  onGstinChange(val: string): void {
    if (val && val.length >= 2) {
      const code = val.substring(0, 2);
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
    const cleanGstin = this.gstin.trim().toUpperCase();
    const cleanCompanyName = this.companyName.trim();
    const cleanOwnerName = this.ownerName.trim() || cleanCompanyName;

    if (!cleanGstin || !cleanCompanyName) {
      this.state.showToast('Company Name and GSTIN are required.', 'error');
      return;
    }

    if (cleanGstin.length !== 15) {
      this.state.showToast('GSTIN must be 15 alphanumeric characters.', 'warning');
      return;
    }

    this.isSubmitting.set(true);

    this.gstApi.createCompany({
      companyName: cleanCompanyName,
      ownerName: cleanOwnerName,
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
    this.ownerName = '';
    this.gstUsername = '';
    this.gstPassword = '';
    this.detectedState.set(null);
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.state.closeAddProfileModal();
    }
  }
}
