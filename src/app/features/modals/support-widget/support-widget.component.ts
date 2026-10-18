import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientStateService } from '../../../core/services/client-state.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-support-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './support-widget.component.html',
  styleUrl: './support-widget.component.scss',
})
export class SupportWidgetComponent {
  readonly state = inject(ClientStateService);

  category = 'meesho_conversion';
  subject = '';
  description = '';
  readonly ticketSubmitted = signal<boolean>(false);
  readonly ticketId = signal<number>(Math.floor(10000 + Math.random() * 90000));

  submitTicket(): void {
    const trimmedSubject = this.subject.trim();
    const trimmedDescription = this.description.trim();

    if (trimmedSubject.length < 5) {
      this.state.showToast('Please enter a subject of at least 5 characters.', 'warning');
      return;
    }
    if (trimmedSubject.length > 150) {
      this.state.showToast('Subject must be at most 150 characters.', 'warning');
      return;
    }
    if (trimmedDescription.length > 2000) {
      this.state.showToast('Description must be at most 2000 characters.', 'warning');
      return;
    }

    this.ticketId.set(Math.floor(10000 + Math.random() * 90000));
    this.ticketSubmitted.set(true);
    this.state.showToast('Support ticket created successfully!', 'success');
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.state.closeSupportModal();
    }
  }
}
