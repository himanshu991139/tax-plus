import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClientStateService } from '../../../core/services/client-state.service';
import { AuthService } from '../../../core/services/auth.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  template: `
    <aside class="app-sidebar">
      <!-- Active workspace notice -->
      <div class="workspace-card">
        <div class="d-flex align-items-center gap-2">
          <div class="workspace-dot"></div>
          <div class="workspace-text">
            <span class="workspace-label">Current Client</span>
            <strong class="workspace-name">{{ state.activeProfile()?.companyName || 'None' }}</strong>
          </div>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="sidebar-nav">
        <!-- 1. Manage Profiles -->
        <a
          routerLink="/app/profiles"
          routerLinkActive="active"
          class="nav-link"
        >
          <span class="link-icon"><app-icon name="id-card" [size]="18"></app-icon></span>
          <span class="link-label">GST Profiles</span>
          <span class="profile-count-pill">{{ state.profiles().length }}</span>
        </a>

        <!-- 2. Import Data from Platform -->
        <a
          routerLink="/app/dashboard/import"
          routerLinkActive="active"
          class="nav-link"
        >
          <span class="link-icon"><app-icon name="cloud-upload" [size]="18"></app-icon></span>
          <span class="link-label">Import Platform Data</span>
        </a>

      </nav>

      <!-- Sidebar Footer -->
      <div class="sidebar-footer">
        <a href="#" (click)="$event.preventDefault(); onLogout()" class="logout-link">
          <app-icon name="logout" [size]="18"></app-icon>
          <span>Logout</span>
        </a>
      </div>
    </aside>
  `,
  styles: [
    `
      .app-sidebar {
        width: 260px;
        min-width: 260px;
        background: #ffffff;
        border-right: 1px solid #e2e8f0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 20px 16px;
        height: calc(100vh - 64px);
        position: sticky;
        top: 64px;
        overflow-y: auto;
      }

      .workspace-card {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 10px 14px;
        margin-bottom: 20px;

        .workspace-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
        }

        .workspace-text {
          display: flex;
          flex-direction: column;
          line-height: 1.2;

          .workspace-label {
            font-size: 10px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 600;
          }

          .workspace-name {
            font-size: 13px;
            color: #0f172a;
          }
        }
      }

      .sidebar-nav {
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
      }

      .menu-section-header {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.8px;
        color: #94a3b8;
        padding: 8px 12px 4px;
      }

      .sidebar-divider {
        height: 1px;
        background: #f1f5f9;
        margin: 8px 0;
      }

      .nav-link {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 14px;
        color: #475569;
        font-size: 13px;
        font-weight: 500;
        text-decoration: none;
        border-radius: 8px;
        transition: all 0.15s ease-in-out;

        &:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        &.active {
          background: #4f46e5;
          color: #ffffff;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);

          .link-icon {
            color: #ffffff;
          }

          .profile-count-pill {
            background: rgba(255, 255, 255, 0.25);
            color: #ffffff;
          }
        }

        .link-icon {
          display: flex;
          align-items: center;
          color: #64748b;
        }

        .link-label {
          flex: 1;
          white-space: nowrap;
        }

        .profile-count-pill {
          font-size: 11px;
          font-weight: 700;
          padding: 1px 7px;
          border-radius: 9999px;
          background: #e2e8f0;
          color: #475569;
        }

        .badge-new {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          background: #ef4444;
          color: #ffffff;
        }
      }

      .sidebar-footer {
        padding-top: 16px;
        border-top: 1px solid #e2e8f0;
      }

      .logout-link {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 14px;
        color: #64748b;
        font-size: 13px;
        font-weight: 500;
        text-decoration: none;
        border-radius: 8px;
        transition: all 0.15s;

        &:hover {
          background: #fff1f2;
          color: #e11d48;
        }
      }
    `,
  ],
})
export class SidebarComponent {
  readonly state = inject(ClientStateService);
  readonly auth = inject(AuthService);

  onToolClick(name: string): void {
    this.state.showToast(`${name} tool is ready.`, 'info');
  }

  onLogout(): void {
    this.auth.logout();
    this.state.showToast('You have been logged out safely.', 'info');
  }
}
