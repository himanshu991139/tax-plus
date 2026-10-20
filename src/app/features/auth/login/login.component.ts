import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  readonly auth = inject(AuthService);
  private readonly loader = inject(NgxUiLoaderService);

  readonly isRedirecting = signal(false);

  signInWithGoogle(): void {
    if (this.isRedirecting()) return;
    this.isRedirecting.set(true);
    this.loader.start();
    this.auth.loginWithGoogle();
  }
}
