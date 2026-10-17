import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClientStateService } from '../../../core/services/client-state.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  template: `
    <header class="app-header">
      <div class="header-left">
        <!-- Modern SaaS Logo (Not copied) -->
        <a class="brand-logo" routerLink="/app/profiles">
          <div class="logo-mark">
            <svg viewBox="0 0 24 24" class="logo-svg" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="url(#logoGrad)" />
              <defs>
                <linearGradient id="logoGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#38bdf8" />
                  <stop offset="1" stop-color="#818cf8" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div class="brand-text-col">
            <span class="brand-name">TaxPulse</span>
            <span class="brand-tag">GST SUITE</span>
          </div>
        </a>

        <!-- Main Navigation Links -->
        <nav class="nav-links">
          <a
            routerLink="/app/profiles"
            routerLinkActive="active"
            class="nav-link"
          >
            <app-icon name="user" [size]="15"></app-icon>
            <span>GST Profiles</span>
          </a>

          <a
            routerLink="/app/dashboard/import"
            routerLinkActive="active"
            class="nav-link"
          >
            <app-icon name="cloud-upload" [size]="15"></app-icon>
            <span>Import Data</span>
          </a>

          <!-- Tools Dropdown -->
        

        </nav>
      </div>

      <!-- Right: Active Profile Pill & User Menu -->
      <div class="header-right">
        @if (state.activeProfile(); as active) {
          <div class="active-profile-pill" (click)="state.openClientInfoModal(active)" title="Click to change period">
            <span class="pill-dot"></span>
            <span class="pill-client">{{ active.companyName }}</span>
            <span class="pill-period">({{ active.period }})</span>
          </div>
        }

        <div class="user-profile" (click)="toggleUserMenu()">
          <div class="avatar-circle">
            <span>H</span>
          </div>
          <span class="user-greeting">himanshu</span>
          <app-icon name="chevron-down" [size]="13" customClass="user-chevron"></app-icon>
        </div>

        @if (isUserMenuOpen()) {
          <div class="user-dropdown-menu">
            <div class="user-info-banner">
              <div class="user-name">Himanshu</div>
              <div class="user-role">GST Compliance Manager</div>
            </div>
            <a routerLink="/app/profiles" (click)="isUserMenuOpen.set(false)" class="dropdown-item">
              <app-icon name="id-card" [size]="14"></app-icon>
              <span>Manage Profiles</span>
            </a>
            <div class="dropdown-divider"></div>
            <a href="#" (click)="$event.preventDefault(); onLogout(); isUserMenuOpen.set(false)" class="dropdown-item logout">
              <app-icon name="logout" [size]="14"></app-icon>
              <span>Logout</span>
            </a>
          </div>
        }
      </div>
    </header>
  `,
  styles: [
    `
      .app-header {
        height: 64px;
        background: #0f172a; /* Slate 900 */
        border-bottom: 1px solid #1e293b;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 28px;
        position: sticky;
        top: 0;
        z-index: 100;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 32px;
      }

      .brand-logo {
        display: flex;
        align-items: center;
        gap: 10px;
        text-decoration: none;

        .logo-mark {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          background: linear-gradient(135deg, #1e293b, #334155);
          border: 1px solid rgba(255, 255, 255, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;

          .logo-svg {
            width: 22px;
            height: 22px;
          }
        }

        .brand-text-col {
          display: flex;
          flex-direction: column;

          .brand-name {
            color: #f8fafc;
            font-size: 18px;
            font-weight: 800;
            letter-spacing: -0.4px;
            line-height: 1.1;
          }

          .brand-tag {
            color: #38bdf8;
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 1px;
          }
        }
      }

      .nav-links {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .nav-item {
        position: relative;
      }

      .nav-btn,
      .nav-link {
        background: transparent;
        border: none;
        color: #94a3b8;
        font-size: 13px;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        padding: 8px 12px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        gap: 6px;
        text-decoration: none;
        transition: all 0.15s ease-in-out;

        &:hover {
          color: #f8fafc;
          background-color: rgba(255, 255, 255, 0.08);
        }

        &.active {
          color: #ffffff;
          background-color: #334155;
        }
      }

      .dropdown-menu {
        position: absolute;
        top: 100%;
        left: 0;
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 8px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
        padding: 6px 0;
        min-width: 220px;
        z-index: 200;
        animation: fadeIn 0.15s ease-out;
      }

      .dropdown-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 14px;
        color: #cbd5e1;
        font-size: 13px;
        text-decoration: none;
        transition: all 0.15s;

        &:hover {
          background-color: #334155;
          color: #ffffff;
        }

        &.logout {
          color: #f87171;
          &:hover {
            background-color: rgba(239, 68, 68, 0.15);
          }
        }
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 16px;
        position: relative;
      }

      .active-profile-pill {
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(56, 189, 248, 0.12);
        border: 1px solid rgba(56, 189, 248, 0.3);
        padding: 6px 12px;
        border-radius: 9999px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.15s;

        &:hover {
          background: rgba(56, 189, 248, 0.2);
        }

        .pill-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #38bdf8;
          box-shadow: 0 0 6px #38bdf8;
        }

        .pill-client {
          color: #f8fafc;
          font-weight: 700;
        }

        .pill-period {
          color: #94a3b8;
        }
      }

      .user-profile {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        padding: 5px 10px;
        border-radius: 8px;
        transition: background 0.15s;

        &:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .avatar-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4f46e5, #06b6d4);
          color: #ffffff;
          font-weight: 700;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-greeting {
          color: #f1f5f9;
          font-size: 13px;
          font-weight: 600;
        }

        .user-chevron {
          color: #64748b;
        }
      }

      .user-dropdown-menu {
        position: absolute;
        top: 110%;
        right: 0;
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 10px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
        padding: 8px;
        min-width: 210px;
        z-index: 200;
      }

      .user-info-banner {
        padding: 8px 12px 10px;
        border-bottom: 1px solid #334155;
        margin-bottom: 4px;

        .user-name {
          font-size: 14px;
          font-weight: 700;
          color: #f8fafc;
        }

        .user-role {
          font-size: 11px;
          color: #94a3b8;
        }
      }

      .dropdown-divider {
        height: 1px;
        background: #334155;
        margin: 6px 0;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(6px);
        }
        to {
          opacity: 1;
        }
      }
    `,
  ],
})
export class HeaderComponent {
  readonly state = inject(ClientStateService);
  readonly activeDropdown = signal<string | null>(null);
  readonly isUserMenuOpen = signal<boolean>(false);

  openDropdown(name: string): void {
    this.activeDropdown.set(name);
  }

  closeDropdown(): void {
    this.activeDropdown.set(null);
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen.update((val) => !val);
  }

  onLogout(): void {
    this.state.showToast('You have been logged out safely.', 'info');
  }
}
