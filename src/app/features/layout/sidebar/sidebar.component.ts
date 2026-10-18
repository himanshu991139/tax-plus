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
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
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
