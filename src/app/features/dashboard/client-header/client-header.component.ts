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

  readonly selectedMonth = computed(() => {
    return this.state.activeProfile()?.month || 'September';
  });

  readonly selectedYear = computed(() => {
    return this.state.activeProfile()?.year || '2026';
  });

  downloadGstr1(): void {
    const payload = this.state.gstr1Payload();
    if (!payload) {
      this.state.showToast('Please submit platform reports first to generate GSTR-1.', 'warning');
      return;
    }
    const client = this.state.clientInfo();
    const period = client.periodCode || 'return';
    const filename = `GSTR1_${client.company || 'Client'}_${period}.json`;
    this.gstApi.downloadJsonFile(payload, filename);
    this.state.showToast('GSTR-1 JSON downloaded successfully!', 'success');
  }
}
