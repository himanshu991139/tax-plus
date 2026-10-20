import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientStateService, FILING_MONTHS } from '../../../core/services/client-state.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-client-info-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './client-info-modal.component.html',
  styleUrl: './client-info-modal.component.scss',
})
export class ClientInfoModalComponent {
  readonly state = inject(ClientStateService);

  selectedMonth = 'September';
  selectedYear = '2026';

  readonly months = FILING_MONTHS;

  constructor() {
    effect(() => {
      const p = this.state.pendingProfile() || this.state.activeProfile();
      if (p) {
        if (p.month) this.selectedMonth = p.month;
        if (p.year) this.selectedYear = p.year;
      }
    });
  }

  profile() {
    return this.state.pendingProfile() || this.state.activeProfile();
  }

  confirmImport(): void {
    this.state.confirmProfileImport(this.selectedMonth, this.selectedYear);
  }
  onBackdropClick(event?: MouseEvent): void {
    // Intentionally disabled: dialog only closes via close button or icon
  }
}
