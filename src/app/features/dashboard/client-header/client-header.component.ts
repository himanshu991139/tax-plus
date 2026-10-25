import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ClientStateService } from '../../../core/services/client-state.service';
import { GstApiService } from '../../../core/services/gst-api.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-client-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IconComponent],
  templateUrl: './client-header.component.html',
  styleUrl: './client-header.component.scss',
})
export class ClientHeaderComponent {
  readonly state = inject(ClientStateService);
  private readonly gstApi = inject(GstApiService);
  private readonly router = inject(Router);

  readonly isQuarterly = computed(() => {
    return this.state.clientInfo().filingType === 'Quarterly';
  });

  readonly selectedMonth = computed(() => {
    return this.state.activeProfile()?.month || 'September';
  });

  readonly selectedYear = computed(() => {
    return this.state.activeProfile()?.year || '2026';
  });

  readonly selectedQuarter = computed(() => {
    return this.state.clientInfo().quarter || this.state.activeProfile()?.quarter || 'Q2';
  });

  readonly selectedQuarterLabel = computed(() => {
    const q = this.selectedQuarter();
    switch (q) {
      case 'Q1': return 'Q1 (Apr - Jun)';
      case 'Q2': return 'Q2 (Jul - Sep)';
      case 'Q3': return 'Q3 (Oct - Dec)';
      case 'Q4': return 'Q4 (Jan - Mar)';
      default: return `${q}`;
    }
  });

  readonly selectedFinancialYear = computed(() => {
    const fy = this.state.clientInfo().financialYear || this.state.activeProfile()?.financialYear;
    if (fy) return fy;
    const y = this.selectedYear();
    const num = parseInt(y, 10);
    return isNaN(num) ? y : `FY ${num}-${String(num + 1).substring(2)}`;
  });

  downloadGstr1(): void {
    const payload = this.state.gstr1Payload();
    if (!payload) {
      this.state.showToast('Please submit platform reports first to generate GSTR-1.', 'warning');
      return;
    }
    const client = this.state.clientInfo();
    const isQ = client.filingType === 'Quarterly';
    const period = client.periodCode || 'return';
    const prefix = isQ ? `Quarterly_${client.quarter || 'Q'}_` : '';
    const filename = `GSTR1_${client.company || 'Client'}_${prefix}${period}.json`;
    this.gstApi.downloadJsonFile(payload, filename);
    this.state.showToast(`GSTR-1 ${isQ ? 'Quarterly ' : ''}JSON downloaded successfully!`, 'success');
  }
}
