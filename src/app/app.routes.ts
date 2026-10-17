import { Routes } from '@angular/router';
import { ProfilesComponent } from './features/profiles/profiles.component';
import { DashboardImportComponent } from './features/dashboard/dashboard-import/dashboard-import.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'app/profiles',
  },
  {
    path: 'app/profiles',
    component: ProfilesComponent,
  },
  {
    path: 'app/dashboard/import',
    component: DashboardImportComponent,
  },
  {
    path: 'dashboard/import',
    redirectTo: 'app/dashboard/import',
  },
  {
    path: '**',
    redirectTo: 'app/profiles',
  },
];
