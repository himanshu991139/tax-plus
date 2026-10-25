import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientStateService, FILING_MONTHS } from '../../../core/services/client-state.service';
import { FILING_QUARTERS, FINANCIAL_YEARS, FilingFrequencyType, QuarterOption } from '../../../core/models/client-info.model';
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

  filingFrequency: FilingFrequencyType = 'Monthly';
  selectedMonth = 'September';
  selectedYear = '2026';
  selectedQuarter: 'Q1' | 'Q2' | 'Q3' | 'Q4' = 'Q2';
  selectedFinancialYear = '2026-2027';

  readonly months = FILING_MONTHS;
  readonly quarters: QuarterOption[] = FILING_QUARTERS;
  readonly financialYears: string[] = FINANCIAL_YEARS;
  readonly years: string[] = ['2026', '2025', '2024', '2023', '2027'];

  constructor() {
    effect(() => {
      const p = this.state.pendingProfile() || this.state.activeProfile();
      if (p) {
        if (p.filingType) this.filingFrequency = p.filingType;
        if (p.quarter) this.selectedQuarter = p.quarter;
        if (p.financialYear) this.selectedFinancialYear = p.financialYear;
        if (p.month && p.filingType !== 'Quarterly') this.selectedMonth = p.month;
        if (p.year) this.selectedYear = p.year;
      }
    });
  }

  setFrequency(type: FilingFrequencyType): void {
    this.filingFrequency = type;
  }

  profile() {
    return this.state.pendingProfile() || this.state.activeProfile();
  }

  isSelectionValid(): boolean {
    if (this.filingFrequency === 'Quarterly') {
      return Boolean(this.selectedQuarter && this.selectedFinancialYear);
    }
    return Boolean(this.selectedMonth && this.selectedYear);
  }

  confirmImport(): void {
    if (this.filingFrequency === 'Quarterly') {
      this.state.confirmProfileImport('', '', 'Quarterly', this.selectedQuarter, this.selectedFinancialYear);
    } else {
      this.state.confirmProfileImport(this.selectedMonth, this.selectedYear, 'Monthly');
    }
  }

  onBackdropClick(event?: MouseEvent): void {
    // Intentionally disabled: dialog only closes via close button or icon
  }
}
