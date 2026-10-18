import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientStateService } from '../../../core/services/client-state.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-platform-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './platform-filter.component.html',
  styleUrl: './platform-filter.component.scss',
})
export class PlatformFilterComponent {
  readonly state = inject(ClientStateService);
}
