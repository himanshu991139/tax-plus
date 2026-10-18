import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If already authenticated in memory
  if (authService.currentUser()?.authenticated) {
    return true;
  }

  // Check auth status with backend (also reads token from URL or localStorage)
  return authService.checkAuthStatus().pipe(
    map((user) => {
      if (user && user.authenticated) {
        return true;
      }
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    })
  );
};
