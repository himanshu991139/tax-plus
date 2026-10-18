import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClientStateService } from '../../../core/services/client-state.service';
import { AuthService } from '../../../core/services/auth.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  readonly state = inject(ClientStateService);
  readonly auth = inject(AuthService);
  readonly activeDropdown = signal<string | null>(null);
  readonly isUserMenuOpen = signal<boolean>(false);
  readonly isMobileMenuOpen = signal<boolean>(false);

  openDropdown(name: string): void {
    this.activeDropdown.set(name);
  }

  closeDropdown(): void {
    this.activeDropdown.set(null);
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen.update((val) => !val);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((val) => !val);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  onLogout(): void {
    this.auth.logout();
    this.state.showToast('You have been logged out safely.', 'info');
  }
}
