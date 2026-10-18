import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

/**
 * Keeps already-authenticated users off public-only routes such as /login.
 * Checks the in-memory session first, then falls back to the backend
 * (which also picks up a ?token= in the URL or an existing JWT).
 */
export const loginGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Fast path: session already established in memory
  if (authService.currentUser()?.authenticated) {
    return router.parseUrl('/app/profiles');
  }

  // No in-memory session — ask the backend before allowing the login page.
  // On success (valid JWT or cookie session) redirect into the app; on any
  // error the user is genuinely signed out, so /login may proceed.
  return authService.checkAuthStatus().pipe(
    map((user) => {
      if (user && user.authenticated) {
        return router.parseUrl('/app/profiles');
      }
      return true;
    })
  );
};

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
