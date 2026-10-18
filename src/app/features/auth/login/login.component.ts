import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="login-wrapper">
      <div class="background-decorations">
        <div class="glow-orb orb-1"></div>
        <div class="glow-orb orb-2"></div>
        <div class="grid-overlay"></div>
      </div>

      <div class="login-container">
        <!-- Logo & Branding Header -->
        <div class="brand-header">
          <div class="logo-mark">
            <svg viewBox="0 0 24 24" class="logo-svg" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="url(#loginLogoGrad)" />
              <defs>
                <linearGradient id="loginLogoGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#38bdf8" />
                  <stop offset="1" stop-color="#818cf8" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 class="brand-title">TaxPulse <span class="highlight">GST</span></h1>
          <p class="brand-subtitle">Automated GSTR-1 & Multi-Platform Reconciliation Suite</p>
        </div>

        <!-- Login Card -->
        <div class="login-card">
          <div class="card-header-badge">
            <span class="pulse-indicator"></span>
            <span>SECURE ENTERPRISE ACCESS</span>
          </div>

          <h2 class="welcome-heading">Welcome Back</h2>
          <p class="instruction-text">
            Sign in with your authorized Google Account to access GST filings, profiles, and return reconciliation modules.
          </p>

          <!-- Google Login Button -->
          <button class="google-login-btn" (click)="signInWithGoogle()">
            <svg class="google-icon" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span class="btn-text">Continue with Google</span>
          </button>

          <!-- Security Callout -->
          <div class="security-meta">
            <div class="meta-item">
              <i class="bi bi-shield-check"></i>
              <span>256-Bit SSL Encrypted</span>
            </div>
            <div class="meta-item">
              <i class="bi bi-check2-circle"></i>
              <span>Official OAuth 2.0 Verified</span>
            </div>
          </div>
        </div>

        <!-- Footer / Notice -->
        <div class="login-footer">
          <p>© 2026 TaxPulse GST Suite. All rights reserved.</p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .login-wrapper {
        min-height: 100vh;
        width: 100vw;
        background-color: #0b1120;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      }

      .background-decorations {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }

      .glow-orb {
        position: absolute;
        border-radius: 50%;
        filter: blur(120px);
        opacity: 0.25;
      }

      .orb-1 {
        width: 500px;
        height: 500px;
        background: #3b82f6;
        top: -100px;
        left: -100px;
      }

      .orb-2 {
        width: 450px;
        height: 450px;
        background: #6366f1;
        bottom: -80px;
        right: -80px;
      }

      .grid-overlay {
        position: absolute;
        inset: 0;
        background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
        background-size: 32px 32px;
      }

      .login-container {
        position: relative;
        z-index: 10;
        width: 100%;
        max-width: 460px;
        padding: 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .brand-header {
        text-align: center;
        margin-bottom: 28px;

        .logo-mark {
          width: 54px;
          height: 54px;
          border-radius: 14px;
          background: linear-gradient(135deg, #1e293b, #334155);
          border: 1px solid rgba(255, 255, 255, 0.15);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);

          .logo-svg {
            width: 32px;
            height: 32px;
          }
        }

        .brand-title {
          font-size: 26px;
          font-weight: 800;
          color: #f8fafc;
          letter-spacing: -0.5px;
          margin: 0;

          .highlight {
            color: #38bdf8;
          }
        }

        .brand-subtitle {
          color: #94a3b8;
          font-size: 13px;
          margin-top: 6px;
          margin-bottom: 0;
        }
      }

      .login-card {
        width: 100%;
        background: #111827;
        border: 1px solid #1f2937;
        border-radius: 16px;
        padding: 36px 32px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(16px);
      }

      .card-header-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 4px 10px;
        background: rgba(56, 189, 248, 0.1);
        border: 1px solid rgba(56, 189, 248, 0.25);
        border-radius: 9999px;
        color: #38bdf8;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.5px;
        margin-bottom: 18px;

        .pulse-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #38bdf8;
          box-shadow: 0 0 8px #38bdf8;
        }
      }

      .welcome-heading {
        font-size: 22px;
        font-weight: 700;
        color: #ffffff;
        margin-bottom: 8px;
      }

      .instruction-text {
        font-size: 13.5px;
        line-height: 1.55;
        color: #94a3b8;
        margin-bottom: 28px;
      }

      .google-login-btn {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        background-color: #ffffff;
        color: #1f2937;
        font-size: 15px;
        font-weight: 600;
        padding: 12px 20px;
        border-radius: 10px;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: all 0.2s ease-in-out;

        &:hover {
          background-color: #f1f5f9;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
        }

        &:active {
          transform: translateY(0);
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .google-icon {
          width: 22px;
          height: 22px;
        }
      }

      .security-meta {
        margin-top: 28px;
        padding-top: 20px;
        border-top: 1px solid #1f2937;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          color: #64748b;

          i {
            color: #10b981;
            font-size: 14px;
          }
        }
      }

      .login-footer {
        margin-top: 24px;
        color: #475569;
        font-size: 12px;
        text-align: center;
      }
    `,
  ],
})
export class LoginComponent {
  readonly auth = inject(AuthService);

  signInWithGoogle(): void {
    this.auth.loginWithGoogle();
  }
}
