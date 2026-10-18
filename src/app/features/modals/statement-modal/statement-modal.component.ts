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
  templateUrl: './statement-modal.component.html',
  styleUrl: './statement-modal.component.scss',
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
