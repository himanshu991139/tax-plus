import { Component, inject, OnInit } from '@angular/core';
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

  deleteProfile(profile: GstProfile): void {
    if (confirm(`Are you sure you want to delete profile for "${profile.companyName}"?`)) {
      this.state.deleteProfile(profile.id);
    }
  }

  onAddInBulk(): void {
    this.state.showToast('Bulk import: upload CSV with GSTIN, Company & Owner columns.', 'info');
  }
}
