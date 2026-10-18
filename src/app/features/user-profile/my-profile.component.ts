import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ClientStateService } from '../../core/services/client-state.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.scss',
})
export class MyProfileComponent {
  readonly auth = inject(AuthService);
  readonly state = inject(ClientStateService);

  get user() {
    return this.auth.currentUser();
  }

  onLogout(): void {
    this.auth.logout();
    this.state.showToast('You have been logged out safely.', 'info');
  }
}
