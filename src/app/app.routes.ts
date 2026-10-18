import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { ProfilesComponent } from './features/profiles/profiles.component';
import { DashboardImportComponent } from './features/dashboard/dashboard-import/dashboard-import.component';
import { MyProfileComponent } from './features/user-profile/my-profile.component';
import { authGuard, loginGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [loginGuard],
  },
  {
    path: 'app/profiles',
    component: ProfilesComponent,
    canActivate: [authGuard],
  },
  {
    path: 'app/my-profile',
    component: MyProfileComponent,
    canActivate: [authGuard],
  },
  {
    path: 'app/dashboard/import',
    component: DashboardImportComponent,
    canActivate: [authGuard],
  },
  {
    path: 'dashboard/import',
    redirectTo: 'app/dashboard/import',
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];

