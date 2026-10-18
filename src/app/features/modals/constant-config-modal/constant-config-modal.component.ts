import { Component, inject } from '@angular/core';
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

  saveConfig(): void {
    this.state.updateConstantConfig(this.formConfig);
    this.state.closeConstantConfigModal();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.state.closeConstantConfigModal();
    }
  }
}
