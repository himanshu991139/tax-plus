import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientStateService } from '../../../core/services/client-state.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
})
export class ToastComponent {
  readonly state = inject(ClientStateService);
}
