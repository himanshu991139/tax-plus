import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientStateService } from '../../../core/services/client-state.service';
import { PlatformCardComponent } from '../platform-card/platform-card.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-platform-grid',
  standalone: true,
  imports: [CommonModule, PlatformCardComponent, IconComponent],
  templateUrl: './platform-grid.component.html',
  styleUrl: './platform-grid.component.scss',
})
export class PlatformGridComponent {
  readonly state = inject(ClientStateService);
}
