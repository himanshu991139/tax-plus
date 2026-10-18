import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Platform } from '../../../core/models/platform.model';
import { ClientStateService } from '../../../core/services/client-state.service';
import { PlatformLogoComponent } from '../../../shared/components/platform-logo/platform-logo.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-platform-card',
  standalone: true,
  imports: [CommonModule, PlatformLogoComponent, IconComponent],
  templateUrl: './platform-card.component.html',
  styleUrl: './platform-card.component.scss',
})
export class PlatformCardComponent {
  readonly platform = input.required<Platform>();
  readonly state = inject(ClientStateService);

  onUploadClick(): void {
    this.state.openUploadModal(this.platform());
  }
}
