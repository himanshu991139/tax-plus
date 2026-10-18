import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientStateService } from '../../../core/services/client-state.service';
import { PlatformCardComponent } from '../platform-card/platform-card.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-platform-grid',
  standalone: true,
  imports: [CommonModule, PlatformCardComponent, IconComponent],
  template: `
    @if (state.filteredPlatforms().length > 0) {
      <div class="platforms-grid">
        @for (platform of state.filteredPlatforms(); track platform.id) {
          @if (platform.id === 'meesho-b2c') {
            <app-platform-card [platform]="platform"></app-platform-card>
          }
        }
      </div>
    } @else {
      <div class="empty-state">
        <div class="empty-icon-box">
          <app-icon name="search" [size]="32"></app-icon>
        </div>
        <h3 class="empty-title">No platforms found</h3>
        <p class="empty-desc">No platform matched your filter criteria. Try adjusting your search or filter options.</p>
        <button type="button" class="btn-reset" (click)="state.clearFilters()">Reset Filters</button>
      </div>
    }
  `,
  styles: [
    `
      .platforms-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
        gap: 20px;
        padding-bottom: 40px;
      }

      .empty-state {
        text-align: center;
        padding: 60px 20px;
        background: #ffffff;
        border-radius: 12px;
        border: 1px dashed #cbd5e1;
        margin: 20px 0;

        .empty-icon-box {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #f1f5f9;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }

        .empty-title {
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 8px 0;
        }

        .empty-desc {
          font-size: 14px;
          color: #64748b;
          max-width: 420px;
          margin: 0 auto 20px;
          line-height: 1.5;
        }

        .btn-reset {
          background: #1a2b6d;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          padding: 8px 18px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.15s;

          &:hover {
            background: #142154;
          }
        }
      }
    `,
  ],
})
export class PlatformGridComponent {
  readonly state = inject(ClientStateService);
}
