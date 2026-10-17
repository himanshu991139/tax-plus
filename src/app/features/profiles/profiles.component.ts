import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientStateService } from '../../core/services/client-state.service';
import { GstProfile } from '../../core/models/client-info.model';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { AddProfileModalComponent } from '../modals/add-profile-modal/add-profile-modal.component';
import { ConstantConfigModalComponent } from '../modals/constant-config-modal/constant-config-modal.component';

@Component({
  selector: 'app-profiles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconComponent,
    AddProfileModalComponent,
    ConstantConfigModalComponent,
  ],
  template: `
    <div class="profiles-page">
      <!-- Page Header -->
      <div class="page-title-row mb-3">
        <h1 class="page-title d-flex align-items-center gap-2">
          <span class="title-icon">
            <app-icon name="id-card" [size]="24"></app-icon>
          </span>
          <span>Manage GST Profiles</span>
        </h1>
        <p class="page-subtitle text-muted d-flex align-items-center gap-1">
          <app-icon name="info" [size]="15" class="text-secondary"></app-icon>
          <span>Click on a profile listed below to proceed or create a new one.</span>
        </p>
      </div>


      <!-- Active Client Bar (if selected) -->
      @if (state.activeProfile(); as active) {
        <div class="active-client-bar mb-4">
          <div class="client-meta-grid">
            <div class="meta-item">
              <div class="meta-icon"><app-icon name="building" [size]="18"></app-icon></div>
              <div>
                <div class="meta-lbl">Company</div>
                <div class="meta-val">{{ active.companyName }}</div>
              </div>
            </div>

            <div class="meta-item">
              <div class="meta-icon"><app-icon name="user" [size]="18"></app-icon></div>
              <div>
                <div class="meta-lbl">Client</div>
                <div class="meta-val">{{ active.ownerName }}</div>
              </div>
            </div>

            <div class="meta-item">
              <div class="meta-icon"><app-icon name="id-card" [size]="18"></app-icon></div>
              <div>
                <div class="meta-lbl">GSTIN</div>
                <div class="meta-val font-mono">{{ active.gstin }}</div>
              </div>
            </div>

            <div class="meta-item">
              <div class="meta-icon"><app-icon name="calendar" [size]="18"></app-icon></div>
              <div>
                <div class="meta-lbl">Period</div>
                <div class="meta-val">{{ active.period }}</div>
              </div>
            </div>

            <div class="meta-item">
              <div class="meta-icon"><app-icon name="file-text" [size]="18"></app-icon></div>
              <div>
                <div class="meta-lbl">Type</div>
                <div class="meta-val">{{ active.typeOfFiling }}</div>
              </div>
            </div>

            <div class="meta-item">
              <div class="meta-icon"><app-icon name="calendar" [size]="18"></app-icon></div>
              <div>
                <div class="meta-lbl">Year</div>
                <div class="meta-val">{{ active.year }}</div>
              </div>
            </div>
          </div>

          <!-- Proceed to Import Data Action Button -->
          <button
            type="button"
            class="btn btn-proceed-import"
            (click)="proceedToImport(active)"
          >
            <span>Proceed to Import Data</span>
            <app-icon name="chevron-down" [size]="14" customClass="rotate-right"></app-icon>
          </button>
        </div>
      }

      <!-- Filter and Search Row -->
      <div class="search-filter-card mb-4">
        <div class="search-input-wrapper">
          <app-icon name="search" [size]="16" class="search-icon"></app-icon>
          <input
            type="text"
            class="search-input"
            placeholder="Search profiles..."
            [ngModel]="state.profileSearch()"
            (ngModelChange)="state.profileSearch.set($event)"
          />
        </div>

        <!-- Filter Controls - Commented Out
        <div class="filter-controls-group">
          <div class="select-wrapper">
            <span class="select-label">Filing:</span>
            <select
              class="filter-select"
              [ngModel]="state.profileFilingFilter()"
              (ngModelChange)="state.profileFilingFilter.set($event)"
            >
              <option value="All">All</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
            </select>
          </div>

          <div class="select-wrapper">
            <span class="select-label">GSTR-1:</span>
            <select
              class="filter-select"
              [ngModel]="state.profileGstr1Filter()"
              (ngModelChange)="state.profileGstr1Filter.set($event)"
            >
              <option value="All">All</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div class="select-wrapper">
            <span class="select-label">GSTR-3B:</span>
            <select
              class="filter-select"
              [ngModel]="state.profileGstr3bFilter()"
              (ngModelChange)="state.profileGstr3bFilter.set($event)"
            >
              <option value="All">All</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          @if (hasActiveFilters()) {
            <button type="button" class="btn btn-sm btn-outline-secondary" (click)="state.clearProfileFilters()">
              Clear
            </button>
          }
        </div>
        -->
      </div>

      <!-- Profiles Table -->
      <div class="profiles-table-card">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-header-dark">
              <tr>
                <th class="text-center" style="width: 50px;">S.NO</th>
                <th>CREATED ON</th>
                <th>COMPANY NAME</th>
                <th>OWNER NAME</th>
                <th>GSTIN</th>
                <th>TYPE OF FILING</th>
                <th class="text-center">GSTR-1 ⇅</th>
                <th class="text-center">GSTR-3B ⇅</th>
                <th class="text-center">AUG 26</th>
                <th class="text-center">SEPT 26</th>
                <th class="text-end">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              @for (profile of state.filteredProfiles(); track profile.id) {
                <tr [class.selected-row]="state.activeProfile()?.id === profile.id">
                  <td class="text-center font-mono fw-bold">{{ profile.sNo }}</td>
                  <td class="text-secondary small">{{ profile.createdOn }}</td>
                  <td class="fw-bold text-dark">{{ profile.companyName }}</td>
                  <td class="text-dark">{{ profile.ownerName }}</td>
                  <td class="font-mono text-primary fw-semibold">{{ profile.gstin }}</td>
                  <td>
                    <span class="badge badge-filing">{{ profile.typeOfFiling }}</span>
                  </td>
                  <td class="text-center">
                    <span class="badge" [class.badge-status-no]="profile.gstr1Status === 'No'" [class.badge-status-yes]="profile.gstr1Status === 'Yes'">
                      {{ profile.gstr1Status }}
                    </span>
                  </td>
                  <td class="text-center">
                    <span class="badge" [class.badge-status-no]="profile.gstr3bStatus === 'No'" [class.badge-status-yes]="profile.gstr3bStatus === 'Yes'">
                      {{ profile.gstr3bStatus }}
                    </span>
                  </td>
                  <td class="text-center">
                    @if (profile.history?.aug26 === 'filed') {
                      <span class="status-indicator-circle success">✓</span>
                    } @else {
                      <span class="status-indicator-circle pending">✕</span>
                    }
                  </td>
                  <td class="text-center">
                    @if (profile.history?.sept26 === 'filed') {
                      <span class="status-indicator-circle success">✓</span>
                    } @else {
                      <span class="status-indicator-circle pending">✕</span>
                    }
                  </td>
                  <td class="text-end">
                    <div class="d-inline-flex align-items-center gap-1">
                      <!-- Select Profile & Proceed -->
                      <button
                        type="button"
                        class="btn-action-circle select-btn"
                        [class.active]="state.activeProfile()?.id === profile.id"
                        (click)="proceedToImport(profile)"
                        title="Proceed to Import Data"
                      >
                        <app-icon name="chevron-down" [size]="14" customClass="rotate-right"></app-icon>
                      </button>

                      <!-- Delete Profile -->
                      <button
                        type="button"
                        class="btn-action-circle delete-btn"
                        (click)="deleteProfile(profile)"
                        title="Delete Profile"
                      >
                        <app-icon name="x" [size]="14"></app-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="11" class="text-center py-5 text-muted">
                    No GST profiles found matching your search.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modals (SupportWidget & ClientInfoModal from root app-root) -->
      <app-add-profile-modal></app-add-profile-modal>
      <app-constant-config-modal></app-constant-config-modal>
    </div>
  `,
  styles: [
    `
      .profiles-page {
        width: 100%;
      }

      .page-title {
        font-size: 24px;
        font-weight: 800;
        color: #0f172a;
        margin: 0;

        .title-icon {
          color: #4f46e5;
          display: inline-flex;
        }
      }

      .page-subtitle {
        font-size: 13px;
        margin-top: 4px;
      }

      .badge-profile-count {
        background: #1e293b;
        color: #ffffff;
        font-size: 12px;
        font-weight: 700;
        padding: 5px 12px;
        border-radius: 9999px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }

      .badge-filing-period {
        background: #fef3c7;
        color: #92400e;
        border: 1px solid #fde68a;
        font-size: 12px;
        padding: 4px 12px;
        border-radius: 9999px;
        display: inline-flex;
        align-items: center;
        gap: 6px;

        .days-pill {
          background: #f59e0b;
          color: #ffffff;
          padding: 1px 7px;
          border-radius: 9999px;
          font-weight: 700;
          font-size: 10px;
        }
      }

      .active-client-bar {
        background: #ffffff;
        border: 1.5px solid #cbd5e1;
        border-radius: 12px;
        padding: 14px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        flex-wrap: wrap;
      }

      .client-meta-grid {
        display: flex;
        align-items: center;
        gap: 28px;
        flex-wrap: wrap;
      }

      .meta-item {
        display: flex;
        align-items: center;
        gap: 10px;

        .meta-icon {
          color: #4f46e5;
          display: flex;
        }

        .meta-lbl {
          font-size: 11px;
          color: #64748b;
          font-weight: 500;
        }

        .meta-val {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
        }
      }

      .btn-proceed-import {
        background: linear-gradient(135deg, #d97706, #b45309);
        color: #ffffff;
        font-weight: 700;
        font-size: 13px;
        border: none;
        border-radius: 8px;
        padding: 9px 18px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 4px 10px rgba(217, 119, 6, 0.25);
        transition: all 0.15s;

        &:hover {
          background: linear-gradient(135deg, #b45309, #92400e);
          box-shadow: 0 6px 14px rgba(217, 119, 6, 0.35);
          transform: translateY(-1px);
        }
      }

      .rotate-right {
        transform: rotate(-90deg);
      }

      .search-filter-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 12px 18px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
      }

      .search-input-wrapper {
        position: relative;
        flex: 1;
        min-width: 240px;

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .search-input {
          width: 100%;
          height: 38px;
          padding: 0 14px 0 36px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 13px;

          &:focus {
            outline: none;
            border-color: #6366f1;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
          }
        }
      }

      .filter-controls-group {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }

      .select-wrapper {
        display: flex;
        align-items: center;
        gap: 6px;

        .select-label {
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
        }

        .filter-select {
          height: 38px;
          padding: 0 12px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 13px;
          color: #334155;
          background: #ffffff;
        }
      }

      .profiles-table-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);
      }

      .table-header-dark {
        background: #0f172a;
        color: #ffffff;

        th {
          background: #0f172a;
          color: #f1f5f9;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.6px;
          padding: 14px 16px;
          border: none;
        }
      }

      tbody tr {
        transition: background 0.15s;

        &:hover {
          background: #f8fafc;
        }

        &.selected-row {
          background: #f0f7ff;
        }

        td {
          padding: 14px 16px;
          font-size: 13px;
          border-bottom: 1px solid #f1f5f9;
        }
      }

      .badge-filing {
        background: #e0f2fe;
        color: #0369a1;
        font-weight: 600;
        padding: 4px 8px;
        border-radius: 4px;
      }

      .badge-status-no {
        background: #ffe4e6;
        color: #e11d48;
        font-weight: 700;
        padding: 3px 10px;
        border-radius: 4px;
      }

      .badge-status-yes {
        background: #dcfce7;
        color: #15803d;
        font-weight: 700;
        padding: 3px 10px;
        border-radius: 4px;
      }

      .status-indicator-circle {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 800;

        &.success {
          background: #dcfce7;
          color: #16a34a;
        }

        &.pending {
          background: #fee2e2;
          color: #dc2626;
        }
      }

      .btn-action-circle {
        width: 32px;
        height: 32px;
        border-radius: 6px;
        border: 1px solid #cbd5e1;
        background: #ffffff;
        color: #475569;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.15s;

        &:hover {
          background: #f1f5f9;
        }

        &.select-btn {
          color: #059669;
          border-color: #a7f3d0;
          &:hover,
          &.active {
            background: #059669;
            color: #ffffff;
            border-color: #059669;
          }
        }

        &.delete-btn {
          &:hover {
            color: #dc2626;
            border-color: #fca5a5;
            background: #fef2f2;
          }
        }
      }
    `,
  ],
})
export class ProfilesComponent {
  readonly state = inject(ClientStateService);
  private readonly router = inject(Router);

  hasActiveFilters(): boolean {
    return (
      !!this.state.profileSearch() ||
      this.state.profileFilingFilter() !== 'All' ||
      this.state.profileGstr1Filter() !== 'All' ||
      this.state.profileGstr3bFilter() !== 'All'
    );
  }

  proceedToImport(profile: GstProfile): void {
    // Open month/year confirmation dialog as shown in Image 3
    this.state.openClientInfoModal(profile);
  }

  deleteProfile(profile: GstProfile): void {
    if (confirm(`Are you sure you want to delete profile for "${profile.companyName}"?`)) {
      this.state.deleteProfile(profile.id);
    }
  }

  onAddInBulk(): void {
    this.state.showToast('Bulk import: upload CSV with GSTIN, Company & Owner columns.', 'info');
  }
}
