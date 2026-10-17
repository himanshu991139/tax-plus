import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-platform-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="logo-box" [attr.data-platform]="platform()">
      @switch (platform()) {
        @case ('meesho') {
          <div class="meesho-logo">
            <span class="letter">m</span>
          </div>
        }
        @case ('flipkart') {
          <div class="flipkart-logo">
            <svg viewBox="0 0 48 48" class="fk-svg">
              <!-- Yellow bag -->
              <path d="M12 14h24l-3 26H15L12 14z" fill="#FFE11B" />
              <!-- Bag handles -->
              <path d="M18 14V9a6 6 0 0 1 12 0v5" fill="none" stroke="#2874F0" stroke-width="3" stroke-linecap="round" />
              <!-- F letter -->
              <path d="M20 20h8v3h-5v4h4v3h-4v7h-3V20z" fill="#2874F0" />
            </svg>
          </div>
        }
        @case ('amazon') {
          <div class="amazon-logo">
            <div class="amazon-box">
              <span class="amazon-arrow">
                <svg viewBox="0 0 100 40" class="smile-svg">
                  <path d="M15 15 Q 50 38 85 15" fill="none" stroke="#111" stroke-width="5" stroke-linecap="round" />
                  <polygon points="85,15 76,14 83,7" fill="#FF9900" />
                </svg>
              </span>
            </div>
          </div>
        }
        @case ('amazon-b2b') {
          <div class="amazon-logo b2b">
            <div class="amazon-box">
              <span class="amazon-arrow">
                <svg viewBox="0 0 100 40" class="smile-svg">
                  <path d="M15 15 Q 50 38 85 15" fill="none" stroke="#111" stroke-width="5" stroke-linecap="round" />
                  <polygon points="85,15 76,14 83,7" fill="#FF9900" />
                </svg>
              </span>
            </div>
          </div>
        }
        @case ('myntra') {
          <div class="myntra-logo">
            <svg viewBox="0 0 50 40" class="myntra-svg">
              <path d="M5 32 L15 10 L25 24 L18 32 Z" fill="#EE5F73" />
              <path d="M18 32 L25 24 L32 32 Z" fill="#F26A35" />
              <path d="M25 24 L35 10 L45 32 L36 32 L30 24 Z" fill="#FF3F6C" />
            </svg>
          </div>
        }
        @case ('jiomart') {
          <div class="jiomart-logo">
            <div class="jio-badge">Jio</div>
            <div class="mart-badge">Mart</div>
          </div>
        }
        @case ('ajio') {
          <div class="ajio-logo">
            <span>AJIO</span>
          </div>
        }
        @case ('nykaa') {
          <div class="nykaa-logo">
            <span>NYKAA</span>
          </div>
        }
        @default {
          <div class="default-logo">
            <span>{{ platform().slice(0, 2).toUpperCase() }}</span>
          </div>
        }
      }
    </div>
  `,
  styles: [
    `
      .logo-box {
        width: 68px;
        height: 68px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 12px;
        border-radius: 12px;
        background: #ffffff;
      }

      .meesho-logo {
        width: 58px;
        height: 58px;
        background: #501d5d;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(80, 29, 93, 0.25);

        .letter {
          color: #ffffff;
          font-size: 34px;
          font-weight: 800;
          font-family: 'Inter', system-ui, sans-serif;
          line-height: 1;
          margin-top: -3px;
        }
      }

      .flipkart-logo {
        width: 58px;
        height: 58px;
        display: flex;
        align-items: center;
        justify-content: center;

        .fk-svg {
          width: 52px;
          height: 52px;
          filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.12));
        }
      }

      .amazon-logo {
        width: 58px;
        height: 58px;
        background: #f8dfbe;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #ebc69f;
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);

        &.b2b {
          background: #e6eef8;
          border-color: #cbd5e1;
        }

        .amazon-box {
          position: relative;
          width: 44px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;

          &::before {
            content: '';
            position: absolute;
            top: -12px;
            width: 14px;
            height: 10px;
            background: #479cd6;
            border-radius: 2px;
          }
        }

        .smile-svg {
          width: 38px;
          height: 20px;
        }
      }

      .myntra-logo {
        width: 58px;
        height: 58px;
        background: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;

        .myntra-svg {
          width: 52px;
          height: 42px;
          filter: drop-shadow(0 3px 6px rgba(238, 95, 115, 0.2));
        }
      }

      .jiomart-logo {
        width: 58px;
        height: 58px;
        background: #d92228;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(217, 34, 40, 0.25);
        color: #ffffff;
        font-family: 'Inter', sans-serif;
        font-weight: 700;
        line-height: 1.1;

        .jio-badge {
          font-size: 15px;
          letter-spacing: -0.2px;
        }

        .mart-badge {
          font-size: 11px;
          opacity: 0.95;
        }
      }

      .ajio-logo {
        width: 58px;
        height: 58px;
        background: #1e2430;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-weight: 800;
        font-size: 14px;
        letter-spacing: 0.8px;
      }

      .nykaa-logo {
        width: 58px;
        height: 58px;
        background: #fc2779;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-weight: 800;
        font-size: 13px;
        letter-spacing: 0.5px;
      }

      .default-logo {
        width: 58px;
        height: 58px;
        background: #f1f5f9;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #475569;
        font-weight: 700;
        font-size: 16px;
      }
    `,
  ],
})
export class PlatformLogoComponent {
  readonly platform = input.required<string>();
}
