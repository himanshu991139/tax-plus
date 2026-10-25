import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientStateService } from '../../core/services/client-state.service';
import { GstProfile } from '../../core/models/client-info.model';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { AddProfileModalComponent } from '../modals/add-profile-modal/add-profile-modal.component';

@Component({
  selector: 'app-profiles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconComponent,
    AddProfileModalComponent,
  ],
  templateUrl: './profiles.component.html',
  styleUrl: './profiles.component.scss',
})
export class ProfilesComponent implements OnInit {
  readonly state = inject(ClientStateService);
  private readonly router = inject(Router);

  // ── Delete confirmation dialog state ──────────────────────────
  readonly deleteDialogVisible = signal(false);
  readonly profileToDelete = signal<GstProfile | null>(null);

  ngOnInit(): void {
    this.state.loadProfilesFromBackend();
  }

  hasActiveFilters(): boolean {
    return (
      !!this.state.profileSearch() ||
      this.state.profileGstr1Filter() !== 'All' ||
      this.state.profileGstr3bFilter() !== 'All'
    );
  }

  proceedToImport(profile: GstProfile): void {
    // Open month/year confirmation dialog to select filing period
    this.state.openClientInfoModal(profile);
  }

  /** Opens the custom delete confirmation dialog */
  deleteProfile(profile: GstProfile): void {
    this.profileToDelete.set(profile);
    this.deleteDialogVisible.set(true);
  }

  /** Called when user confirms deletion inside the dialog */
  confirmDelete(): void {
    const profile = this.profileToDelete();
    if (profile) {
      this.state.deleteProfile(profile.id);
    }
    this.cancelDelete();
  }

  /** Dismisses the dialog without deleting */
  cancelDelete(): void {
    this.deleteDialogVisible.set(false);
    this.profileToDelete.set(null);
  }

  onAddInBulk(): void {
    this.state.showToast('Bulk import: upload CSV with GSTIN, Company & Owner columns.', 'info');
  }
}
