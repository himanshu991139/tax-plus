import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ClientHeaderComponent } from '../client-header/client-header.component';
import { PlatformGridComponent } from '../platform-grid/platform-grid.component';
import { UploadModalComponent } from '../../modals/upload-modal/upload-modal.component';
import { StatementModalComponent } from '../../modals/statement-modal/statement-modal.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ClientStateService } from '../../../core/services/client-state.service';

@Component({
  selector: 'app-dashboard-import',
  standalone: true,
  imports: [
    CommonModule,
    ClientHeaderComponent,
    PlatformGridComponent,
    UploadModalComponent,
    StatementModalComponent,
    IconComponent,
  ],
  templateUrl: './dashboard-import.component.html',
  styleUrl: './dashboard-import.component.scss',
})
export class DashboardImportComponent implements OnInit {
  readonly state = inject(ClientStateService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    // Import Platform Data is active only when a GST profile is selected.
    // If no profile is selected, redirect back to Manage GST Profiles.
    if (!this.state.activeProfile()) {
      this.state.showToast('Please select a GST profile before importing data.', 'warning');
      this.router.navigate(['/app/profiles']);
    }
  }
}
