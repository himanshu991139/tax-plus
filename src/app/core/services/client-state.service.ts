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

export const FILING_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

const MONTH_CODE_MAP: Record<string, string> = {
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

export interface ApplyCombinationResult {
  changed: boolean;
  sameGstin: boolean;
  samePeriod: boolean;
  period: string;
  periodCode: string;
}

@Injectable({
  providedIn: 'root',
})
export class ClientStateService {
  private readonly gstApi = inject(GstApiService);
  private readonly router = inject(Router);

  // Profiles State
  readonly profiles = signal<GstProfile[]>(INITIAL_PROFILES);
  readonly activeProfile = signal<GstProfile | null>(null);

  constructor() {
    // Profiles are loaded explicitly via loadProfilesFromBackend() when needed
    // (e.g., ProfilesComponent.ngOnInit), not automatically on app/login load.
  }

  loadProfilesFromBackend(): void {
    this.gstApi.getCompanies().subscribe({
      next: (companies) => {
        if (companies && companies.length > 0) {
          const previousById = new Map(this.profiles().map((p) => [p.id, p]));
          const active = this.activeProfile();

          const mapped: GstProfile[] = companies.map((c, index) => {
            const code = c.gstin && c.gstin.length >= 2 ? c.gstin.substring(0, 2) : '09';
            let createdOn = '11 Apr 2026';
            if (c.createdAt) {
              try {
                const date = new Date(c.createdAt);
                if (!isNaN(date.getTime())) {
                  createdOn = date.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  });
                }
              } catch (_) {}
            }

            const id = String(c.id);
            const prev = active?.id === id ? active : previousById.get(id);

            return {
              id,
              sNo: index + 1,
              createdOn,
              companyName: c.companyName,
              ownerName: c.ownerName,
              gstin: c.gstin,
              sellerStateCode: code,
              gstr1Status: 'No',
              gstr3bStatus: 'No',
              username: c.ownerName,
              period: prev?.period || 'September 2026',
              periodCode: prev?.periodCode || '092026',
              year: prev?.year || '2026',
              month: prev?.month || 'September',
            };
          });
          this.profiles.set(mapped);

          const current = this.activeProfile();
          const matching = current ? mapped.find((p) => p.id === current.id) : undefined;
          if (!matching) {
            // No active profile yet — auto-select the first profile as default
            this.setActiveProfile(mapped[0]);
          } else if (
            current &&
            (matching.gstin !== current.gstin ||
            matching.companyName !== current.companyName ||
            matching.ownerName !== current.ownerName)
          ) {
            this.setActiveProfile({
              ...matching,
              month: current.month,
              year: current.year,
              period: current.period,
              periodCode: current.periodCode,
            });
          }
        }
      },
      error: (err) => {
        console.warn('Backend /api/companies not reachable yet, using existing profiles:', err);
      },
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
            const next = this.profiles()[0];
            if (next) this.setActiveProfile(next); else this.activeProfile.set(null);
          }
          this.showToast('Profile deleted successfully.', 'success');
        },
        error: (err) => {
          this.profiles.update((list) => list.filter((p) => p.id !== id));
          if (this.activeProfile()?.id === id) {
            const next = this.profiles()[0];
            if (next) this.setActiveProfile(next); else this.activeProfile.set(null);
          }
          this.showToast(err.message || 'Profile deleted.', 'info');
        },
      });
    } else {
      this.profiles.update((list) => list.filter((p) => p.id !== id));
      if (this.activeProfile()?.id === id) {
        const next = this.profiles()[0];
        if (next) this.setActiveProfile(next); else this.activeProfile.set(null);
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

  buildPeriod(month: string, year: string): { period: string; periodCode: string } {
    const monthCode = MONTH_CODE_MAP[month] || '09';
    return {
      period: `${month} ${year}`,
      periodCode: `${monthCode}${year}`,
    };
  }

  combinationKey(gstin: string, periodCode: string): string {
    return `${(gstin || '').trim().toUpperCase()}|${periodCode || ''}`;
  }

  currentCombinationKey(): string {
    const info = this.clientInfo();
    const active = this.activeProfile();
    const gstin = active?.gstin || info.gstin;
    const periodCode = active?.periodCode || info.periodCode;
    return this.combinationKey(gstin, periodCode);
  }

  /**
   * Applies GSTIN + filing-period combination.
   * Clears converted GSTR-1 only when GSTIN or period actually changes.
   */
  applyClientCombination(profile: GstProfile, month: string, year: string): ApplyCombinationResult {
    const { period, periodCode } = this.buildPeriod(month, year);
    const prev = this.clientInfo();
    const sameGstin = (prev.gstin || '').trim().toUpperCase() === (profile.gstin || '').trim().toUpperCase();
    const samePeriod = prev.periodCode === periodCode;
    const changed = !sameGstin || !samePeriod;

    const updated: GstProfile = {
      ...profile,
      month,
      year,
      period,
      periodCode,
    };

    this.profiles.update((list) =>
      list.map((p) => (p.id === updated.id ? { ...p, month, year, period, periodCode } : p)),
    );
    this.setActiveProfile(updated);

    if (changed) {
      this.gstr1Payload.set(null);
    }

    return { changed, sameGstin, samePeriod, period, periodCode };
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

    this.applyClientCombination(profile, month, year);
    this.closeClientInfoModal();
    this.showToast(`Selected ${profile.companyName} for ${month} ${year}.`, 'success');

    const currentUrl = this.router.url;
    if (!currentUrl.includes('/app/dashboard/import')) {
      this.router.navigate(['/app/dashboard/import']);
    }
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
