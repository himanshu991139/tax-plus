import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientStateService } from '../../../core/services/client-state.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-platform-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="filter-bar">
      <!-- Search Box -->
      <div class="search-input-wrapper">
        <app-icon name="search" [size]="16" customClass="search-icon"></app-icon>
        <input
          type="text"
          class="search-input"
          placeholder="Search platforms..."
          [ngModel]="state.searchQuery()"
          (ngModelChange)="state.searchQuery.set($event)"
        />
      </div>

      <!-- Type Dropdown -->
      <div class="select-wrapper">
        <select
          class="filter-select"
          [ngModel]="state.selectedType()"
          (ngModelChange)="state.selectedType.set($event)"
        >
          <option value="All">All Types</option>
          <option value="B2C">B2C</option>
          <option value="B2B">B2B</option>
          <option value="B2C/B2B">B2C/B2B</option>
        </select>
        <app-icon name="chevron-down" [size]="14" customClass="select-chevron"></app-icon>
      </div>

      <!-- Status Dropdown -->
      <div class="select-wrapper">
        <select
          class="filter-select"
          [ngModel]="state.selectedStatus()"
          (ngModelChange)="state.selectedStatus.set($event)"
        >
          <option value="All">All Status</option>
          <option value="active">Active</option>
          <option value="ready">Ready</option>
          <option value="configured">Configured</option>
        </select>
        <app-icon name="chevron-down" [size]="14" customClass="select-chevron"></app-icon>
      </div>

      <!-- Clear Button -->
      <button
        type="button"
        class="btn-clear"
        (click)="state.clearFilters()"
        title="Reset filters"
      >
        <app-icon name="x" [size]="15"></app-icon>
        <span>Clear</span>
      </button>
    </div>
  `,
  styles: [
    `
      .filter-bar {
        display: flex;
        align-items: center;
        gap: 14px;
        margin-bottom: 24px;
        flex-wrap: wrap;
      }

      .search-input-wrapper {
        position: relative;
        flex: 1;
        min-width: 240px;

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          height: 42px;
          padding: 0 16px 0 40px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 14px;
          color: #1e293b;
          background: #ffffff;
          transition: border-color 0.15s, box-shadow 0.15s;

          &:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
          }

          &::placeholder {
            color: #94a3b8;
          }
        }
      }

      .select-wrapper {
        position: relative;
        min-width: 160px;

        .filter-select {
          width: 100%;
          height: 42px;
          padding: 0 34px 0 14px;
          appearance: none;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #334155;
          background: #ffffff;
          cursor: pointer;
          transition: border-color 0.15s, box-shadow 0.15s;

          &:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
          }
        }

        .select-chevron {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          pointer-events: none;
        }
      }

      .btn-clear {
        height: 42px;
        padding: 0 18px;
        background: #ffffff;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        color: #475569;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: all 0.15s ease-in-out;

        &:hover {
          background: #f8fafc;
          border-color: #94a3b8;
          color: #1e293b;
        }
      }
    `,
  ],
})
export class PlatformFilterComponent {
  readonly state = inject(ClientStateService);
}
