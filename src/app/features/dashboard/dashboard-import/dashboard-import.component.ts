import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientHeaderComponent } from '../client-header/client-header.component';
import { PlatformFilterComponent } from '../platform-filter/platform-filter.component';
import { PlatformGridComponent } from '../platform-grid/platform-grid.component';
import { UploadModalComponent } from '../../modals/upload-modal/upload-modal.component';
import { StatementModalComponent } from '../../modals/statement-modal/statement-modal.component';
import { SwitchClientModalComponent } from '../../modals/switch-client-modal/switch-client-modal.component';

@Component({
  selector: 'app-dashboard-import',
  standalone: true,
  imports: [
    CommonModule,
    ClientHeaderComponent,
    PlatformFilterComponent,
    PlatformGridComponent,
    UploadModalComponent,
    StatementModalComponent,
    SwitchClientModalComponent,
  ],
  template: `
    <div class="dashboard-import-page">
      <!-- Client Header Bar -->
      <app-client-header></app-client-header>

      <!-- Platform Search & Filters -->
      <app-platform-filter></app-platform-filter>

      <!-- Platform Cards Grid -->
      <app-platform-grid></app-platform-grid>

      <!-- Modals (root-level SupportWidget & ClientInfoModal inherited from app-root) -->
      <app-upload-modal></app-upload-modal>
      <app-statement-modal></app-statement-modal>
      <app-switch-client-modal></app-switch-client-modal>
    </div>
  `,
  styles: [
    `
      .dashboard-import-page {
        width: 100%;
      }
    `,
  ],
})
export class DashboardImportComponent {}
