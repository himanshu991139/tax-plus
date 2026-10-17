import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  ClientInfo,
  DEFAULT_CLIENT,
  GstProfile,
  INITIAL_PROFILES,
  ConstantConfig,
  INITIAL_CONSTANT_CONFIG,
} from '../models/client-info.model';
import { Platform, PLATFORMS_DATA } from '../models/platform.model';
import { Gstr1Payload, Gstr1Summary } from '../models/gstr1.model';
import { GstApiService } from './gst-api.service';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({
  providedIn: 'root',
})
export class ClientStateService {
  private readonly gstApi = inject(GstApiService);
  private readonly router = inject(Router);

  // Profiles State
  readonly profiles = signal<GstProfile[]>(INITIAL_PROFILES);
  readonly activeProfile = signal<GstProfile | null>(INITIAL_PROFILES[1]); // Default to dsdivine13

  constructor() {
    this.loadProfilesFromBackend();
  }

  loadProfilesFromBackend(): void {
    this.gstApi.getCompanies().subscribe({
      next: (companies) => {
        if (companies && companies.length > 0) {
          const mapped: GstProfile[] = companies.map((c, index) => {
            const code = (c.gstin && c.gstin.length >= 2) ? c.gstin.substring(0, 2) : '09';
            let createdOn = '11 Apr 2026';
            if (c.createdAt) {
              try {
                const date = new Date(c.createdAt);
                if (!isNaN(date.getTime())) {
                  createdOn = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                }
              } catch (_) {}
            }
            return {
              id: String(c.id),
              sNo: index + 1,
              createdOn,
              companyName: c.companyName,
              ownerName: c.ownerName,
              gstin: c.gstin,
              sellerStateCode: code,
              gstr1Status: 'No',
              gstr3bStatus: 'No',
              username: c.ownerName,
              period: 'September 2026',
              periodCode: '092026',
              year: '2026',
              month: 'September',
            };
          });
          this.profiles.set(mapped);
          if (!this.activeProfile() || !mapped.some(p => p.id === this.activeProfile()?.id)) {
            this.activeProfile.set(mapped[0]);
          }
        }
      },
      error: (err) => {
        console.warn('Backend /api/companies not reachable yet, using existing profiles:', err);
      }
    });
  }

  // Constant / Config Data State
  readonly constantConfig = signal<ConstantConfig>(INITIAL_CONSTANT_CONFIG);

  // Profile Filters
  readonly profileSearch = signal<string>('');
  readonly profileGstr1Filter = signal<string>('All');
  readonly profileGstr3bFilter = signal<string>('All');

  // Filtered Profiles computed
  readonly filteredProfiles = computed(() => {
    const query = this.profileSearch().trim().toLowerCase();
    const gstr1 = this.profileGstr1Filter();
    const gstr3b = this.profileGstr3bFilter();

    return this.profiles().filter((p) => {
      const matchSearch =
        !query ||
        p.companyName.toLowerCase().includes(query) ||
        p.ownerName.toLowerCase().includes(query) ||
        p.gstin.toLowerCase().includes(query);

      const matchGstr1 = gstr1 === 'All' || p.gstr1Status === gstr1;
      const matchGstr3b = gstr3b === 'All' || p.gstr3bStatus === gstr3b;

      return matchSearch && matchGstr1 && matchGstr3b;
    });
  });

  // Current Working Client Info (used by Import page)
  readonly clientInfo = signal<ClientInfo>(DEFAULT_CLIENT);

  // Platform List & Filters for Import Dashboard
  readonly platforms = signal<Platform[]>(PLATFORMS_DATA);
  readonly selectedPlatform = signal<Platform | null>(null);
  readonly searchQuery = signal<string>('');
  readonly selectedType = signal<string>('All');
  readonly selectedStatus = signal<string>('All');

  readonly filteredPlatforms = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const typeFilter = this.selectedType();
    const statusFilter = this.selectedStatus().toLowerCase();

    return this.platforms().filter((p) => {
      const matchesSearch =
        !query || p.name.toLowerCase().includes(query) || (p.tagline && p.tagline.toLowerCase().includes(query));
      const matchesType = typeFilter === 'All' || p.badge === typeFilter;
      const matchesStatus = statusFilter === 'all' || p.status.toLowerCase() === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  });

  // Converted GSTR-1 Data
  readonly gstr1Payload = signal<Gstr1Payload | null>(null);
  readonly gstr1Summary = computed<Gstr1Summary | null>(() => {
    const payload = this.gstr1Payload();
    if (!payload) return null;
    return this.gstApi.calculateSummary(payload);
  });

  // Modal Visibility States
  readonly isAddProfileModalOpen = signal<boolean>(false);
  readonly isClientInfoModalOpen = signal<boolean>(false);
  readonly isConstantConfigModalOpen = signal<boolean>(false);
  readonly isUploadModalOpen = signal<boolean>(false);
  readonly isStatementModalOpen = signal<boolean>(false);
  readonly isSwitchClientModalOpen = signal<boolean>(false);
  readonly isSupportModalOpen = signal<boolean>(false);

  // Temporary selected profile for modal confirmation
  readonly pendingProfile = signal<GstProfile | null>(null);

  // Toast Notification State
  readonly toast = signal<ToastMessage | null>(null);
  private toastCounter = 0;

  // Actions: Profile Management
  addProfile(newProfile: Omit<GstProfile, 'id' | 'sNo' | 'createdOn'>): void {
    const profiles = this.profiles();
    const id = 'p' + (profiles.length + 1);
    const sNo = profiles.length + 1;
    const now = new Date();
    const createdOn = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const created: GstProfile = {
      ...newProfile,
      id,
      sNo,
      createdOn,
    };

    this.profiles.update((list) => [created, ...list]);
    this.activeProfile.set(created);
    this.showToast(`GST Profile "${created.companyName}" created successfully!`, 'success');
  }

  deleteProfile(id: string): void {
    const isBackendId = !isNaN(Number(id));
    if (isBackendId) {
      this.gstApi.deleteCompany(id).subscribe({
        next: () => {
          this.profiles.update((list) => list.filter((p) => p.id !== id));
          if (this.activeProfile()?.id === id) {
            this.activeProfile.set(this.profiles()[0] || null);
          }
          this.showToast('Profile deleted successfully.', 'success');
        },
        error: (err) => {
          this.profiles.update((list) => list.filter((p) => p.id !== id));
          if (this.activeProfile()?.id === id) {
            this.activeProfile.set(this.profiles()[0] || null);
          }
          this.showToast(err.message || 'Profile deleted.', 'info');
        },
      });
    } else {
      this.profiles.update((list) => list.filter((p) => p.id !== id));
      if (this.activeProfile()?.id === id) {
        this.activeProfile.set(this.profiles()[0] || null);
      }
      this.showToast('Profile deleted successfully.', 'info');
    }
  }

  setActiveProfile(profile: GstProfile): void {
    this.activeProfile.set(profile);
    this.clientInfo.set({
      company: profile.companyName,
      client: profile.ownerName,
      gstin: profile.gstin,
      period: profile.period,
      periodCode: profile.periodCode,
      year: profile.year,
      sellerStateCode: profile.sellerStateCode,
    });
  }

  openClientInfoModal(profile: GstProfile): void {
    this.pendingProfile.set(profile);
    this.isClientInfoModalOpen.set(true);
  }

  closeClientInfoModal(): void {
    this.isClientInfoModalOpen.set(false);
    this.pendingProfile.set(null);
  }

  confirmProfileImport(month: string, year: string): void {
    const profile = this.pendingProfile() || this.activeProfile();
    if (!profile) return;

    const monthMap: Record<string, string> = {
      January: '01',
      February: '02',
      March: '03',
      April: '04',
      May: '05',
      June: '06',
      July: '07',
      August: '08',
      September: '09',
      October: '10',
      November: '11',
      December: '12',
    };

    const monthCode = monthMap[month] || '09';
    const periodCode = `${monthCode}${year}`;
    const periodDisplay = `${month} ${year}`;

    const updatedProfile: GstProfile = {
      ...profile,
      month,
      year,
      period: periodDisplay,
      periodCode,
    };

    this.setActiveProfile(updatedProfile);
    this.closeClientInfoModal();
    this.showToast(`Selected ${profile.companyName} for ${periodDisplay}. Proceeding to Import...`, 'success');

    // Navigate to Import Dashboard
    this.router.navigate(['/app/dashboard/import']);
  }

  updateConstantConfig(config: Partial<ConstantConfig>): void {
    this.constantConfig.update((c) => ({ ...c, ...config }));
    this.showToast('System configuration & constant data updated.', 'success');
  }

  // Modals for Upload / Statement / Support
  openUploadModal(platform: Platform): void {
    this.selectedPlatform.set(platform);
    this.isUploadModalOpen.set(true);
  }

  closeUploadModal(): void {
    this.isUploadModalOpen.set(false);
  }

  openStatementModal(): void {
    this.isStatementModalOpen.set(true);
  }

  closeStatementModal(): void {
    this.isStatementModalOpen.set(false);
  }

  openAddProfileModal(): void {
    this.isAddProfileModalOpen.set(true);
  }

  closeAddProfileModal(): void {
    this.isAddProfileModalOpen.set(false);
  }

  openConstantConfigModal(): void {
    this.isConstantConfigModalOpen.set(true);
  }

  closeConstantConfigModal(): void {
    this.isConstantConfigModalOpen.set(false);
  }

  openSwitchClientModal(): void {
    this.isSwitchClientModalOpen.set(true);
  }

  closeSwitchClientModal(): void {
    this.isSwitchClientModalOpen.set(false);
  }

  openSupportModal(): void {
    this.isSupportModalOpen.set(true);
  }

  closeSupportModal(): void {
    this.isSupportModalOpen.set(false);
  }

  setGstr1Payload(payload: Gstr1Payload): void {
    this.gstr1Payload.set(payload);
  }

  showToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info'): void {
    const id = ++this.toastCounter;
    this.toast.set({ id, message, type });
    setTimeout(() => {
      if (this.toast()?.id === id) {
        this.toast.set(null);
      }
    }, 4500);
  }

  dismissToast(): void {
    this.toast.set(null);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedType.set('All');
    this.selectedStatus.set('All');
  }

  clearProfileFilters(): void {
    this.profileSearch.set('');
    this.profileGstr1Filter.set('All');
    this.profileGstr3bFilter.set('All');
  }
}
