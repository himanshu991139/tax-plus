import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ClientStateService } from '../../../core/services/client-state.service';
import { GstApiService } from '../../../core/services/gst-api.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';
import { getStateName } from '../../../core/utils/state-codes';
import { Gstr1Payload, Gstr1Summary } from '../../../core/models/gstr1.model';

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
  readonly activeView = signal<'combined' | 'meesho' | 'amazon'>('combined');

  // Platform Payloads
  readonly meeshoPayload = computed<Gstr1Payload | null>(() => this.state.meeshoPayload());
  readonly amazonPayload = computed<Gstr1Payload | null>(() => this.state.amazonPayload());
  readonly combinedPayload = computed<Gstr1Payload | null>(() => this.state.gstr1Payload());

  // Platform-wise & Combined Summaries for the top summary panel
  readonly meeshoSummary = computed<Gstr1Summary | null>(() => {
    const p = this.meeshoPayload();
    return p ? this.gstApi.calculateSummary(p) : null;
  });

  readonly amazonSummary = computed<Gstr1Summary | null>(() => {
    const p = this.amazonPayload();
    return p ? this.gstApi.calculateSummary(p) : null;
  });

  readonly combinedSummary = computed<Gstr1Summary | null>(() => {
    const p = this.combinedPayload();
    return p ? this.gstApi.calculateSummary(p) : null;
  });

  // Effective payload viewed in the detailed tables below
  readonly activePayload = computed<Gstr1Payload | null>(() => {
    const view = this.activeView();
    if (view === 'meesho') return this.meeshoPayload() || this.combinedPayload();
    if (view === 'amazon') return this.amazonPayload() || this.combinedPayload();
    return this.combinedPayload();
  });

  readonly summary = computed<Gstr1Summary | null>(() => {
    const payload = this.activePayload();
    if (!payload) return null;
    return this.gstApi.calculateSummary(payload);
  });

  setView(view: 'combined' | 'meesho' | 'amazon'): void {
    this.activeView.set(view);
  }

  formattedJson(): string {
    const payload = this.activePayload();
    return payload ? JSON.stringify(payload, null, 2) : '';
  }

  getState(pos: string): string {
    return getStateName(pos);
  }

  downloadJson(): void {
    const payload = this.activePayload();
    if (payload) {
      const period = this.state.clientInfo().periodCode || 'return';
      let prefix = 'Combined';
      if (this.activeView() === 'meesho') prefix = 'Meesho';
      else if (this.activeView() === 'amazon') prefix = 'Amazon';
      else if (this.state.hasBothData()) prefix = 'Combined';
      else if (this.state.hasMeeshoData()) prefix = 'Meesho';
      else if (this.state.hasAmazonData()) prefix = 'Amazon';

      this.gstApi.downloadJsonFile(payload, `GSTR1_${prefix}_${period}.json`);
      this.state.showToast(`GSTR-1 JSON (${prefix}) downloaded successfully!`, 'success');
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
    const platform = this.state.hasMeeshoData() && !this.state.hasAmazonData()
      ? this.state.platforms().find((p) => p.id === 'amazon-b2c')
      : this.state.platforms().find((p) => p.id === 'meesho-b2c');
    if (platform) {
      this.state.openUploadModal(platform);
    }
  }
}
