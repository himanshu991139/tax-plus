import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientStateService } from '../../../core/services/client-state.service';
import { ConstantConfig } from '../../../core/models/client-info.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { GST_STATE_MAP } from '../../../core/utils/state-codes';

@Component({
  selector: 'app-constant-config-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './constant-config-modal.component.html',
  styleUrl: './constant-config-modal.component.scss',
})
export class ConstantConfigModalComponent {
  readonly state = inject(ClientStateService);

  formConfig: ConstantConfig = { ...this.state.constantConfig() };

  readonly statesList = Object.entries(GST_STATE_MAP).map(([code, name]) => ({ code, name }));

  readonly apiUrlInvalid = computed(() => {
    const url = (this.formConfig.apiBaseUrl || '').trim();
    if (!url) {
      return true;
    }
    return !/^https?:\/\/\S+$/i.test(url);
  });

  saveConfig(): void {
    if (this.apiUrlInvalid()) {
      this.state.showToast('Backend API Endpoint URL must be a valid http(s) URL.', 'error');
      return;
    }

    this.formConfig.apiBaseUrl = this.formConfig.apiBaseUrl.trim();
    this.formConfig.currentFilingPeriod = (this.formConfig.currentFilingPeriod || '').trim();
    this.formConfig.filingDeadlineDaysLeft = this.clampInt(this.formConfig.filingDeadlineDaysLeft, 0, 365);
    this.formConfig.maxProfilesAllowed = this.clampInt(this.formConfig.maxProfilesAllowed, 1, 1000);

    this.state.updateConstantConfig(this.formConfig);
    this.state.closeConstantConfigModal();
  }

  private clampInt(value: number, min: number, max: number): number {
    const n = Number.isFinite(Number(value)) ? Math.round(Number(value)) : min;
    return Math.min(max, Math.max(min, n));
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.state.closeConstantConfigModal();
    }
  }
}
