import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './features/layout/header/header.component';
import { SidebarComponent } from './features/layout/sidebar/sidebar.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { ConstantConfigModalComponent } from './features/modals/constant-config-modal/constant-config-modal.component';
import { SupportWidgetComponent } from './features/modals/support-widget/support-widget.component';
import { ClientInfoModalComponent } from './features/modals/client-info-modal/client-info-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    ToastComponent,
    ConstantConfigModalComponent,
    SupportWidgetComponent,
    ClientInfoModalComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  title = 'TaxPulse GST Suite';
}
