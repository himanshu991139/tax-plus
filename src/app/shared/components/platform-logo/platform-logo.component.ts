import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-platform-logo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './platform-logo.component.html',
  styleUrl: './platform-logo.component.scss',
})
export class PlatformLogoComponent {
  readonly platform = input.required<string>();
}
